import React, { useState, useEffect } from "react";
import { Calendar, Clock, Video, Edit2, X, RefreshCw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getApiUrl } from "../../../config/config";

const MeetingManagement = ({ resumeId, jobId }) => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", duration: 40 });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [meetingToReschedule, setMeetingToReschedule] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, [resumeId, jobId]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) return;

      const params = new URLSearchParams();
      if (resumeId) params.append("resumeId", resumeId);
      if (jobId) params.append("jobId", jobId);

      const response = await fetch(getApiUrl(`/api/meetings/recruiter/meetings?${params}`), {
        headers: {
          Authorization: `Bearer ${userInfo.data.accessToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (meeting) => {
    setMeetingToReschedule(meeting);
    setRescheduleData({
      date: new Date(meeting.scheduledAt).toISOString().slice(0, 16),
      duration: meeting.durationMinutes || 40,
    });
    setShowRescheduleModal(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !meetingToReschedule) {
      toast.error("Please select a new date and time");
      return;
    }

    try {
      setRescheduling(meetingToReschedule.token);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const scheduledAt = new Date(rescheduleData.date).toISOString();

      const response = await fetch(
        getApiUrl(`/api/meetings/${meetingToReschedule.token}/reschedule`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.data.accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            scheduledAt,
            durationMinutes: Number(rescheduleData.duration) || 40,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Meeting rescheduled successfully");
        setRescheduleData({ date: "", duration: 40 });
        setShowRescheduleModal(false);
        setMeetingToReschedule(null);
        fetchMeetings();
      } else {
        toast.error(data.message || "Failed to reschedule meeting");
      }
    } catch (error) {
      console.error("Error rescheduling meeting:", error);
      toast.error("Failed to reschedule meeting");
    } finally {
      setRescheduling(null);
    }
  };

  const handleCancel = async (meetingToken) => {
    if (!confirm("Are you sure you want to cancel this meeting? The candidate will be notified.")) {
      return;
    }

    try {
      setCanceling(meetingToken);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const response = await fetch(getApiUrl(`/api/meetings/${meetingToken}/cancel`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.data.accessToken}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Meeting canceled successfully");
        fetchMeetings();
      } else {
        toast.error(data.message || "Failed to cancel meeting");
      }
    } catch (error) {
      console.error("Error canceling meeting:", error);
      toast.error("Failed to cancel meeting");
    } finally {
      setCanceling(null);
    }
  };

  const handleViewResults = (meetingId) => {
    navigate(`/recruiter/interview-results/${meetingId}`);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <div className="animate-pulse">Loading meetings...</div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return null;
  }

  return (
    <div className="p-6 border rounded-xl bg-gray-50 mb-8">
      <div className="text-lg font-bold text-black mb-6">AI Interview Meetings</div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      meeting.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : meeting.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : meeting.status === "scheduled"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </span>
                  {meeting.status === "completed" && (
                    <button
                      onClick={() => handleViewResults(meeting.id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Results
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" • "}
                    {meeting.durationMinutes} min
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <a
                      href={`${window.location.origin}/meeting/${meeting.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Meeting Link
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {meeting.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => openRescheduleModal(meeting)}
                      disabled={rescheduling === meeting.token}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Reschedule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(meeting.token)}
                      disabled={canceling === meeting.token}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                {meeting.status === "active" && (
                  <button
                    onClick={() => handleCancel(meeting.token)}
                    disabled={canceling === meeting.token}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && meetingToReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reschedule Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleData.date}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, date: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={rescheduleData.duration}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, duration: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleData.date}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {rescheduling ? "Rescheduling..." : "Reschedule"}
              </button>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setMeetingToReschedule(null);
                  setRescheduleData({ date: "", duration: 40 });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingManagement;

