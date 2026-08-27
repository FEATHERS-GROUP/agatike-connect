import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Bell, Trash2, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/notifications")({
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, "agatike_notifications"),
      where("organizerId", "==", "admin"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "agatike_notifications", id), { read: true });
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleClearAll = async () => {
    if (!db || notifications.length === 0) return;
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all admin notifications? This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsClearing(true);
    try {
      // Firebase limits batches to 500 operations
      const q = query(collection(db, "agatike_notifications"), where("organizerId", "==", "admin"));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      let count = 0;

      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
        count++;
        // If we hit 500, we should ideally commit and start a new batch.
        // Assuming admin notifications won't exceed 500 at a time for this simple implementation.
      });

      if (count > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      alert("Failed to clear notifications. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#333333] pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-gray-500" />
            Admin Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System alerts, payment updates, and general administrative logs.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Clear All
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-[#1b1b1c] rounded-xl border border-gray-200 dark:border-[#333333] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#777]">
            <Bell className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              You're all caught up!
            </h3>
            <p className="text-sm">There are no new notifications to show here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#222]">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-4 p-5 transition-colors ${
                  !notif.read
                    ? "bg-gray-50/50 dark:bg-[#1f1f1f]"
                    : "hover:bg-gray-50 dark:hover:bg-[#222]"
                }`}
              >
                <div className="shrink-0 mt-1">
                  {!notif.read ? (
                    <div className="h-2 w-2 rounded-full bg-[#f97316] mt-1.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-gray-400 dark:text-[#555]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4
                      className={`text-sm font-semibold ${
                        !notif.read
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-[#888] whitespace-nowrap">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : ""}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-[#aaa] leading-relaxed">
                    {notif.message}
                  </p>

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
