import { X, AlertCircle } from 'lucide-react';

interface SuspensionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function SuspensionWarningModal({ isOpen, onClose, onContinue }: SuspensionWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Important Notice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <AlertCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4 text-center">
              After suspending an employee, you will need to contact customer support to rehire or unsuspend them due to our review process.
            </p>
            <p className="text-gray-700 mb-4 text-center">
              This is required for all suspensions as part of our quality control procedures.
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 