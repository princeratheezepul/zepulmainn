import React from 'react';
import { Edit, Trash2, Archive } from 'lucide-react';

const JobMenuOverlay = ({ isOpen, onClose, onEdit, onDelete, onArchive, position }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
        style={{
          top: position?.top || 0,
          left: position?.left || 0,
        }}
      >
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        
        <button
          onClick={() => {
            onArchive();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Archive className="w-4 h-4" />
          Archive
        </button>
        
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </>
  );
};

export default JobMenuOverlay;
