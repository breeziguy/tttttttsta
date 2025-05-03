import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import { Loader2, AlertCircle, FileText, CheckCircle, XCircle, Clock, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePDF } from 'react-to-pdf';

interface VettingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: number;
  skills: string[];
  location: string;
  submission_date: string;
  vetting_status: 'submitted' | 'pending' | 'in_progress' | 'cannot_verify';
  verification_status: 'unverified' | 'verified' | 'failed';
}

// Helper functions for status display
const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'failed':
    case 'cannot_verify':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-4 h-4" />;
    case 'failed':
    case 'cannot_verify':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

interface RequestDetailsModalProps {
  request: VettingRequest;
  onClose: () => void;
}

function RequestDetailsModal({ request, onClose }: RequestDetailsModalProps) {
  const { toPDF, targetRef } = usePDF({
    filename: `vetting-request-${request.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Vetting Request Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div ref={targetRef} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-sm text-gray-900">{request.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="mt-1 text-sm text-gray-900">{request.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{request.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1 text-sm text-gray-900">{request.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-sm text-gray-900">{request.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Experience</h3>
              <p className="mt-1 text-sm text-gray-900">{request.experience} years</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {request.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-2 space-y-2">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.vetting_status)}`}>
                  {getStatusIcon(request.vetting_status)}
                  <span className="ml-1 capitalize">{request.vetting_status.replace(/_/g, ' ')}</span>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.verification_status)}`}>
                  {getStatusIcon(request.verification_status)}
                  <span className="ml-1 capitalize">{request.verification_status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => toPDF()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VettingRequests() {
  const { profile } = useAuthStore();
  const [requests, setRequests] = useState<VettingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VettingRequest | null>(null);

  useEffect(() => {
    fetchVettingRequests();
  }, [profile?.id]);

  const fetchVettingRequests = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vettings')
        .select('*')
        .eq('submitted_by', profile.id)
        .order('submission_date', { ascending: false });

      if (fetchError) throw fetchError;

      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching vetting requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vetting requests');
      toast.error('Failed to load vetting requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-gray-600">Loading vetting requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Requests</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchVettingRequests}
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
        <h1 className="text-2xl font-bold text-gray-900">Vetting Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vetting Requests</h3>
          <p className="text-gray-600">You haven't submitted any vetting requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Submission Date
                </div>
                <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </div>
              </div>
            </div>

            <div className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="text-sm font-medium text-gray-900">{request.name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">{request.role}</div>
                      <div className="text-sm text-gray-500">{request.experience} years</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">{request.location}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">
                        {new Date(request.submission_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.vetting_status)}`}>
                          {getStatusIcon(request.vetting_status)}
                          <span className="ml-1 capitalize">{request.vetting_status.replace(/_/g, ' ')}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.verification_status)}`}>
                          {getStatusIcon(request.verification_status)}
                          <span className="ml-1 capitalize">{request.verification_status.replace(/_/g, ' ')}</span>
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

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}