import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { AlertCircle, Upload, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../../lib/database.types'; // Import base type

// Define generated types
type StaffRow = Database['public']['Tables']['staff']['Row'];
type StaffReportRow = Database['public']['Tables']['staff_report']['Row'];
type StaffReportInsert = Database['public']['Tables']['staff_report']['Insert'];
type StaffFeedbackInsert = Database['public']['Tables']['staff_feedback']['Insert'];

// Type for the staff data needed in this component (subset of StaffRow)
type StaffSubset = Pick<StaffRow, 'id' | 'name' | 'role' | 'image_url' | 'verified'>;

// Type for the report data including the nested staff subset
type ReportWithStaff = StaffReportRow & {
  staff: StaffSubset | null; // Match the select query structure
};

export default function Performance() {
  const { profile } = useAuthStore();
  const [activeStaff, setActiveStaff] = useState<StaffSubset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reports, setReports] = useState<ReportWithStaff[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchActiveStaff();
      fetchReports();
    }
  }, [profile?.id]);

  const fetchActiveStaff = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('staff_hiring_status')
        .select(`
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

      const staffData = data?.map(item => (item as any).staff).filter(Boolean) as StaffSubset[] | undefined;
      setActiveStaff(staffData || []);
      if (!selectedStaff && staffData && staffData.length > 0) {
        setSelectedStaff(staffData[0].id);
      }
    } catch (err) {
      console.error('Error fetching active staff:', err);
      toast.error('Failed to load active staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('staff_report')
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as any) || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load reports');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !selectedStaff) return;

    try {
      setSubmitting(true);

      // Create the report using the Insert type
      const reportInsertData = {
        client_id: profile.id,
        staff_id: selectedStaff,
        report_type: 'performance',
        title: 'Performance Report',
        description: comment,
        report_date: new Date().toISOString(),
        severity: rating >= 4 ? 'low' : rating >= 2 ? 'medium' : 'high',
        status: 'pending'
      };
      const { error: reportError } = await supabase
        .from('staff_report')
        .insert(reportInsertData as any);

      if (reportError) throw reportError;

      // Create feedback record using Insert type
      const feedbackInsertData = {
        client_id: profile.id,
        staff_id: selectedStaff,
        rating,
        comment
      };
      const { error: feedbackError } = await supabase
        .from('staff_feedback')
        .insert(feedbackInsertData as any);

      if (feedbackError) throw feedbackError;

      toast.success('Performance report submitted successfully');
      setSelectedStaff('');
      setRating(5);
      setComment('');
      fetchReports();
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-gray-600">Loading staff...</span>
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
        {/* Report Form */}
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
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              >
                {activeStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.role}
                  </option>
                ))}
              </select>
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
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                placeholder="Describe the staff member's performance..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !selectedStaff}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
          
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by submitting a performance report for your staff.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {report.staff?.name} - {report.staff?.role}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {report.description}
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