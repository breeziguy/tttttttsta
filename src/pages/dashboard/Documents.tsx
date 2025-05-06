import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { DownloadCloud, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../../lib/database.types';

// Define types based on potential query
type DownloadHistoryRow = Database['public']['Tables']['download_history']['Row'];
type StaffRowSubset = Pick<Database['public']['Tables']['staff']['Row'], 'id' | 'name' | 'role'>;

type DownloadHistoryEntry = DownloadHistoryRow & {
  staff: StaffRowSubset | null; // Assuming we join staff table
};

export default function Documents() {
  const { profile } = useAuthStore();
  const [history, setHistory] = useState<DownloadHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchDownloadHistory();
    }
  }, [profile?.id]);

  const fetchDownloadHistory = async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch download history, joining with staff table to get name/role
      const { data, error: fetchError } = await supabase
        .from('download_history')
        .select(`
          *,
          staff:staff_id (
            id,
            name,
            role
          )
        `)
        .eq('client_id', profile.id as string) // Cast needed?
        .order('downloaded_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setHistory((data as DownloadHistoryEntry[]) || []);

    } catch (err) {
      console.error('Error fetching download history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
      toast.error('Failed to load download history.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Document Download History</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>Error loading history: {error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center">
            <DownloadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Download History</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't downloaded any staff documents yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.map((item) => (
              <li key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.staff?.name || 'Unknown Staff'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.staff?.role || 'N/A'}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(item.downloaded_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 