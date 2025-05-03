import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Briefcase, Clock, Star, Calendar, Phone, Mail, AlertCircle, Loader2, ChevronLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import SelectDate from './interview/SelectDate';
import ConfirmBooking from './interview/ConfirmBooking';
import VerifiedIcon from './VerifiedIcon';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  service_type: string;
  status: string;
  experience: number;
  skills: string[];
  image_url: string | null;
  staff_id: string;
  level: string;
  location: string;
  age: number;
  salary: number;
  certifications: any[];
  education_background: any[];
  work_history: any[];
  verified?: boolean;
}

enum BookingStep {
  Details,
  AvailabilityCheck,
  SelectDate,
  Confirm
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
          <h3 className="text-lg font-semibold text-gray-900">Confirm Staff Availability</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Please call the staff member to confirm their availability before proceeding with the booking.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary mr-2" />
            <span className="text-lg font-medium text-gray-900">{staffPhone}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Mark as Unavailable
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

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>(BookingStep.Details);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Staff ID is required');
      }

      const { data, error: fetchError } = await supabase
        .from('staff')
        .select(`
          id,
          name,
          email,
          phone,
          role,
          service_type,
          status,
          experience,
          skills,
          image_url,
          staff_id,
          level,
          location,
          age,
          salary,
          certifications,
          education_background,
          work_history,
          verified
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('Staff not found');
      }

      setStaff(data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-gray-600">Loading candidate details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Candidate Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Return to Results
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidate Not Found</h2>
          <p className="text-gray-600 mb-4">The requested candidate could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Return to Results
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
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Return to Results
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
                    <VerifiedIcon verified={staff.verified} />
                  </div>
                  <p className="text-gray-600">{staff.email}</p>
                  <p className="text-gray-600">{staff.role}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {staff.level}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <span>{staff.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={18} />
                  <span>{staff.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={18} />
                  <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Star size={18} />
                  <span>{staff.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {staff.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work History</h2>
          <div className="space-y-4">
            {staff.work_history.map((work: any, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{work.company}</h3>
                  <p className="text-gray-600">{work.position}</p>
                  <p className="text-sm text-gray-500">{work.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Education & Certifications</h2>
          <div className="space-y-4">
            {staff.education_background.map((edu: any, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{edu.institution}</h3>
                  <p className="text-gray-600">{edu.degree}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={handleBookingClick}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Proceed to Schedule
          </button>
        </div>
      </div>

      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        onContinue={handleAvailabilityConfirmed}
        staffPhone={staff.phone}
      />
    </div>
  );
}