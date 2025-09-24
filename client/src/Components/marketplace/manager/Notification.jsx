import { useState } from "react";
import SettingsSidebar from './SettingsSidebar';

const NotificationPage = ({ onClose, onNavigateToProfile, onLogout }) => {
  const [notifications, setNotifications] = useState({
    newJobPicked: true,
    candidateApplied: true,
    candidateSelected: true,
    jobExpiryReminder: false,
    candidateRejected: true,
    interviewScheduled: true,
  });

  const handleToggle = (notificationType) => {
    setNotifications((prev) => ({
      ...prev,
      [notificationType]: !prev[notificationType],
    }));
  };

  const notificationItems = [
    {
      id: "newJobPicked",
      title: "New Job Picked by Licensed Partner",
      description: "Get News about product and feature updates.",
    },
    {
      id: "candidateApplied",
      title: "Candidate Applied",
      description: "Get News about product and feature updates.",
    },
    {
      id: "candidateSelected",
      title: "Candidate Selected",
      description: "Get News about product and feature updates.",
    },
    {
      id: "jobExpiryReminder",
      title: "Job Expiry Reminder",
      description: "Get News about product and feature updates.",
    },
    {
      id: "candidateRejected",
      title: "Candidate Rejected",
      description: "Get News about product and feature updates.",
    },
    {
      id: "interviewScheduled",
      title: "Interview Scheduled",
      description: "Get News about product and feature updates.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <SettingsSidebar 
        activeTab="notification"
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotification={() => {}} // Already on notification
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900">Notification</div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {/* Description */}
          <div className="mb-3">
            <div className="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque at velit. Ipsum turpis scelerisque facilisi nisl.
              Arcu ullamcorper a in molestie et risus pulvinar orci vel...
            </div>
          </div>

          {/* Notification Items */}
          <div className="space-y-8">
            {notificationItems.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-200 pb-2 mb-2 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  {/* Left Side - Notification from us */}
                  <div className="flex-1 max-w-md">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      Notification from us
                    </div>
                    <div className="text-gray-600 leading-relaxed text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Pellentesque at velit. Ipsum turpis scelerisque facilisi nisl.
                      Arcu ullamcorper a in molestie et risus pulvinar orci vel...
                    </div>
                  </div>

                  {/* Right Side - Toggle and Details */}
                  <div className="flex items-center space-x-4 ml-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center space-x-2">
                      <div
                        onClick={() => handleToggle(item.id)}
                        className={`relative inline-flex h-5 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          notifications[item.id]
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[item.id]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          notifications[item.id]
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {notifications[item.id] ? "Yes" : "No"}
                      </span>
                    </div>

                    {/* Notification Details */}
                    <div className="text-right max-w-xs">
                      <div className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
