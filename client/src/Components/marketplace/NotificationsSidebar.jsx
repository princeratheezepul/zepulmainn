"use client";
import { X, User, AlertCircle } from "lucide-react";

const NotificationsSidebar = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      type: "candidate_submission",
      icon: <User className="h-5 w-5 text-gray-600" />,
      message:
        'Your candidate for "Frontend Developer - Swingz Telecom" was submitted successfully.',
      time: "13 hr",
      isUnread: true,
    },
    {
      id: 2,
      type: "candidate_shortlisted",
      icon: (
        <div className="w-5 h-5 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
          G
        </div>
      ),
      message:
        'Your candidate Meena R. has been shortlisted for "QA Analyst - CodeWave".',
      time: "13 hr",
      isUnread: true,
    },
    {
      id: 3,
      type: "deadline_reminder",
      icon: (
        <div className="w-5 h-5 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
          G
        </div>
      ),
      message:
        "Friendly reminder: The application deadline for the Product Designer role is just 24 hours away — review and shortlist candidates before it closes",
      time: "13 hr",
      isUnread: true,
    },
    {
      id: 4,
      type: "candidate_activity",
      icon: <User className="h-5 w-5 text-gray-600" />,
      message:
        "Candidate activity alert: Sharukh Khan's status has changed to 'Offer Sent' — keep an eye out for her response.",
      time: "13 hr",
      isUnread: true,
    },
    {
      id: 5,
      type: "offer_declined",
      icon: (
        <div className="relative">
          <User className="h-5 w-5 text-gray-600" />
          <AlertCircle className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
        </div>
      ),
      message:
        'Candidate Rahul S. declined the offer for "Backend Engineer - NexaTech".',
      time: "1 d",
      isUnread: false,
      isHighlighted: true,
    },
    {
      id: 6,
      type: "payment_received",
      icon: (
        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-semibold text-sm">₹</span>
        </div>
      ),
      message: "Great news! John Doe placed at ABC Tech Ltd. - ₹50,000 received.",
      time: "13 hr",
      isUnread: false,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-full sm:w-1/2`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Mark as read
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                notification.isHighlighted ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Unread indicator */}
                {notification.isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                )}

                {/* Icon */}
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsSidebar;
