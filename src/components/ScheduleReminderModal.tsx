import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ScheduleReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCount: number;
}

export default function ScheduleReminderModal({ isOpen, onClose, showCount }: ScheduleReminderModalProps) {
  if (!isOpen) return null;

  const isThirdTime = showCount >= 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">Schedule Interviews</h3>
          
          <p className="text-gray-600">
            Please schedule interviews with staff to avoid double-booking them with other clients.
          </p>

          <button
            onClick={onClose}
            className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {isThirdTime ? "I understood, don't show again" : "Understood"}
          </button>
        </div>
      </div>
    </div>
  );
}