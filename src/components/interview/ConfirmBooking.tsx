import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, MapPin, Briefcase, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import toast from 'react-hot-toast';
import InterviewOutcomeReminderModal from './InterviewOutcomeReminderModal';

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
  const [staffDetails, setStaffDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [showOutcomeReminder, setShowOutcomeReminder] = useState(false);

  // Fetch more employee details to display
  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setDetailsLoading(true);
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('id', staffId as any)
          .single();

        if (error) throw error;
        setStaffDetails(data);
      } catch (err) {
        console.error('Error fetching staff details:', err);
      } finally {
        setDetailsLoading(false);
      }
    };
    
    fetchStaffDetails();
  }, [staffId]);

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
        } as any);

      if (interviewError) throw interviewError;

      toast.success('Interview scheduled successfully!');
      setShowOutcomeReminder(true);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const handleReminderClose = () => {
    setShowOutcomeReminder(false);
    navigate('/dashboard/schedule');
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Details</h3>
          
          {detailsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : staffDetails ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-900 font-medium">{staffDetails.name}</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {staffDetails.level || 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>Role: {staffDetails.role || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Location: {staffDetails.location || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span>Experience: {staffDetails.experience || 'N/A'} years</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>Marital Status: {staffDetails.marital_status || 'N/A'}</span>
                </div>
                
                {staffDetails.children_count !== null && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Children: {staffDetails.children_count}</span>
                  </div>
                )}
                
                {staffDetails.salary && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Salary:</span>
                    <span>₦{formatNumber(staffDetails.salary)}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
          <p className="text-gray-600">{staffName}</p>
          )}
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
      <InterviewOutcomeReminderModal
        isOpen={showOutcomeReminder}
        onClose={handleReminderClose}
      />
    </div>
  );
}