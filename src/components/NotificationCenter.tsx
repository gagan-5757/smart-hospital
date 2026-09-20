"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const API = "https://nexuscare-backend-nwd2.onrender.com/api";
const SOCKET_URL = "https://nexuscare-backend-nwd2.onrender.com";

type Severity =
  | "INFO"
  | "WARNING"
  | "CRITICAL";

type Notification = {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  isRead: boolean;
  createdAt: string;
};

type Toast = {
  id: string;
  title: string;
  message: string;
  severity: Severity;
};

export default function NotificationCenter() {
  const { user, ready } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [toasts, setToasts] =
    useState<Toast[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const panelRef =
    useRef<HTMLDivElement>(null);

  const socketRef =
    useRef<Socket | null>(null);

  async function loadNotifications() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/notifications`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Notification API failed"
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function markRead(
    id: string
  ) {
    try {
      const response =
        await fetch(
          `${API}/notifications/${id}/read`,
          {
            method: "PUT",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
        );
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification:",
        error
      );
    }
  }

  async function markAllRead() {
    try {
      const unread =
        notifications.filter(
          (notification) =>
            !notification.isRead
        );

      await Promise.all(
        unread.map(
          (notification) =>
            fetch(
              `${API}/notifications/${notification.id}/read`,
              {
                method: "PUT",
              }
            )
        )
      );

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications:",
        error
      );
    }
  }

  function showToast(
    notification: Notification
  ) {
    const toast: Toast = {
      id:
        `${notification.id}-toast-${Date.now()}`,
      title:
        notification.title,
      message:
        notification.message,
      severity:
        notification.severity,
    };

    setToasts(
      (current) => [
        toast,
        ...current,
      ].slice(0, 3)
    );

    setTimeout(() => {
      setToasts(
        (current) =>
          current.filter(
            (item) =>
              item.id !== toast.id
          )
      );
    }, 5000);
  }

  function dismissToast(
    id: string
  ) {
    setToasts(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  function getTimeAgo(
    date: string
  ) {
    const created =
      new Date(date).getTime();

    const difference =
      Date.now() - created;

    const minutes =
      Math.floor(
        difference / 60000
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    return `${days} day${
      days !== 1 ? "s" : ""
    } ago`;
  }

  function severityClass(
    severity: Severity
  ) {
    if (
      severity === "CRITICAL"
    ) {
      return (
        "border-red-200 bg-red-50 text-red-600"
      );
    }

    if (
      severity === "WARNING"
    ) {
      return (
        "border-amber-200 bg-amber-50 text-amber-600"
      );
    }

    return (
      "border-slate-200 bg-slate-50 text-slate-600"
    );
  }

  function toastClass(
    severity: Severity
  ) {
    if (
      severity === "CRITICAL"
    ) {
      return (
        "border-red-200 bg-white"
      );
    }

    if (
      severity === "WARNING"
    ) {
      return (
        "border-amber-200 bg-white"
      );
    }

    return (
      "border-slate-200 bg-white"
    );
  }

  function severityIcon(
    severity: Severity
  ) {
    if (
      severity === "CRITICAL"
    ) {
      return (
        <AlertTriangle size={18} />
      );
    }

    if (
      severity === "WARNING"
    ) {
      return (
        <AlertTriangle size={18} />
      );
    }

    return <Info size={18} />;
  }

  useEffect(() => {
    if (
      !ready ||
      !user
    ) {
      return;
    }

    loadNotifications();

    const interval =
      setInterval(
        loadNotifications,
        10000
      );

    return () => {
      clearInterval(interval);
    };
  }, [ready, user]);

  useEffect(() => {
    if (
      !ready ||
      !user
    ) {
      return;
    }

    const socket =
      io(SOCKET_URL, {
        transports: [
          "websocket",
          "polling",
        ],
      });

    socketRef.current =
      socket;

    socket.on(
      "connect",
      () => {
        console.log(
          "NexusCare realtime notifications connected"
        );

        loadNotifications();
      }
    );

    socket.on(
      "notification-created",
      (
        notification: Notification
      ) => {
        setNotifications(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  item.id ===
                  notification.id
              );

            if (exists) {
              return current;
            }

            return [
              notification,
              ...current,
            ];
          }
        );

        showToast(
          notification
        );
      }
    );

    socket.on(
      "request-created",
      () => {
        loadNotifications();
      }
    );

    socket.on(
      "emergency-request-created",
      () => {
        loadNotifications();
      }
    );

    socket.on(
      "lending-request-created",
      () => {
        loadNotifications();
      }
    );

    socket.on(
      "lending-status-updated",
      () => {
        loadNotifications();
      }
    );

    socket.on(
      "request-status-updated",
      () => {
        loadNotifications();
      }
    );

    socket.on(
      "resource-updated",
      () => {
        loadNotifications();
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "NexusCare realtime notifications disconnected"
        );
      }
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current =
        null;
    };
  }, [ready, user]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  if (
    !ready ||
    !user
  ) {
    return null;
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  return (
    <>
      {/* =====================================================
          REAL-TIME TOASTS
      ===================================================== */}

      <div
        className="
          fixed
          right-6
          top-20
          z-[10000]
          flex
          w-[390px]
          flex-col
          gap-3
        "
      >
        {toasts.map(
          (toast) => (
            <div
              key={toast.id}
              className={`
                rounded-2xl
                border
                p-4
                shadow-2xl
                ${toastClass(
                  toast.severity
                )}
              `}
            >
              <div className="flex gap-3">
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    ${severityClass(
                      toast.severity
                    )}
                  `}
                >
                  {severityIcon(
                    toast.severity
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-400
                        "
                      >
                        Network Alert
                      </p>

                      <h3
                        className="
                          mt-0.5
                          text-sm
                          font-semibold
                          text-slate-900
                        "
                      >
                        {toast.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        dismissToast(
                          toast.id
                        )
                      }
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-400
                        hover:bg-slate-100
                        hover:text-slate-700
                      "
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <p
                    className="
                      mt-1.5
                      text-xs
                      leading-5
                      text-slate-600
                    "
                  >
                    {toast.message}
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-1.5
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-emerald-700
                    "
                  >
                    Live network event
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* =====================================================
          NOTIFICATION CENTER
      ===================================================== */}

      <div
        ref={panelRef}
        className="
          fixed
          right-6
          top-6
          z-[9999]
        "
      >
        {/* BELL */}

        <button
          type="button"
          onClick={() => {
            setOpen(
              (current) => !current
            );

            if (!open) {
              loadNotifications();
            }
          }}
          aria-label="Notifications"
          className="
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-700
            shadow-sm
            transition
            hover:bg-slate-50
            hover:shadow-md
          "
        >
          <Bell
            size={19}
            strokeWidth={2}
          />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                bg-red-500
                px-1
                text-[10px]
                font-bold
                text-white
                ring-2
                ring-white
              "
            >
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </span>
          )}
        </button>

        {/* PANEL */}

        {open && (
          <div
            className="
              absolute
              right-0
              top-14
              w-[390px]
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-2xl
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-200
                px-5
                py-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Bell
                    size={17}
                    className="text-slate-700"
                  />

                  <h2
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    Notifications
                  </h2>
                </div>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Hospital network alerts
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* UNREAD */}

            {unreadCount > 0 && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  bg-slate-50
                  px-5
                  py-2.5
                "
              >
                <span
                  className="
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  {unreadCount} unread
                </span>

                <button
                  type="button"
                  onClick={
                    markAllRead
                  }
                  className="
                    text-xs
                    font-semibold
                    text-emerald-700
                    hover:text-emerald-800
                  "
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* LIST */}

            <div
              className="
                max-h-[440px]
                overflow-y-auto
              "
            >
              {loading &&
              notifications.length ===
                0 ? (
                <div className="px-5 py-12 text-center">
                  <div
                    className="
                      mx-auto
                      mb-3
                      h-6
                      w-6
                      animate-spin
                      rounded-full
                      border-2
                      border-slate-200
                      border-t-emerald-600
                    "
                  />

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length ===
                0 ? (
                <div
                  className="
                    px-6
                    py-12
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-100
                      text-slate-400
                    "
                  >
                    <Bell size={21} />
                  </div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    No notifications
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-400
                    "
                  >
                    Emergency alerts and
                    resource activity will
                    appear here.
                  </p>
                </div>
              ) : (
                notifications.map(
                  (notification) => {
                    const classes =
                      severityClass(
                        notification.severity
                      );

                    return (
                      <div
                        key={
                          notification.id
                        }
                        className={`
                          border-b
                          border-slate-100
                          px-5
                          py-4
                          transition
                          hover:bg-slate-50
                          ${
                            !notification.isRead
                              ? "bg-emerald-50/30"
                              : "bg-white"
                          }
                        `}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              ${classes}
                            `}
                          >
                            {severityIcon(
                              notification.severity
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <h3
                                className="
                                  text-sm
                                  font-semibold
                                  leading-5
                                  text-slate-800
                                "
                              >
                                {
                                  notification.title
                                }
                              </h3>

                              {!notification.isRead && (
                                <span
                                  className="
                                    mt-1
                                    h-2
                                    w-2
                                    shrink-0
                                    rounded-full
                                    bg-emerald-500
                                  "
                                />
                              )}
                            </div>

                            <p
                              className="
                                mt-1.5
                                text-xs
                                leading-5
                                text-slate-600
                              "
                            >
                              {
                                notification.message
                              }
                            </p>

                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                justify-between
                              "
                            >
                              <span
                                className="
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                {getTimeAgo(
                                  notification.createdAt
                                )}
                              </span>

                              {!notification.isRead && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markRead(
                                      notification.id
                                    )
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-md
                                    px-2
                                    py-1
                                    text-[11px]
                                    font-semibold
                                    text-slate-500
                                    hover:bg-slate-100
                                    hover:text-emerald-700
                                  "
                                >
                                  <Check
                                    size={12}
                                  />
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            {/* FOOTER */}

            <div
              className="
                border-t
                border-slate-200
                bg-slate-50
                px-5
                py-2.5
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                NexusCare Network Operations
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
