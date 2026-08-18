import React from 'react';

/**
 * Entry screen for "Create Job" in the manager dashboard. Offers the three ways
 * to author a job — the manual form, the AI chat agent, or the AI voice agent.
 * The two agent options run the same flows used by /register-first-job.
 */
const OPTIONS = [
  {
    key: 'manual',
    title: 'Create Manually',
    description: 'Fill in the job form yourself — full control over every field.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    key: 'chat',
    title: 'Via Chat Agent',
    description: 'Answer a few questions in chat and the AI writes the posting for you.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    key: 'voice',
    title: 'Via Voice Agent',
    description: 'Describe the role out loud — the AI listens and captures the details.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    key: 'upload',
    title: 'Upload JD',
    description: 'Already have the job description? Upload it and the AI drafts the posting.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3m0 0-4 4m4-4 4 4" />
        <path strokeLinecap="round" d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
      </svg>
    ),
  },
];

const CreateJobOptions = ({ onSelect, onBack }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="flex items-center px-8 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 text-2xl text-gray-500 hover:text-blue-600 font-bold"
          aria-label="Back to jobs"
        >
          ←
        </button>
        <div className="text-3xl font-bold">Create Job</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            How would you like to create this job?
          </h2>
          <p className="text-gray-500 mb-10">
            Build the posting yourself, or let one of our AI agents do it with you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 text-left">
            {OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => onSelect(option.key)}
                className="group flex flex-col items-start gap-3 p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {option.icon}
                </span>
                <span className="text-lg font-semibold text-gray-900">{option.title}</span>
                <span className="text-sm text-gray-500 leading-relaxed">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobOptions;
