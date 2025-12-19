import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import InterviewResultsDashboard from "../Components/recruiter/dashboard/InterviewResultsDashboard";

const InterviewResults = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return <InterviewResultsDashboard meetingId={meetingId} onBack={handleBack} />;
};

export default InterviewResults;

