import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Users, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

type AccountType = 'individual' | 'corporate';

interface RegisterFormData {
  accountType: AccountType;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  // Individual specific fields
  address?: string;
  location?: string;
  householdAdults?: number;
  hasChildren?: boolean;
  hasPets?: boolean;
  liveInAccommodation?: 'Required' | 'Non Required';
  preferredContact?: 'Call' | 'WhatsApp';
  // Corporate specific fields
  companyName?: string;
  rcNumber?: string;
  industry?: string;
  companyAddress?: string;
  companyCityState?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  representativeName?: string;
  representativePosition?: string;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Financial Services',
  'Real Estate',
  'Construction',
  'Hospitality',
  'Other'
];

export default function Register() {
  const navigate = useNavigate();
  const { user, signUp } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    accountType: 'individual',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    // Individual defaults
    householdAdults: 0,
    hasChildren: false,
    hasPets: false,
    // Corporate defaults
    industry: '',
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : 
              value
    }));
  };

  const validateBasicInfo = () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const validateAdditionalInfo = () => {
    if (formData.accountType === 'individual') {
      if (!formData.address || !formData.location || !formData.liveInAccommodation || !formData.preferredContact) {
        setError('All fields are required');
        return false;
      }
    } else {
      if (!formData.companyName || !formData.rcNumber || !formData.industry || !formData.companyAddress || 
          !formData.companyCityState || !formData.companyEmail || !formData.companyPhone || 
          !formData.representativeName || !formData.representativePosition) {
        setError('All fields are required');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1 && validateBasicInfo()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAdditionalInfo()) {
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.accountType);

      toast.success('Account created! Please check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Account Type
        </label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, accountType: 'individual' }))}
            className={`flex items-center justify-center px-4 py-3 border rounded-lg ${
              formData.accountType === 'individual'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Individual
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, accountType: 'corporate' }))}
            className={`flex items-center justify-center px-4 py-3 border rounded-lg ${
              formData.accountType === 'corporate'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Corporate
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          {formData.accountType === 'individual' ? 'Full Name' : 'Company Name'}
        </label>
        <input
          type="text"
          name="fullName"
          id="fullName"
          required
          value={formData.fullName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          value={formData.password}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          required
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
  );

  const renderIndividualInfo = () => (
    <div className="space-y-6">
      <div>
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          State
        </label>
        <select
          name="location"
          id="location"
          required
          value={formData.location}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        >
          <option value="">Select State</option>
          {NIGERIAN_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        >
          <option value="">Select Option</option>
          <option value="Required">Required</option>
          <option value="Non Required">Non Required</option>
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        >
          <option value="">Select Option</option>
          <option value="Call">Call</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasChildren"
              checked={formData.hasChildren}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Do you have children?</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasPets"
              checked={formData.hasPets}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Do you have pets?</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCorporateInfo = () => (
    <div className="space-y-6">
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        >
          <option value="">Select Industry</option>
          {INDUSTRIES.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
          Company Address
        </label>
        <textarea
          name="companyAddress"
          id="companyAddress"
          rows={3}
          required
          value={formData.companyAddress}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="companyCityState" className="block text-sm font-medium text-gray-700">
          City/State
        </label>
        <select
          name="companyCityState"
          id="companyCityState"
          required
          value={formData.companyCityState}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        >
          <option value="">Select State</option>
          {NIGERIAN_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700">
          Representative Name
        </label>
        <input
          type="text"
          name="representativeName"
          id="representativeName"
          required
          value={formData.representativeName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="representativePosition" className="block text-sm font-medium text-gray-700">
          Representative Position
        </label>
        <input
          type="text"
          name="representativePosition"
          id="representativePosition"
          required
          value={formData.representativePosition}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Users className="text-white" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-green-500 hover:text-green-400">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {error}
              </div>
            )}

            {currentStep === 1 ? renderBasicInfo() : formData.accountType === 'individual' ? renderIndividualInfo() : renderCorporateInfo()}

            <div className="flex justify-between">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Back
                </button>
              )}
              
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}