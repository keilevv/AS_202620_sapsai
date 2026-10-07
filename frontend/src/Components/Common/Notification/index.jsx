"use client";
import { createContext, useEffect, useState, Fragment } from "react";
import { Transition } from "@headlessui/react";
import {
  FaWindowClose,
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

// Context
const NotificationContext = createContext(undefined);

// Helper function to show notifications from anywhere
export function showNotification(props) {
  // This is a workaround since we can't use hooks outside of components
  const event = new CustomEvent("show-notification", { detail: props });
  window.dispatchEvent(event);
}

// Individual notification component
function NotificationItem({
  id = "",
  type = "default",
  title = "",
  message = "",
  duration = 5000,
  onClose,
  onClick,
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    default: <FaInfoCircle className="h-5 w-5" />,
    success: <FaCheckCircle className="h-5 w-5" />,
    error: <FaExclamationCircle className="h-5 w-5" />,
    warning: <FaExclamationTriangle className="h-5 w-5" />,
  };

  const styles = {
    default: "bg-gray-100 border-gray-200 text-gray-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconStyles = {
    default: "text-gray-500",
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
  };

  return (
    <Transition
      as={Fragment}
      show={true}
      appear={true}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transform ease-in duration-300 transition"
      leaveFrom="translate-y-0 opacity-100 sm:translate-x-0"
      leaveTo="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    >
      <div
        onClick={onClick}
        className={`pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-md ${styles[type]}`}
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${iconStyles[type]}`}>
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && <h3 className="font-medium">{title}</h3>}
            <p className="mt-1 text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 inline-flex flex-shrink-0 rounded-md p-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <FaWindowClose className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Transition>
  );
}

// Main notification container component
export function Notification() {
  const [notificationsState, setNotificationsState] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleShowNotification = (event) => {
      const notification = event.detail;
      const id = Math.random().toString(36).substring(2, 9);
      setNotificationsState((prev) => [...prev, { ...notification, id }]);

      if (notification.duration !== 0) {
        setTimeout(() => {
          setNotificationsState((prev) => prev.filter((n) => n.id !== id));
        }, notification.duration || 5000);
      }
    };

    window.addEventListener("show-notification", handleShowNotification);

    return () => {
      window.removeEventListener("show-notification", handleShowNotification);
    };
  }, []);

  if (!mounted) return null;

  const removeNotification = (id) => {
    setNotificationsState((prev) => prev.filter((n) => n.id !== id));
  };

  // Group notifications by position
  const notificationsByPosition = {
    "top-right": [],
    "top-left": [],
    "bottom-right": [],
    "bottom-left": [],
    "top-center": [],
    "bottom-center": [],
  };

  notificationsState.forEach((notification) => {
    const position = notification.position || "top-right";
    notificationsByPosition[position].push(notification);
  });

  const positionStyles = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  };

  return (
    <>
      {Object.entries(notificationsByPosition).map(
        ([position, notifications]) => {
          if (notifications.length === 0) return null;

          return (
            <div
              key={position}
              className={` min-w-[300px] max-w-sm md:max-w-md fixed z-50 flex flex-col gap-2 p-4 max-h-screen overflow-hidden pointer-events-none ${positionStyles[position]}`}
            >
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onClose={() => removeNotification(notification.id || "")}
                />
              ))}
            </div>
          );
        }
      )}
    </>
  );
}

// Helper function to create a notification with preset type
export const notify = {
  default: (message, options = {}) =>
    showNotification({ message, type: "default", ...options }),
  success: (message, options = {}) =>
    showNotification({ message, type: "success", ...options }),
  error: (message, options = {}) =>
    showNotification({ message, type: "error", ...options }),
  warning: (message, options = {}) =>
    showNotification({ message, type: "warning", ...options }),
};
