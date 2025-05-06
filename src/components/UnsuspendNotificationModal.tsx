import { X, AlertCircle, PhoneCall } from 'lucide-react';

interface UnsuspendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnsuspendNotificationModal({ isOpen, onClose }: UnsuspendNotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Contact Customer Support</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <PhoneCall className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4 text-center">
              To unsuspend this employee, you need to contact customer support directly.
            </p>
            <p className="text-gray-700 mb-4 text-center">
              Due to our investigation and review process, unsuspending employees requires verification from our support team.
            </p>
            <p className="text-gray-700 mb-4 text-center font-medium">
              Please call our support line at 0-800-FGS or email support@fgs.com
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 