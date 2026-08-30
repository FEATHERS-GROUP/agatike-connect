import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { jwtVerify } from "jose";
import { SECRET } from "./auth"; // to see if there is a logged in user

export const recordHeartbeat = createServerFn({ method: "POST" })
  .validator(
    (d: { sessionId: string; path: string; userAgent: string; visibilityState: string }) => d,
  )
  .handler(async (ctx) => {
    const { sessionId, path, userAgent, visibilityState } = ctx.data;

    // Attempt to get user session to link it to an organizer or user
    let userId = "anonymous";
    let userType = "anonymous";

    const authCookie = getCookie("agatike_auth");
    const userToken = getCookie("agatike_user_auth");

    // Determine the context based on the path
    const isOrganizerPath = path.includes("/dashboard") || path.includes("/internal/control");

    async function verifyOrganizer() {
      if (authCookie) {
        try {
          const { payload } = await jwtVerify(authCookie, SECRET);
          if (payload) {
            userId = payload.sub as string;
            userType = payload.type as string;
            return true;
          }
        } catch (e) {}
      }
      return false;
    }

    async function verifyUser() {
      if (userToken) {
        try {
          const { payload } = await jwtVerify(userToken, SECRET);
          if (payload && payload.type === "user") {
            userId = payload.sub as string;
            userType = "user";
            return true;
          }
        } catch (e) {}
      }
      return false;
    }

    if (isOrganizerPath) {
      // Prioritize organizer token on organizer paths
      const isOrg = await verifyOrganizer();
      if (!isOrg) {
        await verifyUser();
      }
    } else {
      // Prioritize user token on public/user paths
      const isUsr = await verifyUser();
      if (!isUsr) {
        await verifyOrganizer();
      }
    }

    try {
      const { getFirebaseAdmin } = await import("@/lib/firebase.server");
      const { db } = getFirebaseAdmin();

      const sessionRef = db.collection("platform_telemetry").doc(sessionId);

      const doc = await sessionRef.get();
      const now = new Date().toISOString();

      if (!doc.exists) {
        await sessionRef.set({
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
        const data = doc.data() as any;
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

        await sessionRef.update({
          lastActive: now,
          durationSeconds: data.durationSeconds + addDuration,
          path,
          lastVisibility: visibilityState,
          userId, // Update user ID in case they logged in during session
          userType,
        });
      }

      // Probabilistic Garbage Collection: 1% chance to clean up old telemetry
      // Uses a simple orderBy + limit to avoid needing a composite index.
      if (Math.random() < 0.01) {
        Promise.resolve().then(async () => {
          try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            // Get all and filter in JS — avoids needing a Firestore index
            const allSnap = await db.collection("platform_telemetry").limit(2000).get();
            const batch = db.batch();
            let count = 0;
            allSnap.docs.forEach((doc: any) => {
              if (doc.data().lastActive < sevenDaysAgo) {
                batch.delete(doc.ref);
                count++;
              }
            });
            if (count > 0) await batch.commit();
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

    const now = Date.now();
    const eightDaysAgo = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch ALL telemetry docs (no range filter = no index needed)
    // Then filter in JS. For large collections this is acceptable since
    // GC keeps it trimmed to ~7 days of data.
    const snapshot = await db.collection("platform_telemetry").get();
    const allSessions: any[] = snapshot.docs
      .map((doc: any) => doc.data())
      .filter((s: any) => s.lastActive >= eightDaysAgo);

    // Partition today vs yesterday for comparison
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const todaySessions = allSessions.filter(
      (s) => new Date(s.lastActive).getTime() >= todayStart.getTime(),
    );
    const yesterdaySessions = allSessions.filter((s) => {
      const t = new Date(s.lastActive).getTime();
      return t >= yesterdayStart.getTime() && t < todayStart.getTime();
    });

    // --- Active Now (last 5 minutes) ---
    const activeSessions = todaySessions.filter(
      (s) => now - new Date(s.lastActive).getTime() < 5 * 60 * 1000,
    );
    const activeNowUsers = new Set(
      activeSessions.map((s) => (s.userId === "anonymous" ? s.sessionId : s.userId)),
    ).size;

    // --- Today totals ---
    const totalToday = todaySessions.length;
    const totalYesterday = yesterdaySessions.length;

    const totalDuration = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const avgDurationSeconds =
      todaySessions.length > 0 ? Math.floor(totalDuration / todaySessions.length) : 0;

    // --- User / Organizer / Anonymous breakdown for today ---
    const userBreakdown = todaySessions.reduce(
      (acc, s) => {
        if (s.userType === "organizer") acc.organizers++;
        else if (s.userType === "anonymous") acc.anonymous++;
        else acc.users++;
        return acc;
      },
      { users: 0, organizers: 0, anonymous: 0 },
    );

    // --- Distinct unique visitors today ---
    const uniqueVisitorsToday = new Set(
      todaySessions.map((s) => (s.userId === "anonymous" ? s.sessionId : s.userId)),
    ).size;
    const uniqueVisitorsYesterday = new Set(
      yesterdaySessions.map((s) => (s.userId === "anonymous" ? s.sessionId : s.userId)),
    ).size;

    // --- Hourly: today vs yesterday ---
    const todayHourly: Record<number, Set<string>> = {};
    const yesterdayHourly: Record<number, Set<string>> = {};
    for (let h = 0; h < 24; h++) {
      todayHourly[h] = new Set();
      yesterdayHourly[h] = new Set();
    }
    todaySessions.forEach((s) => {
      const h = new Date(s.lastActive).getHours();
      todayHourly[h].add(s.userId === "anonymous" ? s.sessionId : s.userId);
    });
    yesterdaySessions.forEach((s) => {
      const h = new Date(s.lastActive).getHours();
      yesterdayHourly[h].add(s.userId === "anonymous" ? s.sessionId : s.userId);
    });
    const hourlyComparison = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      today: todayHourly[h].size,
      yesterday: yesterdayHourly[h].size,
    }));

    // --- 7-Day Daily Trend ---
    const dailyMap: Record<
      string,
      { sessions: number; users: number; organizers: number; anonymous: number }
    > = {};
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now - d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyMap[key] = { sessions: 0, users: 0, organizers: 0, anonymous: 0 };
    }
    allSessions.forEach((s) => {
      const key = new Date(s.lastActive).toISOString().slice(0, 10);
      if (dailyMap[key]) {
        dailyMap[key].sessions++;
        if (s.userType === "organizer") dailyMap[key].organizers++;
        else if (s.userType === "anonymous") dailyMap[key].anonymous++;
        else dailyMap[key].users++;
      }
    });
    const dailyComparison = Object.entries(dailyMap).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...v,
    }));

    // --- Top 10 pages (today) ---
    const pathCount: Record<string, number> = {};
    todaySessions.forEach((s) => {
      try {
        const rawPath = new URL(s.path || "http://localhost").pathname;
        if (!rawPath.startsWith("/api") && !rawPath.includes(".")) {
          pathCount[rawPath] = (pathCount[rawPath] || 0) + 1;
        }
      } catch {
        const fallback = s.path?.replace(/^https?:\/\/[^/]+/, "") || "/";
        pathCount[fallback] = (pathCount[fallback] || 0) + 1;
      }
    });
    const topPaths = Object.entries(pathCount)
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // --- User type donut (today) ---
    const userTypeMap: Record<string, number> = {};
    todaySessions.forEach((s) => {
      const label =
        s.userType === "organizer"
          ? "Organizer"
          : s.userType === "anonymous"
            ? "Anonymous"
            : "User";
      userTypeMap[label] = (userTypeMap[label] || 0) + 1;
    });
    const userTypes = Object.entries(userTypeMap).map(([name, value]) => ({ name, value }));

    // --- Legacy hourly chart (today, for backwards compat) ---
    const hourlyUsers: Record<string, Set<string>> = {};
    todaySessions.forEach((s) => {
      const label = `${new Date(s.lastActive).getHours()}:00`;
      if (!hourlyUsers[label]) hourlyUsers[label] = new Set();
      hourlyUsers[label].add(s.userId === "anonymous" ? s.sessionId : s.userId);
    });
    const chart = Object.entries(hourlyUsers)
      .map(([time, set]) => ({ time, users: set.size }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time));

    // --- Recent 50 sessions ---
    const recentSessions = [...allSessions]
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
      .slice(0, 50);

    // --- Engagement ---
    const totalEngagedSessions = todaySessions.filter((s) => (s.durationSeconds || 0) > 30).length;
    const bounceRate =
      totalToday > 0 ? Math.round(((totalToday - totalEngagedSessions) / totalToday) * 100) : 0;

    return {
      activeNow: activeNowUsers,
      totalToday,
      totalYesterday,
      avgDurationSeconds,
      uniqueVisitorsToday,
      uniqueVisitorsYesterday,
      userBreakdown,
      hourlyComparison,
      dailyComparison,
      userTypes,
      topPaths,
      chart,
      recentSessions,
      bounceRate,
    };
  } catch (error) {
    console.error("Failed to fetch telemetry stats", error);
    return {
      activeNow: 0,
      totalToday: 0,
      totalYesterday: 0,
      avgDurationSeconds: 0,
      uniqueVisitorsToday: 0,
      uniqueVisitorsYesterday: 0,
      userBreakdown: { users: 0, organizers: 0, anonymous: 0 },
      hourlyComparison: [],
      dailyComparison: [],
      userTypes: [],
      topPaths: [],
      chart: [],
      recentSessions: [],
      bounceRate: 0,
    };
  }
});
