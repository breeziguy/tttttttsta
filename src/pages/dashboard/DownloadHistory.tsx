import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import { Loader2, AlertCircle, FileDown, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface DownloadRecord {
  id: string;
  activity_type: string;
  description: string;
  metadata: {
    file_name?: string;
    file_type?: string;
    file_size?: number;
    download_date?: string;
    [key: string]: any;
  };
  created_at: string;
}

export default function DownloadHistory() {
  const { profile } = useAuthStore();
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloadHistory();
  }, [profile?.id]);

  const fetchDownloadHistory = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', profile.id)
        .eq('activity_type', 'vetting_download')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDownloads(data || []);
    } catch (err) {
      console.error('Error fetching download history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch download history');
      toast.error('Failed to load download history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDownloadHistory}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Download History</h1>
      </div>

      {downloads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FileDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Downloads</h3>
          <p className="text-gray-600">You haven't downloaded any vetting reports yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 text-left text-xs font-medium text-gray-500 uppercase">
                  File Name
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Size
                </div>
                <div className="col-span-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Download Date
                </div>
              </div>
            </div>

            <div className="bg-white divide-y divide-gray-200">
              {downloads.map((download) => (
                <div key={download.id} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <FileDown className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {download.metadata.file_name || 'Unnamed File'}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">
                        {download.metadata.file_type || 'PDF'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">
                        {download.metadata.file_size ? 
                          `${Math.round(download.metadata.file_size / 1024)} KB` : 
                          'Unknown'}
                      </span>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">
                          {new Date(download.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}