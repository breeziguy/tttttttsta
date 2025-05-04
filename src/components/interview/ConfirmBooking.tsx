import { useState } from 'react';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import toast from 'react-hot-toast';

interface ConfirmBookingProps {
  staffId: string;
  staffName: string;
  selectedDate: Date;
  onBack: () => void;
}

export default function ConfirmBooking({
  staffId,
  staffName,
  selectedDate,
  onBack,
}: ConfirmBookingProps) {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { error: interviewError } = await supabase
        .from('staff_interviews')
        .insert({
          client_id: profile.id,
          staff_id: staffId,
          scheduled_date: selectedDate.toISOString(),
          status: 'scheduled'
        });

      if (interviewError) throw interviewError;

      toast.success('Interview scheduled successfully!');
      navigate('/dashboard/schedule');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Confirm Interview</h2>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Return
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>
                {selectedDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Details</h3>
          <p className="text-gray-600">{staffName}</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard/discover')}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => navigate('/dashboard/schedule')}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            View Interviews
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Confirm Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}