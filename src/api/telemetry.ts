import { createServerFn } from "@tanstack/react-start";
import { getSession } from "./auth"; // to see if there is a logged in user

export const recordHeartbeat = createServerFn({ method: "POST" })
  .validator(
    (d: { sessionId: string; path: string; userAgent: string; visibilityState: string }) => d,
  )
  .handler(async (ctx) => {
    const { sessionId, path, userAgent, visibilityState } = ctx.data;

    // Attempt to get user session to link it to an organizer or user
    const session = await getSession().catch(() => null);
    const userId = session?.sub || "anonymous";
    const userType = session?.type || "anonymous";

    try {
      const { getFirebaseAdmin } = await import("@/lib/firebase.server");
      const { db } = getFirebaseAdmin();

      const sessionRef = db.collection("platform_telemetry").doc(sessionId);

      await db.runTransaction(async (t: any) => {
        const doc = await t.get(sessionRef);
        const now = new Date().toISOString();

        if (!doc.exists) {
          t.set(sessionRef, {
            sessionId,
            userId,
            userType,
            startTime: now,
            lastActive: now,
            durationSeconds: 0,
            path,
            userAgent,
            lastVisibility: visibilityState,
          });
        } else {
          const data = doc.data();
          const lastActiveDate = new Date(data.lastActive);
          const currentDate = new Date(now);

          // Calculate seconds elapsed since last heartbeat
          const secondsElapsed = Math.floor(
            (currentDate.getTime() - lastActiveDate.getTime()) / 1000,
          );

          // Only add to duration if it's a reasonable heartbeat interval (e.g. less than 5 minutes)
          // to avoid huge spikes if tab was suspended and restored.
          const addDuration =
            secondsElapsed > 0 && secondsElapsed < 300 && visibilityState === "visible"
              ? secondsElapsed
              : 0;

          t.update(sessionRef, {
            lastActive: now,
            durationSeconds: data.durationSeconds + addDuration,
            path,
            lastVisibility: visibilityState,
            userId, // Update user ID in case they logged in during session
            userType,
          });
        }
      });

      // Probabilistic Garbage Collection: 1% chance to clean up old telemetry
      // This prevents the Firebase collection from growing indefinitely.
      if (Math.random() < 0.01) {
        // Run asynchronously so we don't block the heartbeat response
        Promise.resolve().then(async () => {
          try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const oldSnapshot = await db
              .collection("platform_telemetry")
              .where("lastActive", "<", sevenDaysAgo)
              .limit(500)
              .get();
              
            if (!oldSnapshot.empty) {
              const batch = db.batch();
              oldSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
              await batch.commit();
            }
          } catch (e) {
            console.error("Telemetry cleanup error", e);
          }
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to record telemetry heartbeat", error);
      return { success: false };
    }
  });

export const getTelemetryStats = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { getFirebaseAdmin } = await import("@/lib/firebase.server");
    const { db } = getFirebaseAdmin();

    // Get all telemetry from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const snapshot = await db
      .collection("platform_telemetry")
      .where("lastActive", ">=", yesterday)
      .get();

    const sessions = snapshot.docs.map((doc: any) => doc.data());

    const now = Date.now();

    // Active in last 5 minutes
    const activeSessions = sessions.filter((s: any) => {
      return now - new Date(s.lastActive).getTime() < 5 * 60 * 1000;
    });

    const activeNowUsers = new Set(
      activeSessions.map((s: any) => (s.userId === "anonymous" ? s.sessionId : s.userId)),
    ).size;

    // Calculate averages and stats
    const totalDuration = sessions.reduce(
      (acc: number, s: any) => acc + (s.durationSeconds || 0),
      0,
    );
    const avgDurationSeconds =
      sessions.length > 0 ? Math.floor(totalDuration / sessions.length) : 0;

    // Group by hours for chart
    const hourlyUsers: Record<string, Set<string>> = {};
    const userTypeCount: Record<string, number> = {};
    const pathCount: Record<string, number> = {};

    sessions.forEach((s: any) => {
      const hour = new Date(s.lastActive).getHours();
      const label = `${hour}:00`;
      
      if (!hourlyUsers[label]) hourlyUsers[label] = new Set();
      hourlyUsers[label].add(s.userId === "anonymous" ? s.sessionId : s.userId);

      // User Types
      const type = s.userType === "anonymous" ? "Anonymous" : "Registered";
      userTypeCount[type] = (userTypeCount[type] || 0) + 1;

      // Clean Path
      try {
        const rawPath = new URL(s.path || "http://localhost").pathname;
        // Filter out API and assets
        if (!rawPath.startsWith("/api") && !rawPath.includes(".")) {
          pathCount[rawPath] = (pathCount[rawPath] || 0) + 1;
        }
      } catch (e) {
        const fallback = s.path?.replace(/^https?:\/\/[^\/]+/, "") || "/";
        pathCount[fallback] = (pathCount[fallback] || 0) + 1;
      }
    });

    const chart = Object.keys(hourlyUsers)
      .map((key) => ({
        time: key,
        users: hourlyUsers[key].size,
      }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time));

    const userTypes = Object.keys(userTypeCount).map((key) => ({
      name: key,
      value: userTypeCount[key],
    }));

    const topPaths = Object.keys(pathCount)
      .map((key) => ({
        path: key,
        visits: pathCount[key],
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Recent 50 sessions for table
    const recentSessions = sessions
      .sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
      .slice(0, 50);

    return {
      activeNow: activeNowUsers,
      totalToday: sessions.length,
      avgDurationSeconds,
      chart,
      userTypes,
      topPaths,
      recentSessions,
    };
  } catch (error) {
    console.error("Failed to fetch telemetry stats", error);
    return {
      activeNow: 0,
      totalToday: 0,
      avgDurationSeconds: 0,
      chart: [],
      userTypes: [],
      topPaths: [],
      recentSessions: [],
    };
  }
});
