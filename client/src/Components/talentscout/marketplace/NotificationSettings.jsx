"use client";

import { useState } from "react";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Job Assigned by Zepul Manager",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel...",
      enabled: true,
    },
    {
      id: "2",
      title: "Candidate Accepted by Zepul Admin",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel...",
      enabled: true,
    },
    {
      id: "3",
      title: "Interview Scheduled",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel...",
      enabled: true,
    },
    {
      id: "4",
      title: "Offer Extended",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel...",
      enabled: false,
    },
    {
      id: "5",
      title: "Broadcast Messages from Zepul",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel...",
      enabled: true,
    },
  ]);

  const toggleNotification = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto bg-white min-h-full">
        <div className="mb-1">
          <div class="bg-white border-b border-gray-200 px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="text-xl font-bold text-gray-900">Notification</div>
            </div>
          </div>
          <div className="text-gray-600 leading-relaxed p-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
            at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a
            in molestie et risus pulvinar orci vel...
          </div>
        </div>

        <div className="space-y-6 px-6">
          {notifications.map((notification) => (
            <div key={notification.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Notification from us
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {notification.description}
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => toggleNotification(notification.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notification.enabled ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notification.enabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        notification.enabled ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {notification.enabled ? "Yes" : "NO"}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      Get News about product and feature updates.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
