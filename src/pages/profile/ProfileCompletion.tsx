import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Users, Building2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

// List of Nigerian states
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

interface FormData {
  // Basic Info
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;

  // Individual Specific
  householdAdults?: number;
  hasChildren?: boolean;
  hasPets?: boolean;
  liveInAccommodation?: 'Available' | 'Not Available';
  preferredContact?: 'Call' | 'WhatsApp';

  // Corporate Specific
  companyName?: string;
  rcNumber?: string;
  industry?: string;
  companyAddress?: string;
  companyCityState?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  representativeDetails?: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
}

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phoneNumber: profile?.phone_number || '',
    address: profile?.address || '',
    state: profile?.location || '',
    hasChildren: false,
    hasPets: false,
    householdAdults: 0,
  });

  useEffect(() => {
    if (profile?.account_type === 'corporate') {
      setFormData(prev => ({
        ...prev,
        companyName: profile.company_name,
        rcNumber: profile.rc_number,
        industry: profile.industry,
        companyAddress: profile.company_address,
        companyCityState: profile.company_city_state,
        companyEmail: profile.company_email,
        companyPhone: profile.company_phone,
        website: profile.website,
        representativeDetails: profile.representative_details as any,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        householdAdults: profile?.household_adults || 0,
        hasChildren: profile?.has_children || false,
        hasPets: profile?.has_pets || false,
        liveInAccommodation: profile?.live_in_accommodation,
        preferredContact: profile?.preferred_contact,
      }));
    }
  }, [profile]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.is_profile_complete) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = profile?.account_type === 'corporate' 
        ? {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            address: formData.address,
            location: formData.state,
            company_name: formData.companyName,
            rc_number: formData.rcNumber,
            industry: formData.industry,
            company_address: formData.companyAddress,
            company_city_state: formData.companyCityState,
            company_email: formData.companyEmail,
            company_phone: formData.companyPhone,
            website: formData.website,
            representative_details: formData.representativeDetails,
            is_profile_complete: true,
          }
        : {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            address: formData.address,
            location: formData.state,
            household_adults: formData.householdAdults,
            has_children: formData.hasChildren,
            has_pets: formData.hasPets,
            live_in_accommodation: formData.liveInAccommodation,
            preferred_contact: formData.preferredContact,
            is_profile_complete: true,
          };

      await updateProfile(updateData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderSidebar = () => (
    <div className="fixed left-0 top-0 bottom-0 w-[360px] bg-gray-50 p-8">
      <div className="mb-12">
        <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Users className="text-white" size={20} />
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          COMPLETE YOUR PROFILE
        </h2>

        <div className="space-y-4">
          <div className="flex items-center text-green-600">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Basic Information</p>
              <p className="text-sm text-gray-500">Your contact details</p>
            </div>
          </div>

          {profile?.account_type === 'corporate' ? (
            <div className="flex items-center text-green-600">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Company Details</p>
                <p className="text-sm text-gray-500">Information about your company</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Household Details</p>
                <p className="text-sm text-gray-500">Your household requirements</p>
              </div>
            </div>
          )}

          <div className="flex items-center text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Choose your plan</p>
              <p className="text-sm text-gray-500">Select a subscription plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12 px-8">
      <div className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {profile?.account_type === 'corporate' ? 'Company Information' : 'Personal Information'}
          </h2>
          <p className="mt-1 text-gray-500">
            {profile?.account_type === 'corporate' 
              ? 'Please provide your company details'
              : 'Please provide your personal details'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              {profile?.account_type === 'corporate' ? 'Company Name' : 'Full Name'}
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 shadow-sm px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              id="address"
              rows={3}
              required
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <select
              name="state"
              id="state"
              required
              value={formData.state}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
            >
              <option value="">Select State</option>
              {NIGERIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {profile?.account_type === 'corporate' ? (
            <>
              <div>
                <label htmlFor="rcNumber" className="block text-sm font-medium text-gray-700">
                  RC Number
                </label>
                <input
                  type="text"
                  name="rcNumber"
                  id="rcNumber"
                  required
                  value={formData.rcNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  name="industry"
                  id="industry"
                  required
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Construction">Construction</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                  Company Email
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  id="companyEmail"
                  required
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">
                  Company Phone
                </label>
                <input
                  type="tel"
                  name="companyPhone"
                  id="companyPhone"
                  required
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="householdAdults" className="block text-sm font-medium text-gray-700">
                  Number of Adults in Household
                </label>
                <input
                  type="number"
                  name="householdAdults"
                  id="householdAdults"
                  min="0"
                  required
                  value={formData.householdAdults}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="liveInAccommodation" className="block text-sm font-medium text-gray-700">
                  Live-in Accommodation
                </label>
                <select
                  name="liveInAccommodation"
                  id="liveInAccommodation"
                  required
                  value={formData.liveInAccommodation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                >
                  <option value="">Select Option</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700">
                  Preferred Contact Method
                </label>
                <select
                  name="preferredContact"
                  id="preferredContact"
                  required
                  value={formData.preferredContact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2"
                >
                  <option value="">Select Option</option>
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div className="col-span-2 space-y-4">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Do you have children?</p>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasChildren"
                        value="true"
                        checked={formData.hasChildren === true}
                        onChange={() => setFormData(prev => ({ ...prev, hasChildren: true }))}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasChildren"
                        value="false"
                        checked={formData.hasChildren === false}
                        onChange={() => setFormData(prev => ({ ...prev, hasChildren: false }))}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Do you have pets?</p>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasPets"
                        value="true"
                        checked={formData.hasPets === true}
                        onChange={() => setFormData(prev => ({ ...prev, hasPets: true }))}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasPets"
                        value="false"
                        checked={formData.hasPets === false}
                        onChange={() => setFormData(prev => ({ ...prev, hasPets: false }))}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Left sidebar */}
      {renderSidebar()}

      {/* Main content */}
      <div className="ml-[360px] flex flex-col min-h-screen">
        {renderForm()}
      </div>
    </div>
  );
}