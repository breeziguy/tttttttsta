import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { AlertCircle, Upload, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../../lib/database.types'; // Import base type

// Define generated types
type StaffRow = Database['public']['Tables']['staff']['Row'];
type StaffFeedbackRow = Database['public']['Tables']['staff_feedback']['Row'];
type StaffFeedbackInsert = Database['public']['Tables']['staff_feedback']['Insert'];

// Type for the staff data needed in this component (subset of StaffRow)
type StaffSubset = Pick<StaffRow, 'id' | 'name' | 'role' | 'image_url' | 'verified'> & {
  action_status?: string;
};

// Type for the feedback data including the nested staff subset
type FeedbackWithStaff = StaffFeedbackRow & {
  staff: StaffSubset | null; // Match the select query structure
};

// Function to format relative time
const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Calculate different time periods
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  // Return appropriate relative time
  if (diffInSeconds < minute) {
    return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};

export default function Performance() {
  const { profile } = useAuthStore();
  const [activeStaff, setActiveStaff] = useState<StaffSubset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<FeedbackWithStaff[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchActiveStaff();
      fetchFeedbacks();
    }
  }, [profile?.id]);

  const fetchActiveStaff = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('staff_hiring_status')
        .select(`
          action_status,
          staff:staff_id (
            id,
            name,
            role,
            image_url,
            verified
          )
        `)
        .eq('client_id', profile.id as any)
        .eq('status', 'hired' as any);

      if (error) throw error;

      const staffData = data?.map(item => ({
        ...(item as any).staff,
        action_status: (item as any).action_status
      })).filter(Boolean) as (StaffSubset & { action_status?: string })[] | undefined;
      
      setActiveStaff(staffData || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    if (!profile?.id) return;

    try {
      // Fetch from staff_feedback table instead of staff_report
      const { data, error } = await supabase
        .from('staff_feedback')
        .select(`
          *,
          staff:staff_id (
            id,
            name,
            role,
            image_url,
            verified
          )
        `)
        .eq('client_id', profile.id as any)
        .eq('decision', 'performance' as any) // Only show performance feedback
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks((data as any) || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      toast.error('Failed to load feedback');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !selectedStaff) {
      toast.error('Profile or Staff not available');
      return;
    }

    const selectedStaffObj = activeStaff.find(staff => staff.id === selectedStaff);
    if (selectedStaffObj?.action_status === 'dismissed' || selectedStaffObj?.action_status === 'suspended') {
      const { data: existingFeedback, error: checkError } = await supabase
        .from('staff_feedback')
        .select('id')
        .eq('staff_id', selectedStaff as any)
        .eq('client_id', profile.id as any)
        .eq('decision', 'performance' as any);
      
      if (checkError) {
        console.error('Error checking existing feedback:', checkError);
      } else if (existingFeedback && existingFeedback.length > 0) {
        toast.error(`You have already submitted performance feedback for this ${selectedStaffObj.action_status} employee`);
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Insert into staff_feedback
      const feedbackInsertData = {
        client_id: profile.id,
        staff_id: selectedStaff,
        rating,
        comment,
        decision: 'performance'
      };
      
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('staff_feedback')
        .insert(feedbackInsertData as any)
        .select();

      if (feedbackError) {
        console.error('Feedback Insert Error Details:', feedbackError);
        throw new Error(`Feedback insert error: ${feedbackError.message}`);
      }

      toast.success('Performance feedback submitted successfully');
      setSelectedStaff('');
      setRating(5);
      setComment('');
      
      // Refresh feedback data
      fetchFeedbacks();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(err instanceof Error ? `Failed to submit feedback: ${err.message}` : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Performance Insights Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feedback Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Employee
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              >
                <option value="">Select Employee</option>
                {activeStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.role} 
                    {staff.action_status ? ` (${staff.action_status.charAt(0).toUpperCase() + staff.action_status.slice(1)})` : ' (Active)'}
                  </option>
                ))}
              </select>
              {selectedStaff && activeStaff.find(s => s.id === selectedStaff)?.action_status && (
                <p className="mt-1 text-sm text-green-600">
                  Note: You can only submit one performance review for {activeStaff.find(s => s.id === selectedStaff)?.action_status} employees.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
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
                Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Describe the employee's performance..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !selectedStaff}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          
          {feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by submitting performance feedback for your employees.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {feedback.staff?.name} - {feedback.staff?.role}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatRelativeTime(feedback.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: feedback.rating || 0 }).map((_, i) => (
                        <Star key={i} size={14} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {feedback.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}