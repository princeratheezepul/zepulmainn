import axios from 'axios';
import Resume from '../models/resume.model.js';

// @desc Invite candidate to HackerRank OA
export const inviteCandidate = async (req, res) => {
  try {
    const { testId, candidateEmail, candidateName, resumeId } = req.body;
    
    console.log("Invite Candidate Request Received:", req.body);

    if (!testId || !candidateEmail || !candidateName || !resumeId) {
      console.error("Missing required fields:", { testId, candidateEmail, candidateName, resumeId });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const apiKey = process.env.HACKERRANK_API_KEY;
    
    // MOCK RESPONSE FOR TESTING IF NO KEY IS PRESENT
    if (!apiKey) {
      console.warn("No HACKERRANK_API_KEY found. Using mock response.");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResponse = {
        data: {
          id: "mock_test_id",
          test_link: "https://www.hackerrank.com/tests/mock_test_id/login?b=mock_batch_id"
        }
      };

      // Update Resume with OA details
      const updatedResume = await Resume.findByIdAndUpdate(
        resumeId,
        {
          oa: {
            scheduled: true,
            testId: testId,
            status: 'invited',
            inviteDate: new Date(),
            reportUrl: mockResponse.data.test_link
          }
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Candidate invited successfully (MOCK)",
        data: mockResponse.data,
        resume: updatedResume
      });
    }

    // Call HackerRank API
    // Documentation: https://www.hackerrank.com/work/apidocs#!/tests/post_tests_test_id_candidates
    const response = await axios.post(
      `https://www.hackerrank.com/x/api/v3/tests/${testId}/candidates`,
      {
        full_name: candidateName,
        email: candidateEmail,
        force_reuse: true // Optional: allows re-inviting same email
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update Resume with OA details
    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      {
        oa: {
          scheduled: true,
          testId: testId,
          status: 'invited',
          inviteDate: new Date(),
          reportUrl: response.data.test_link // Assuming API returns this, or we construct it
        }
      },
      { new: true }
    );

    res.status(200).json({
      message: "Candidate invited successfully",
      data: response.data,
      resume: updatedResume
    });

  } catch (error) {
    console.error("Error inviting candidate to HackerRank:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Failed to invite candidate", 
      error: error.response?.data || error.message 
    });
  }
};
