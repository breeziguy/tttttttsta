import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Briefcase, Clock, Star, Calendar, Phone, AlertCircle, Loader2, ChevronLeft, X, Heart, Users, Cake, Thermometer, Download, Award, School, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import SelectDate from './interview/SelectDate';
import ConfirmBooking from './interview/ConfirmBooking';
import VerifiedIcon from './VerifiedIcon';
import type { Database } from '../lib/database.types';
import { useAuthStore } from '../store/auth';
import SuspensionWarningModal from './FeedbackSuspensionModal';

type StaffRow = Database['public']['Tables']['staff']['Row'];

enum BookingStep {
  Details,
  AvailabilityCheck,
  SelectDate,
  Confirm
}

// Add interface for dismissal/suspension feedback modal
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, rating: number, action: 'dismiss' | 'suspend') => Promise<void>;
  type: 'dismiss' | 'suspend';
}

// Feedback modal for dismiss/suspend actions
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
            {type === 'dismiss' ? 'Dismiss Employee' : 'Suspend Employee'}
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
              {type === 'dismiss' ? 'Reason for Dismissal' : 'Reason for Suspension'}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder={type === 'dismiss' ? "Please provide the reason for dismissal..." : "Please provide the reason for suspension..."}
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
                type === 'dismiss'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } disabled:opacity-50`}
            >
              {loading ? 'Submitting...' : 
               type === 'dismiss' ? 'Confirm Dismissal' : 'Confirm Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  staffPhone: string;
}

function AvailabilityModal({ isOpen, onClose, onContinue, staffPhone }: AvailabilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Availability</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Please contact the employee to confirm their availability before proceeding with the booking.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary mr-2" />
            <span className="text-lg font-medium text-gray-900">{`+234${staffPhone.startsWith('0') ? staffPhone.substring(1) : staffPhone}`}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Employee Unavailable
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Proceed to Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to display object data properly
const formatObjectData = (data: any): string => {
  if (!data) return 'N/A';
  
  if (typeof data === 'string') return data;
  
  if (typeof data === 'object') {
    try {
      // If it's an array, process each item
      if (Array.isArray(data)) {
        return data.map((item, index) => {
          if (typeof item === 'object') {
            // Format each object in the array
            return Object.entries(item)
              .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
              .join('\n');
          }
          return String(item);
        }).join('\n\n');
      }
      
      // Handle case when data is parsed from JSON string
      if (typeof data === 'string') {
        try {
          const parsedData = JSON.parse(data);
          return formatObjectData(parsedData); // Recursively format parsed data
        } catch (e) {
          // Not valid JSON, just return the string
          return data;
        }
      }
      
      // If it's a simple object, format it nicely
      return Object.entries(data)
        .map(([key, value]) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          return `${formattedKey}: ${value}`;
        })
        .join('\n');
    } catch (e) {
      console.error('Error formatting object data:', e);
      // Try JSON.stringify as a fallback
      try {
        return JSON.stringify(data, null, 2).replace(/[{}"]/g, '').trim();
      } catch (jsonError) {
        return String(data);
      }
    }
  }
  
  return String(data);
};

interface UnsuspendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function UnsuspendNotificationModal({ isOpen, onClose, onConfirm }: UnsuspendNotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Contact Customer Support</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <AlertCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4 text-center">
              To unsuspend this employee, you need to contact our customer support team. This is necessary due to our investigation process.
            </p>
            <p className="text-gray-700 mb-4 text-center">
              Please reach out to <span className="font-medium">support@homecare.com</span> with your account details and the employee's information.
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
              onClick={onConfirm}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuthStore(); // Get the authenticated user
  const [staff, setStaff] = useState<StaffRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>(BookingStep.Details);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Add states for dismiss/suspend functionality
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'dismiss' | 'suspend'>('dismiss');
  const [hiringStatus, setHiringStatus] = useState<any>(null);
  const [isHired, setIsHired] = useState(false);
  const [fromMyHires, setFromMyHires] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showSuspensionWarning, setShowSuspensionWarning] = useState(false);

  useEffect(() => {
    // Check if we're coming from the MyHires page
    setFromMyHires(location.state?.fromMyHires === true);
    fetchStaffDetails();
  }, [id, location]);

  // Get the hiring status for this staff member
  useEffect(() => {
    if (staff?.id && profile?.id) {
      fetchHiringStatus();
    }
  }, [staff?.id, profile?.id]);

  // Update page title with staff name
  useEffect(() => {
    if (staff?.name) {
      document.title = `${staff.name} - Employee Profile`;
      return () => {
        document.title = 'HomeCare CRM';
      };
    }
  }, [staff?.name]);

  const fetchHiringStatus = async () => {
    if (!staff?.id || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('staff_hiring_status')
        .select('*')
        .eq('client_id', profile.id as any)
        .eq('staff_id', staff.id as any)
        .eq('status', 'hired' as any)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      if (error) {
        console.error('Error fetching hiring status:', error);
        return;
      }

      // Only set isHired to true if we found a record with valid data
      setIsHired(!!data);
      setHiringStatus(data || null);
    } catch (err) {
      console.error('Error checking hiring status:', err);
      setIsHired(false); // Ensure not hired on error
    }
  };

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Staff ID is required');
      }

      const { data, error: fetchError } = await supabase
        .from('staff')
        .select(`*`)
        .eq('id', id as any)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('Staff not found');
      }

      setStaff(data as unknown as StaffRow);
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff details');
      toast.error('Failed to load staff details');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
    setBookingStep(BookingStep.Confirm);
  };

  const handleBookingClick = () => {
    setShowAvailabilityModal(true);
  };

  const handleAvailabilityConfirmed = () => {
    setShowAvailabilityModal(false);
    setBookingStep(BookingStep.SelectDate);
  };

  const handleDownloadProfile = async () => {
    if (!staff) return;
    
    try {
      setDownloading(true);
      
      // Note: In a real implementation, you should use a PDF generation library
      // This would typically be done using jspdf or a similar library
      // For this example, we'll create a simple HTML-based PDF
      
      // Create a new window/tab
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow pop-ups to download the profile');
        setDownloading(false);
        return;
      }
      
      // Build the HTML content
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${staff.name} - Staff Profile</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 20px;
            }
            h1 {
              color: #2563eb;
              margin-bottom: 5px;
            }
            h2 {
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
              margin-top: 25px;
            }
            .section {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              padding: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              font-weight: 600;
              width: 40%;
            }
            @media print {
              body {
                margin: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${staff.name}'s Profile</h1>
            <p>Staff ID: ${staff.staff_id || 'N/A'}</p>
          </div>
          
          <button onclick="window.print(); return false;" style="padding: 10px 15px; background-color: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">Print / Save as PDF</button>
          
          <div class="section">
            <h2>Personal Information</h2>
            <table>
              <tr><th>Full Name</th><td>${staff.name || 'N/A'}</td></tr>
              <tr><th>Email</th><td>${staff.email || 'N/A'}</td></tr>
              <tr><th>Phone</th><td>${staff.phone || 'N/A'}</td></tr>
              <tr><th>Gender</th><td>${staff.gender || 'N/A'}</td></tr>
              <tr><th>Age</th><td>${staff.age || 'N/A'}</td></tr>
              <tr><th>Date of Birth</th><td>${staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><th>Marital Status</th><td>${staff.marital_status || 'N/A'}</td></tr>
              <tr><th>Children</th><td>${staff.children_count !== null ? staff.children_count : 'N/A'}</td></tr>
              <tr><th>Religion</th><td>${staff.religion || 'N/A'}</td></tr>
              <tr><th>State of Origin</th><td>${staff.state_of_origin || 'N/A'}</td></tr>
              <tr><th>Address</th><td>${staff.address || 'N/A'}</td></tr>
              <tr><th>Temporary Address</th><td>${staff.temp_address || 'N/A'}</td></tr>
              <tr><th>Location</th><td>${staff.location || 'N/A'}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Professional Information</h2>
            <table>
              <tr><th>Role</th><td>${staff.role || 'N/A'}</td></tr>
              <tr><th>Service Type</th><td>${staff.service_type || 'N/A'}</td></tr>
              <tr><th>Level</th><td>${staff.level || 'N/A'}</td></tr>
              <tr><th>Experience</th><td>${staff.experience} years</td></tr>
              <tr><th>Skills</th><td>${Array.isArray(staff.skills) ? staff.skills.join(', ') : 'N/A'}</td></tr>
              <tr><th>Salary</th><td>₦${staff.salary?.toLocaleString() || 'N/A'}</td></tr>
              <tr><th>Working Days</th><td>${staff.working_days || 'N/A'}</td></tr>
              <tr><th>Working Hours</th><td>${staff.working_hours || 'N/A'}</td></tr>
              <tr><th>Verified</th><td>${staff.verified ? 'Yes' : 'No'}</td></tr>
              <tr><th>Status</th><td>${staff.status || 'N/A'}</td></tr>
              <tr><th>Contract Type</th><td>${staff.contract_type || 'N/A'}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Accommodation Information</h2>
            <table>
              <tr><th>Accommodation Provided</th><td>${staff.accommodation ? 'Yes' : 'No'}</td></tr>
              <tr><th>Accommodation Status</th><td>${staff.accommodation_status || 'N/A'}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Education & Experience</h2>
            <table>
              <tr>
                <th>Education Background</th>
                <td style="white-space: pre-line">${formatObjectData(staff.education_background)}</td>
              </tr>
              <tr>
                <th>Certifications</th>
                <td style="white-space: pre-line">${formatObjectData(staff.certifications)}</td>
              </tr>
              <tr>
                <th>Work History</th>
                <td style="white-space: pre-line">${formatObjectData(staff.work_history)}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Medical Information</h2>
            <table>
              <tr><th>Health Status</th><td>${staff.health_status || 'N/A'}</td></tr>
              <tr><th>Known Illnesses</th><td>${staff.illness || 'None specified'}</td></tr>
              <tr><th>Last Medical Test</th><td>${staff.last_medical_test ? new Date(staff.last_medical_test).toLocaleDateString() : 'N/A'}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Bank Details</h2>
            <table>
              <tr><th>Account Name</th><td>${staff.account_name || 'N/A'}</td></tr>
              <tr><th>Account Number</th><td>${staff.account_number || 'N/A'}</td></tr>
              <tr><th>Bank Name</th><td>${staff.bank_name || 'N/A'}</td></tr>
            </table>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.8em;">
            <p>This document was generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;
      
      // Write content to the new window
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Let the user know they can now print/save the document
      toast.success('Profile loaded - click "Print" to save as PDF', { duration: 5000 });
    } catch (err) {
      console.error('Error creating profile PDF:', err);
      toast.error('Failed to create profile PDF');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleDismissClick = () => {
    setFeedbackType('dismiss');
    setShowFeedbackModal(true);
  };

  const handleSuspendClick = () => {
    setShowSuspensionWarning(true);
  };

  const handleSuspensionWarningContinue = () => {
    setShowSuspensionWarning(false);
    setFeedbackType('suspend');
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (
    feedback: string,
    rating: number,
    action: 'dismiss' | 'suspend'
  ) => {
    if (!staff?.id || !profile?.id) return;

    try {
      // Common feedback record creation
      const { error: feedbackError } = await supabase
        .from('staff_feedback')
        .insert({
          client_id: profile.id,
          staff_id: staff.id,
          rating,
          comment: feedback,
          decision: action
        } as any);

      if (feedbackError) throw feedbackError;

      // Set up the action status and end date
      const endDate = new Date().toISOString().split('T')[0]; // Set end date to today
      const actionStatus = action === 'dismiss' ? 'dismissed' : 'suspended';
      const successMessage = action === 'dismiss' 
        ? 'Employee dismissed successfully!' 
        : 'Employee suspended successfully!';

      // Update the hiring status
      const { error: statusError } = await supabase
        .from('staff_hiring_status')
        .upsert({
          client_id: profile.id,
          staff_id: staff.id,
          status: 'hired', // Keep status as hired
          start_date: hiringStatus?.start_date || new Date().toISOString().split('T')[0],
          end_date: endDate,
          action_status: actionStatus
        } as any, { onConflict: 'client_id, staff_id' });

      if (statusError) throw statusError;
      toast.success(successMessage);

      // Refresh hiring status
      fetchHiringStatus();
      setShowFeedbackModal(false);

    } catch (error) {
      console.error(`Error ${action}ing employee:`, error);
      toast.error(`Failed to ${action} employee`);
    }
  };

  // Add a handler for the unsuspend button click
  const handleUnsuspendClick = () => {
    setShowUnsuspendModal(true);
  };

  const handleConfirmUnsuspend = () => {
    setShowUnsuspendModal(false);
    // We don't actually do anything here except close the modal
    // The user has been instructed to contact support
    toast.success('Please contact customer support to complete the unsuspension process');
  };

  // Determine if the staff is suspended
  const isStaffSuspended = hiringStatus?.action_status === 'suspended';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Employee Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">The requested employee could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  if (bookingStep === BookingStep.SelectDate) {
    return (
      <SelectDate
        staffId={staff.id}
        staffName={staff.name}
        onNext={handleDateSelected}
        onBack={() => setBookingStep(BookingStep.Details)}
      />
    );
  }

  if (bookingStep === BookingStep.Confirm && selectedDate) {
    return (
      <ConfirmBooking
        staffId={staff.id}
        staffName={staff.name}
        selectedDate={selectedDate}
        onBack={() => setBookingStep(BookingStep.SelectDate)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Return
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {staff.image_url ? (
                <img
                  src={staff.image_url}
                  alt={staff.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl font-medium text-gray-600">
                    {staff.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
                    <VerifiedIcon verified={staff.verified ?? false} />
                  </div>
                  <p className="text-gray-600">{staff.role}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {staff.level || 'N/A'}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span>{staff.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="flex-shrink-0" />
                  <span>{staff.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cake size={16} className="flex-shrink-0" />
                  <span>Born: {formatDate(staff.date_of_birth)} ({staff.age} years old)</span>
                </div>
                 <div className="flex items-center gap-2">
                  <Star size={16} className="flex-shrink-0" />
                  <span>Level: {staff.level || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="flex-shrink-0" />
                  <span>Marital Status: {staff.marital_status || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="flex-shrink-0" />
                  <span>Children: {staff.children_count ?? 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>{staff.phone}</span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="font-medium">Salary:</span>
                  <span>₦{staff.salary?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {staff.skills?.length > 0 ? (
              staff.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills listed.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
             <div className="flex items-start gap-2">
              <Thermometer size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Health Status:</span> {staff.health_status || 'N/A'}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                 <span className="font-medium">Known Illnesses:</span> {staff.illness || 'None specified'}
              </div>
            </div>
             <div className="flex items-start gap-2">
              <Calendar size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Last Medical Test:</span> {formatDate(staff.last_medical_test)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Work History, Education & Certification</h4>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Award size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Certifications:</p>
                {staff.certifications ? (
                  <p className="whitespace-pre-line">{formatObjectData(staff.certifications)}</p>
                ) : (
                  <p className="text-gray-500 italic">No certifications listed</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <School size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Educational Background:</p>
                {staff.education_background ? (
                  <p className="whitespace-pre-line">{formatObjectData(staff.education_background)}</p>
                ) : (
                  <p className="text-gray-500 italic">No education background listed</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Building size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Work History:</p>
                {staff.work_history ? (
                  <p className="whitespace-pre-line">{formatObjectData(staff.work_history)}</p>
                ) : (
                  <p className="text-gray-500 italic">No work history listed</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex justify-end gap-4">
          <button
            onClick={handleDownloadProfile}
            disabled={downloading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Profile (PDF)
              </>
            )}
          </button>
          
          {isHired && fromMyHires && (
            <>
              {!isStaffSuspended ? (
                <button
                  onClick={handleSuspendClick}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  Suspend Employee
                </button>
              ) : (
                <button
                  onClick={handleUnsuspendClick}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Unsuspend Employee
                </button>
              )}
              <button
                onClick={handleDismissClick}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Dismiss Employee
              </button>
            </>
          )}
          
          {!isHired && (
            <button
              onClick={handleBookingClick}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              Schedule Interview
            </button>
          )}
        </div>
      </div>

      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        onContinue={handleAvailabilityConfirmed}
        staffPhone={staff?.phone || ''}
      />

      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
          type={feedbackType}
        />
      )}

      <UnsuspendNotificationModal
        isOpen={showUnsuspendModal}
        onClose={() => setShowUnsuspendModal(false)}
        onConfirm={handleConfirmUnsuspend}
      />

      <SuspensionWarningModal
        isOpen={showSuspensionWarning}
        onClose={() => setShowSuspensionWarning(false)}
        onContinue={handleSuspensionWarningContinue}
      />
    </div>
  );
}