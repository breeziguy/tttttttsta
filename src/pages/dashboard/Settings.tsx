import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { User, Bell, Shield, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import SubscriptionManager from '../../components/SubscriptionManager';

interface FormData {
  // Basic Info
  fullName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  // Individual Specific
  numberOfChildren: number;
  hasPets: boolean;
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

export default function Settings() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<FormData>({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phoneNumber: profile?.phone_number || '',
    addressLine1: profile?.address_line1 || '',
    addressLine2: profile?.address_line2 || '',
    city: profile?.city || '',
    state: profile?.location || '',
    numberOfChildren: profile?.number_of_children || 0,
    hasPets: profile?.has_pets || false,
    companyName: profile?.company_name,
    rcNumber: profile?.rc_number,
    industry: profile?.industry,
    companyAddress: profile?.company_address,
    companyCityState: profile?.company_city_state,
    companyEmail: profile?.company_email,
    companyPhone: profile?.company_phone,
    website: profile?.website,
    representativeDetails: profile?.representative_details,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : 
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = profile?.account_type === 'corporate' 
        ? {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
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
          }
        : {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
            location: formData.state,
            number_of_children: formData.numberOfChildren,
            has_pets: formData.hasPets,
          };

      await updateProfile(updateData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Account</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`-ml-1 mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
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
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
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
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    id="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    name="state"
                    id="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {profile?.account_type === 'individual' && (
                  <>
                    <div>
                      <label htmlFor="numberOfChildren" className="block text-sm font-medium text-gray-700">
                        Number of Children
                      </label>
                      <input
                        type="number"
                        name="numberOfChildren"
                        id="numberOfChildren"
                        min="0"
                        value={formData.numberOfChildren}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Do you have pets?
                      </label>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="hasPets"
                            value="true"
                            checked={formData.hasPets === true}
                            onChange={() => setFormData(prev => ({ ...prev, hasPets: true }))}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <span className="ml-2">Yes</span>
                        </label>
                        <label className="inline-flex items-center ml-6">
                          <input
                            type="radio"
                            name="hasPets"
                            value="false"
                            checked={formData.hasPets === false}
                            onChange={() => setFormData(prev => ({ ...prev, hasPets: false }))}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <span className="ml-2">No</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {profile?.account_type === 'corporate' && (
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
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
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
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                      >
                        <option value="">Select Industry</option>
                        {INDUSTRIES.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
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
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
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
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary px-3 py-2"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to receive notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifications.email"
                    id="notifications.email"
                    checked={formData.email !== ''}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="notifications.email" className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Email notifications</span>
                    <p className="text-sm text-gray-500">Get notified via email</p>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifications.sms"
                    id="notifications.sms"
                    checked={formData.phoneNumber !== ''}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="notifications.sms" className="ml-3">
                    <span className="text-sm font-medium text-gray-700">SMS notifications</span>
                    <p className="text-sm text-gray-500">Get notified via SMS</p>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account security preferences.
                </p>
              </div>

              <div className="space-y-4">
                <button className="w-full flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>

                <button className="w-full flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>

                <button className="w-full flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Connected Devices</p>
                    <p className="text-sm text-gray-500">Manage your active sessions</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Subscription Plans</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a plan that fits your needs
                </p>
              </div>

              <SubscriptionManager
                currentPlan={profile?.subscription_tier}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}