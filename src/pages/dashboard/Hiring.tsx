import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Calendar, Clock, MapPin, X, Check, AlertCircle, ChevronRight, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import VerifiedIcon from '../../components/VerifiedIcon';

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
  status: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, rating: number, action: 'hire' | 'reject') => Promise<void>;
  type: 'hire' | 'reject';
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
            {type === 'hire' ? 'Hire Staff' : 'Reject Staff'}
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
            <label className="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Please provide your feedback..."
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
                  : 'bg-red-500 hover:bg-red-600'
              } disabled:opacity-50`}
            >
              {loading ? 'Submitting...' : type === 'hire' ? 'Confirm Hire' : 'Confirm Reject'}
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
  onAction: (action: 'hire' | 'reject') => void;
}

function StaffDetailsModal({ staff, isOpen, onClose, onAction }: StaffDetailsModalProps) {
  if (!isOpen || !staff.staff) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
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
                    Interview Date:{' '}
                    {new Date(staff.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>Status: {staff.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => onAction('reject')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reject
            </button>
            <button
              onClick={() => onAction('hire')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Hire
            </button>
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
  const [feedbackType, setFeedbackType] = useState<'hire' | 'reject'>('hire');
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
          status,
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
        .eq('client_id', profile.id)
        .eq('status', 'hired')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHiredStaff(data || []);
    } catch (error) {
      console.error('Error fetching hired staff:', error);
      toast.error('Failed to fetch hired staff');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffClick = (staff: HiredStaff) => {
    if (!staff.staff) return;
    setSelectedStaff(staff);
    setIsDetailsModalOpen(true);
  };

  const handleAction = (action: 'hire' | 'reject') => {
    setFeedbackType(action);
    setIsDetailsModalOpen(false);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (
    feedback: string,
    rating: number,
    action: 'hire' | 'reject'
  ) => {
    if (!selectedStaff?.staff || !profile?.id) return;

    try {
      // Common feedback record creation
      const { error: feedbackError } = await supabase
        .from('staff_feedback')
        .insert({
          client_id: profile.id,
          staff_id: selectedStaff.staff.id, // Assuming staff_id is the correct FK here
          rating,
          comment: feedback,
          decision: action // Add decision to feedback
        });

      if (feedbackError) throw feedbackError;

      if (action === 'hire') {
        // Create or update hiring status record for 'hired'
        const { error: hiringError } = await supabase
          .from('staff_hiring_status')
          .upsert({ // Use upsert in case a record exists (e.g., previously rejected)
            client_id: profile.id,
            staff_id: selectedStaff.staff.id,
            status: 'hired',
            start_date: new Date().toISOString().split('T')[0],
            // interview_id: selectedStaff.interview_id || null // Include interview_id if available - Assuming interview_id is not on HiredStaff type
          }, { onConflict: 'client_id, staff_id' }); // Define conflict resolution

        if (hiringError) throw hiringError;
        toast.success(`Staff hired successfully!`);

      } else if (action === 'reject') {
        // Update hiring status record for 'rejected'
         const { error: rejectError } = await supabase
          .from('staff_hiring_status')
          .upsert({
            client_id: profile.id,
            staff_id: selectedStaff.staff.id,
            status: 'rejected',
            start_date: null, // No start date for rejection
            // interview_id: selectedStaff.interview_id || null
          }, { onConflict: 'client_id, staff_id' });

        if (rejectError) throw rejectError;
        toast.success(`Staff rejected successfully!`);
      }

      // Assuming fetchHiredStaff is the correct function name based on useEffect
      fetchHiredStaff(); // Refresh the list after success
      setIsFeedbackModalOpen(false); // Close modal on success
      setSelectedStaff(null); // Clear selected staff

    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error(`Failed to ${action} staff`);
    }
  }; // End of handleFeedbackSubmit function

  // Component render logic starts here

    if (loading) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading hired staff...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hiring</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Staff
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Level
                </div>
                <div className="col-span-1 text-right text-xs font-medium text-gray-500 uppercase">
                  Action
                </div>
              </div>
            </div>

            <div className="bg-white divide-y divide-gray-200">
              {hiredStaff.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <Users className="w-full h-full" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hired staff</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't hired any staff members yet.
                  </p>
                </div>
              ) : (
                hiredStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className={`px-6 py-4 hover:bg-gray-50 ${
                      staff.status === 'scheduled' ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => {
                      if (staff.status === 'scheduled') {
                        handleStaffClick(staff);
                      }
                    }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {staff.staff?.image_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={staff.staff.image_url}
                              alt={staff.staff.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xl font-medium text-gray-600">
                                {staff.staff?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-1">
                            <div className="text-sm font-medium text-gray-900">
                              {staff.staff?.name || 'Unknown Staff'}
                            </div>
                            <VerifiedIcon verified={staff.staff?.verified} />
                          </div>
                          <div className="text-sm text-gray-500">{staff.staff?.email}</div>
                          <div className="text-sm text-gray-500">{staff.staff?.role}</div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">{staff.staff?.role}</div>
                        <div className="text-xs text-gray-500">{staff.staff?.level}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {new Date(staff.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            staff.status === 'hired'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">{staff.staff?.level}</div>
                      </div>
                      <div className="col-span-1 text-right">
                        {staff.status === 'scheduled' && (
                          <button className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">View details</span>
                            <ChevronRight size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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
      </div>
    );
// Removed misplaced };
}