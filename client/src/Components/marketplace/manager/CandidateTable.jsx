import React from 'react';
import CandidateRow from './CandidateRow';

const CandidateTable = () => {
  const candidates = [
    {
      id: 1,
      name: 'Michael Singh',
      email: 'Michael.singh@gmail.com',
      contact: '+91 98765 43210',
      status: 'Received',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Singh',
      email: 'Michael.singh@gmail.com',
      contact: '+91 98765 43210',
      status: 'Received',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Michael Singh',
      email: 'Michael.singh@gmail.com',
      contact: '+91 98765 43210',
      status: 'Received',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Michael Singh',
      email: 'Michael.singh@gmail.com',
      contact: '+91 98765 43210',
      status: 'Received',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Michael Singh',
      email: 'Michael.singh@gmail.com',
      contact: '+91 98765 43210',
      status: 'Received',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-2 font-semibold text-gray-900">Candidate Name</th>
            <th className="text-left py-4 px-2 font-semibold text-gray-900">Email</th>
            <th className="text-left py-4 px-2 font-semibold text-gray-900">Contact</th>
            <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
            <th className="text-left py-4 px-2 font-semibold text-gray-900">Quick Action</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <CandidateRow key={candidate.id} candidate={candidate} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;
