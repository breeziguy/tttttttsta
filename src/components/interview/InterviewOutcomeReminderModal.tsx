import { X } from 'lucide-react';

interface InterviewOutcomeReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewOutcomeReminderModal({ isOpen, onClose }: InterviewOutcomeReminderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-blue-100 p-3"> {/* Changed icon color to blue for differentiation */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">Next Steps</h3>
          
          <p className="text-gray-600">
            Please select the interview outcome: “Hire Employee” or  “Unsuccessful”  to finalize decisions accurately.
          </p>

          <button
            onClick={onClose}
            className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
} 