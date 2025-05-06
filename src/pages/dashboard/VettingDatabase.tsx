import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { Search, Filter, X, ChevronUp, ChevronDown, Download, AlertCircle, Loader2, FileSearch2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePDF } from 'react-to-pdf';
import VerifiedIcon from '../../components/VerifiedIcon';

interface VettingRecord {
  id: string;
  staff_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: number;
  skills: string[];
  location: string;
  created_at: string;
  status?: string;
  verified?: boolean;
}

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: number;
  skills: string[];
  location: string;
  status: string;
  image_url: string | null;
  staff_id: string;
  verified?: boolean;
}

interface VettingFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: number;
  skills: string[];
  location: string;
}

interface SearchStats {
  total_searches: number;
  total_results: number;
  avg_results_per_search: number;
  searches_last_30_days: number;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface StaffDetailsPopoverProps {
  staff: VettingRecord | StaffRecord;
  onClose: () => void;
}

function StaffDetailsPopover({ staff, onClose }: StaffDetailsPopoverProps) {
  const { toPDF, targetRef } = usePDF({
    filename: `${staff.name.toLowerCase().replace(/\s+/g, '-')}-details.pdf`,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div ref={targetRef} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-sm text-gray-900">{staff.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="mt-1 text-sm text-gray-900">{staff.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{staff.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1 text-sm text-gray-900">{`+234${staff.phone.startsWith('0') ? staff.phone.substring(1) : staff.phone}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-sm text-gray-900">{staff.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Experience</h3>
              <p className="mt-1 text-sm text-gray-900">{staff.experience} years</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {staff.skills.map((skill, index) => (
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
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    staff.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {staff.verified ? 'Verified' : 'Pending Verification'}
                </span>
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
            onClick={() => {
              toPDF();
              toast.success('Report downloaded successfully');
            }}
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

export default function VettingDatabase() {
  const { profile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchResults, setSearchResults] = useState<(VettingRecord | StaffRecord)[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedStaff, setSelectedStaff] = useState<VettingRecord | StaffRecord | null>(null);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [formData, setFormData] = useState<VettingFormData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: 0,
    skills: [],
    location: '',
  });

  useEffect(() => {
    fetchSearchStats();
  }, [profile?.id]);

  const fetchSearchStats = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_user_search_stats', {
        user_profile_id: profile.id
      });

      if (error) throw error;
      setSearchStats(data[0]);
    } catch (error) {
      console.error('Error fetching search stats:', error);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedResults = [...searchResults].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'location') {
      return sortConfig.direction === 'asc'
        ? a.location.localeCompare(b.location)
        : b.location.localeCompare(a.location);
    }
    return 0;
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() || !profile?.id) return;

    setIsSearching(true);
    setSearchMessage('Searching our database...');
    setSearchResults([]);

    try {
      // Simulate slow search
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSearchMessage('Checking verified staff records...');

      // Search staff table
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`)
        .limit(5);

      if (staffError) throw staffError;

      await new Promise(resolve => setTimeout(resolve, 1500));
      setSearchMessage('Checking vetting database...');

      // Search vettings table
      const { data: vettingsData, error: vettingsError } = await supabase
        .from('vettings')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`)
        .limit(5);

      if (vettingsError) throw vettingsError;

      // Transform and combine results
      const transformedStaffData = staffData?.map(staff => ({
        ...staff,
        verified: true
      })) || [];

      const transformedVettingsData = vettingsData?.map(vetting => ({
        ...vetting,
        status: 'pending',
        verified: false
      })) || [];

      // Combine and deduplicate results
      const combinedResults = [
        ...transformedStaffData,
        ...transformedVettingsData
      ].filter((item, index, self) => 
        index === self.findIndex(t => t.email === item.email)
      );

      // Record the search
      const { data: searchRecord, error: searchError } = await supabase
        .from('vetting_searches')
        .insert({
          user_id: profile.id,
          search_query: searchQuery,
          results_count: combinedResults.length,
          metadata: {
            staff_count: transformedStaffData.length,
            vettings_count: transformedVettingsData.length,
            search_terms: searchQuery.split(' ')
          }
        })
        .select()
        .single();

      if (searchError) throw searchError;

      // Update search stats
      await fetchSearchStats();

      setSearchResults(combinedResults);
      setShowRequestForm(combinedResults.length === 0);
      setSearchMessage(
        combinedResults.length > 0 
          ? `Found ${combinedResults.length} result${combinedResults.length === 1 ? '' : 's'}`
          : 'No results found. You can submit a new vetting request.'
      );
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search records');
      setSearchMessage('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('vettings')
        .insert({
          ...formData,
          submitted_by: profile.id,
          vetting_status: 'pending',
          verification_status: 'unverified'
        });

      if (error) throw error;

      toast.success('Vetting request submitted successfully');
      setShowRequestForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        experience: 0,
        skills: [],
        location: '',
      });
    } catch (err) {
      console.error('Error submitting vetting request:', err);
      toast.error('Failed to submit vetting request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'skills' ? value.split(',').map(s => s.trim()) : value,
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Staff Vetting</h1>
        <button
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
        >
          Submit Vetting Request
        </button>
      </div>

      {searchStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Searches</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{searchStats.total_searches}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Results</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{searchStats.total_results}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Avg Results/Search</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{searchStats.avg_results_per_search}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Searches (30 days)</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{searchStats.searches_last_30_days}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {searchMessage && (
          <div className="text-sm text-gray-600 mb-4">
            {isSearching ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {searchMessage}
              </div>
            ) : (
              searchMessage
            )}
          </div>
        )}

        {!searchQuery && searchResults.length === 0 && !isSearching && !showRequestForm && (
          <div className="text-center py-12">
            <FileSearch2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No vetting records found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Start by searching for staff members to verify their background and credentials, or submit a new vetting request.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Request
              </button>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Location</span>
                      {renderSortIcon('location')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((result) => (
                  <tr 
                    key={result.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedStaff(result)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            {result.name}
                            <VerifiedIcon verified={result.verified} className="ml-1" />
                          </div>
                          <div className="text-sm text-gray-500">{result.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.experience} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showRequestForm && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Vetting Request</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                >
                  <option value="">Select Role</option>
                  <option value="Nanny">Nanny</option>
                  <option value="Housekeeper">Housekeeper</option>
                  <option value="Cook">Cook</option>
                  <option value="Driver">Driver</option>
                  <option value="Security">Security</option>
                  <option value="Elderly Care">Elderly Care</option>
                  <option value="Office Assistant">Office Assistant</option>
                </select>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {selectedStaff && (
        <StaffDetailsPopover
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
}