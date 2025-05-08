import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Calendar, Clock, MapPin, X, Check, AlertCircle, ChevronRight, Star, Users, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import VerifiedIcon from '../../components/VerifiedIcon';
import SuspensionWarningModal from '../../components/FeedbackSuspensionModal';
import UnsuspendNotificationModal from '../../components/UnsuspendNotificationModal';

interface HiredStaff {
  id: string;
  staff: {
    id: string;
    name: string;
    email: string;
    role: string;
    image_url: string | null;
    staff_id: string;
    level: string;
    verified: boolean;
    location: string;
  };
  start_date: string;
  end_date?: string;
  status: string;
  action_status?: 'dismissed' | 'suspended'; // Track the last action on the employee
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, rating: number, action: 'hire' | 'reject' | 'dismiss' | 'suspend') => Promise<void>;
  type: 'hire' | 'reject' | 'dismiss' | 'suspend';
}

function FeedbackModal({ isOpen, onClose, onSubmit, type }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(feedback, rating, type);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {type === 'hire' ? 'Hire Employee' : 
             type === 'reject' ? 'Reject Employee' :
             type === 'dismiss' ? 'Dismiss Employee' :
             'Suspend Employee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="mt-1 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`p-2 rounded-full ${
                    rating >= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                >
                  <Star size={20} fill={rating >= value ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {type === 'dismiss' ? 'Reason for Dismissal' : 
               type === 'suspend' ? 'Reason for Suspension' : 
               'Feedback'}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder={type === 'dismiss' ? "Please provide the reason for dismissal..." : 
                          type === 'suspend' ? "Please provide the reason for suspension..." :
                          "Please provide your feedback..."}
              required
            />
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
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                type === 'hire'
                  ? 'bg-green-500 hover:bg-green-600'
                  : type === 'suspend'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } disabled:opacity-50`}
            >
              {loading ? 'Submitting...' : 
               type === 'hire' ? 'Confirm Hire' : 
               type === 'reject' ? 'Confirm Reject' :
               type === 'dismiss' ? 'Confirm Dismissal' :
               'Confirm Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface StaffDetailsModalProps {
  staff: HiredStaff;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'hire' | 'reject' | 'dismiss' | 'suspend') => void;
}

function StaffDetailsModal({ staff, isOpen, onClose, onAction }: StaffDetailsModalProps) {
  if (!isOpen || !staff.staff) return null;

  // Determine if staff is already suspended
  const isSuspended = staff.action_status === 'suspended';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {staff.staff.image_url ? (
                <img
                  src={staff.staff.image_url}
                  alt={staff.staff.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl font-medium text-gray-600">
                    {staff.staff.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xl font-bold text-gray-900">{staff.staff.name}</h3>
                    <VerifiedIcon verified={staff.staff.verified} />
                  </div>
                  <p className="text-gray-600">{staff.staff.email}</p>
                  <p className="text-gray-600">{staff.staff.role}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {staff.staff.level}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <span>{staff.staff.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>
                    Hire Date:{' '}
                    {new Date(staff.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {staff.end_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} />
                    <span>
                      End Date:{' '}
                      {new Date(staff.end_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>
                    Status: {staff.status}
                    {staff.action_status && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        staff.action_status === 'dismissed' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {staff.action_status.charAt(0).toUpperCase() + staff.action_status.slice(1)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <p className="text-sm text-gray-500 mb-2">
              Note: Dismissal and suspension actions will be recorded in the employee's history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => onAction('dismiss')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Dismiss Employee
              </button>
              <button
                onClick={() => onAction('suspend')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {isSuspended ? 'Unsuspend Employee' : 'Suspend Employee'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hiring() {
  const { profile } = useAuthStore();
  const [hiredStaff, setHiredStaff] = useState<HiredStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<HiredStaff | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'hire' | 'reject' | 'dismiss' | 'suspend'>('hire');
  const [showSuspensionWarning, setShowSuspensionWarning] = useState(false);
  const [showUnsuspendNotification, setShowUnsuspendNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHiredStaff();
  }, [profile?.id]);

  const fetchHiredStaff = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('staff_hiring_status')
        .select(`
          id,
          created_at,
          start_date,
          end_date,
          status,
          action_status,
          staff:staff_id (
            id,
            name,
            role,
            image_url,
            staff_id,
            level,
            location,
            verified
          )
        `)
        .eq('client_id', profile.id as any)
        .eq('status', 'hired' as any) // Only fetch hired staff for now
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHiredStaff(data as any || []);
    } catch (error) {
      console.error('Error fetching hired staff:', error);
      toast.error('Failed to fetch hired staff');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffClick = (staff: HiredStaff) => {
    setSelectedStaff(staff);
    setIsDetailsModalOpen(true);
  };

  const handleAction = (action: 'hire' | 'reject' | 'dismiss' | 'suspend') => {
    // If trying to suspend, show warning first
    if (action === 'suspend') {
      // If already suspended, show unsuspend notification
      if (selectedStaff?.action_status === 'suspended') {
        setShowUnsuspendNotification(true);
      } else {
        // Show warning before suspending
        setShowSuspensionWarning(true);
      }
    } else {
      // For other actions, proceed as normal
      setFeedbackType(action);
      setIsDetailsModalOpen(false);
      setIsFeedbackModalOpen(true);
    }
  };

  const handleSuspensionWarningContinue = () => {
    // After warning, continue to feedback
    setShowSuspensionWarning(false);
    setFeedbackType('suspend');
    setIsDetailsModalOpen(false);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (
    feedback: string,
    rating: number,
    action: 'hire' | 'reject' | 'dismiss' | 'suspend'
  ) => {
    if (!selectedStaff?.staff || !profile?.id) return;

    try {
      // Common feedback record creation
      const { error: feedbackError } = await supabase
        .from('staff_feedback')
        .insert({
          client_id: profile.id,
          staff_id: selectedStaff.staff.id,
          rating,
          comment: feedback,
          decision: action // Record the action in feedback
        } as any);

      if (feedbackError) throw feedbackError;

      // For suspend/dismiss actions, we'll keep the status as 'hired' in the database
      // but we'll record the action in the feedback
      let status = 'hired'; // Default for suspend/dismiss
      let successMessage = '';
      let endDate = null;
      let actionStatus = undefined;
      
      // Only change status in database if action is hire or reject
      if (action === 'hire') {
        status = 'hired';
        successMessage = 'Employee hired successfully!';
      } else if (action === 'reject') {
        status = 'rejected';
        successMessage = 'Employee rejected successfully!';
      } else if (action === 'dismiss') {
        // Keep as 'hired' in database but show success message
        status = 'hired';
        endDate = new Date().toISOString().split('T')[0]; // Set end date to today
        actionStatus = 'dismissed';
        successMessage = 'Employee dismissed successfully!';
      } else if (action === 'suspend') {
        // Keep as 'hired' in database but show success message
        status = 'hired';
        endDate = new Date().toISOString().split('T')[0]; // Set end date to today
        actionStatus = 'suspended';
        successMessage = 'Employee suspended successfully!';
      }

      // Update the hiring status
      const { error: statusError } = await supabase
        .from('staff_hiring_status')
        .upsert({
          client_id: profile.id,
          staff_id: selectedStaff.staff.id,
          status: status,
          start_date: action === 'hire' ? new Date().toISOString().split('T')[0] : selectedStaff.start_date,
          end_date: endDate,
          action_status: actionStatus
        } as any, { onConflict: 'client_id, staff_id' });

      if (statusError) throw statusError;
      toast.success(successMessage);

      fetchHiredStaff(); // Refresh the list
      setIsFeedbackModalOpen(false); // Close modal on success
      setSelectedStaff(null); // Clear selected staff

    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error(`Failed to ${action} employee`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Hires</h1>
      </div>

      {hiredStaff.length === 0 ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Users className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hired employees</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't hired any employees yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hiredStaff.map((member) => (
            <div
              key={member.id}
              onClick={() => handleStaffClick(member)}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {member.staff?.image_url ? (
                  <img
                    src={member.staff.image_url}
                    alt={member.staff.name || 'Staff'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-medium text-gray-400">
                      {member.staff?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                {/* Status Banner Logic */}
                {member.action_status === 'dismissed' ? (
                  <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md bg-red-500 text-white">
                    Dismissed
                  </div>
                ) : member.action_status === 'suspended' ? (
                  <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md bg-yellow-500 text-white">
                    Suspended
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md bg-green-500 text-white">
                    Active
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-lg font-semibold text-gray-900">{member.staff?.name}</h3>
                    <VerifiedIcon verified={member.staff?.verified || false} />
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {member.staff?.level || 'N/A'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{member.staff?.role}</p>
                  <p>{member.staff?.location}</p>
                  <p className="flex items-center gap-1">
                    <Calendar size={14} />
                    Hired: {new Date(member.start_date).toLocaleDateString()}
                  </p>
                  {member.end_date && (
                    <p className="flex items-center gap-1 text-green-600">
                      <Calendar size={14} />
                      End: {new Date(member.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onAction={handleAction}
        />
      )}

      {selectedStaff && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
          type={feedbackType}
        />
      )}

      <SuspensionWarningModal
        isOpen={showSuspensionWarning}
        onClose={() => setShowSuspensionWarning(false)}
        onContinue={handleSuspensionWarningContinue}
      />

      <UnsuspendNotificationModal
        isOpen={showUnsuspendNotification}
        onClose={() => setShowUnsuspendNotification(false)}
      />
    </div>
  );
}