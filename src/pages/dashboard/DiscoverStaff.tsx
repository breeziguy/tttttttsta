import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { Search, Filter, X, ChevronUp, ChevronDown, Heart, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import VerifiedIcon from '../../components/VerifiedIcon';
import ScheduleReminderModal from '../../components/ScheduleReminderModal';
import type { Database, Json } from '../../lib/database.types';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Use generated types directly
type StaffRow = Database['public']['Tables']['staff']['Row'];
type StaffSelectionInsert = Database['public']['Tables']['staff_selections']['Insert'];
// Define Enums used for status fields if applicable
type StaffStatusEnum = Database['public']['Enums']['staff_status'];
type SelectionStatusEnum = 'selected' | 'rejected' | 'interviewed' | 'hired'; // Assuming these are the possible values for staff_selections.status
type InterviewStatusEnum = Database['public']['Enums']['interview_status'];
// We don't seem to need these specific types below, but keeping definitions is fine
type StaffInterviewRow = Database['public']['Tables']['staff_interviews']['Row'];
type StaffSelectionRow = Database['public']['Tables']['staff_selections']['Row'];

// Restore FilterState definition
interface FilterState {
  location: string;
  minExperience: string;
  maxExperience: string;
  minAge: string;
  maxAge: string;
  skills: string[];
  role: string;
  gender: string;
  accommodation: string;
  contractType: string;
  minSalary: string;
  maxSalary: string;
}

const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry',
  'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu',
  'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo',
  'Somolu', 'Surulere'
];

const STAFF_ROLES = [
  'Nanny', 'Housekeeper', 'Cook', 'Driver', 'Security', 'Chef', 'Cleaner', 'Ironing Man'
];

const EXPERIENCE_RANGES = [
  { min: 0, max: 2, label: '0-2 years' },
  { min: 3, max: 5, label: '3-5 years' },
  { min: 6, max: 10, label: '6-10 years' },
  { min: 11, max: 15, label: '11-15 years' },
  { min: 16, max: 100, label: '15+ years' }
];

const AGE_RANGES = [
  { min: 18, max: 25, label: '18-25 years' },
  { min: 26, max: 35, label: '26-35 years' },
  { min: 36, max: 45, label: '36-45 years' },
  { min: 46, max: 55, label: '46-55 years' },
  { min: 56, max: 100, label: '55+ years' }
];

const SALARY_RANGES = [
  { min: 0, max: 70000, label: 'Up to 70k Naira' },
  { min: 70000, max: 150000, label: '70k - 150k Naira' },
  { min: 150000, max: 230000, label: '150k - 230k Naira' },
  { min: 230000, max: 300000, label: '230k - 300k Naira' },
  { min: 300000, max: 1000000000, label: '300k+ Naira' }
];

const COMMON_SKILLS = [
  'Literacy', 'Cooking', 'Pet Care', 'First Aid'
];

const GENDER_OPTIONS = [
  { value: '', label: 'All Genders' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

export default function DiscoverStaff() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalStaffCount, setTotalStaffCount] = useState(0);
  const [accessPercentage, setAccessPercentage] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    minExperience: '',
    maxExperience: '',
    minAge: '',
    maxAge: '',
    skills: [],
    role: '',
    gender: '',
    accommodation: '',
    contractType: '',
    minSalary: '',
    maxSalary: ''
  });
  const [showScheduleReminder, setShowScheduleReminder] = useState(false);
  const [scheduleReminderCount, setScheduleReminderCount] = useState(0);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchStaff(0);
      loadFavorites();
      
      const count = localStorage.getItem('scheduleReminderCount');
      if (count) {
        setScheduleReminderCount(parseInt(count));
      }
    } else {
      setLoading(false);
      setStaff([]);
    }
  }, [profile?.id, filters, showFavorites, searchQuery]);

  useEffect(() => {
    // This is just a placeholder - actual infinite scroll logic is needed here
    // It should probably call fetchStaff(page + 1) under certain conditions
  }, [page]);

  const loadFavorites = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('staff_selections')
        .select('staff_id')
        .eq('client_id', profile.id as any)
        .eq('status', 'selected' as any);

      if (error) {
        console.error("Error loading favorites:", error);
        throw error;
      }

      const favoritesData = data as { staff_id: string }[] | null;
      setFavorites(new Set(favoritesData?.map(item => item.staff_id).filter(Boolean) || []));
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const handleFavorite = async (staffMember: StaffRow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.id) {
      toast.error('Please log in to favorite staff');
      return;
    }

    try {
      const isFavorited = favorites.has(staffMember.id);

      if (isFavorited) {
        const { error } = await supabase
          .from('staff_selections')
          .delete()
          .eq('client_id', profile.id as any)
          .eq('staff_id', staffMember.id as any);

        if (error) throw error;

        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(staffMember.id);
          return next;
        });

        toast.success('Removed from favorites');
      } else {
        const insertData = {
          client_id: profile.id,
          staff_id: staffMember.id,
          status: 'selected'
        } as any;
        
        const { error } = await supabase
          .from('staff_selections')
          .insert(insertData as any);

        if (error) throw error;

        setFavorites(prev => new Set([...prev, staffMember.id]));
        toast.success('Added to favorites');
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update favorites');
    }
  };

  const fetchStaff = async (pageNumber: number = page) => {
    try {
      setLoading(true);
      setError(null);
      const pageSize = 9;
      const from = pageNumber * pageSize;

      let scheduledStaffIds: string[] = [];
      if (profile?.id) {
        const { data: interviewData, error: interviewError } = await supabase
          .from('staff_interviews')
          .select('staff_id')
          .eq('client_id', profile.id as any)
          .eq('status', 'scheduled' as any);

        if (interviewError) {
          console.error('Error fetching scheduled interviews:', interviewError);
        } else {
          const interviewStaffIds = interviewData as { staff_id: string }[] | null;
          scheduledStaffIds = interviewStaffIds?.map((i) => i.staff_id) || [];
        }
      }

      let query = supabase
        .from('staff')
        .select('*', { count: 'exact' })
        .eq('status', 'active' as any);

      if (scheduledStaffIds.length > 0) {
        query = query.not('id', 'in', `(${scheduledStaffIds.join(',')})`);
      }

      if (filters.location) {
        query = query.eq('location', filters.location as any);
      }

      if (filters.minExperience) {
        query = query.gte('experience', parseInt(filters.minExperience));
      }

      if (filters.maxExperience) {
        query = query.lte('experience', parseInt(filters.maxExperience));
      }

      if (filters.minAge) {
        query = query.gte('age', parseInt(filters.minAge));
      }

      if (filters.maxAge) {
        query = query.lte('age', parseInt(filters.maxAge));
      }

      if (filters.role) {
        query = query.eq('role', filters.role as any);
      }

      if (filters.gender) {
        query = query.eq('gender', filters.gender as any);
      }

      if (filters.accommodation) {
        // Use the enum value directly for filtering
        query = query.eq('accommodation_status', filters.accommodation as any);
      }

      if (filters.contractType) {
        query = query.ilike('availability', `%${filters.contractType}%`);
      }

      if (filters.minSalary) {
        query = query.gte('salary', parseInt(filters.minSalary));
      }
      if (filters.maxSalary) {
        query = query.lte('salary', parseInt(filters.maxSalary));
      }

      if (filters.skills.length > 0) {
        query = query.contains('skills', filters.skills);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`);
      }

      if (showFavorites && favorites.size > 0) {
        query = query.in('id', Array.from(favorites) as any);
      }

      const { data, error: fetchError, count } = await query
        .range(from, from + pageSize - 1)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const total = count || 0;
      setTotalStaffCount(total);

      const accessibleCount = Math.floor(total * (accessPercentage / 100));

      const fetchedStaff = data as unknown as StaffRow[];
      
      if (from >= accessibleCount) {
        setHasMore(false);
        setStaff(prev => pageNumber === 0 ? [] : prev);
        setLoading(false);
        return;
      }

      if (pageNumber === 0) {
        setStaff(fetchedStaff);
      } else {
        setStaff(prev => [...prev, ...fetchedStaff]);
      }

      setHasMore(fetchedStaff.length === pageSize && from + fetchedStaff.length < accessibleCount);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
      toast.error('Failed to fetch staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    if (key === 'minExperience' || key === 'maxExperience') {
      const range = EXPERIENCE_RANGES.find(r => r.label === value);
      if (range) {
        setFilters(prev => ({
          ...prev,
          minExperience: range.min.toString(),
          maxExperience: range.max.toString()
        }));
      }
    } else if (key === 'minAge' || key === 'maxAge') {
      const range = AGE_RANGES.find(r => r.label === value);
      if (range) {
        setFilters(prev => ({
          ...prev,
          minAge: range.min.toString(),
          maxAge: range.max.toString()
        }));
      }
    } else if (key === 'minSalary' || key === 'maxSalary') {
      const range = SALARY_RANGES.find(r => r.label === value);
      if (range) {
        setFilters(prev => ({
          ...prev,
          minSalary: range.min.toString(),
          maxSalary: range.max.toString()
        }));
      }
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minExperience: '',
      maxExperience: '',
      minAge: '',
      maxAge: '',
      skills: [],
      role: '',
      gender: '',
      accommodation: '',
      contractType: '',
      minSalary: '',
      maxSalary: ''
    });
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    fetchStaff(0);
  };

  const isLagosState = () => {
    if (!profile?.location) return false;
    return profile.location.toLowerCase().includes('lagos');
  };

  const handleNavigateToStaff = (memberId: string) => {
    // Store the ID to navigate to after closing modal
    setSelectedStaffId(memberId);
    
    // Only show reminder if count is less than 3
    if (scheduleReminderCount < 3) {
      setShowScheduleReminder(true);
      // Increment the count
      const newCount = scheduleReminderCount + 1;
      setScheduleReminderCount(newCount);
      // Save to localStorage
      localStorage.setItem('scheduleReminderCount', newCount.toString());
    } else {
      // If already shown 3 times, navigate directly
      navigate(`/dashboard/staff/${memberId}`, { state: { fromMyHires: false } });
    }
  };
  
  const handleCloseReminder = () => {
    setShowScheduleReminder(false);
    
    // Navigate to staff details after closing the modal
    if (selectedStaffId) {
      navigate(`/dashboard/staff/${selectedStaffId}`, { state: { fromMyHires: false } });
    }
  };

  if (!isLagosState()) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Available in Your Area</h2>
          <p className="text-gray-600 mb-6">
            We're currently only operating in Lagos State. We're working hard to expand our services to other states soon.
          </p>
          <p className="text-gray-600">
            Your location: <span className="font-semibold">{profile?.location}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Discover Employee</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Name, or Role…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            showFavorites
              ? 'bg-primary text-white'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {showFavorites ? 'Show All' : 'Favorites'}
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            showFilters
              ? 'bg-primary text-white'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Filter size={20} className="mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">All Locations</option>
                {LAGOS_LGAS.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Level</label>
              <select
                value={`${filters.minExperience}-${filters.maxExperience} years`}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">All Experience Levels</option>
                {EXPERIENCE_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age Range</label>
              <select
                value={`${filters.minAge}-${filters.maxAge} years`}
                onChange={(e) => handleFilterChange('minAge', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">All Ages</option>
                {AGE_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                id="role"
                required
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">All Roles</option>
                {STAFF_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                id="gender"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                {GENDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Skill</label>
              <select
                value={filters.skills[0] || ''}
                onChange={(e) => handleFilterChange('skills', [e.target.value])}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">All Skills</option>
                {COMMON_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Accommodation</label>
              <select
                name="accommodation"
                id="accommodation"
                value={filters.accommodation}
                onChange={(e) => handleFilterChange('accommodation', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">Any</option>
                <option value="Required">Required</option>
                <option value="Non Required">Non Required</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contract Type</label>
              <select
                name="contractType"
                id="contractType"
                value={filters.contractType}
                onChange={(e) => handleFilterChange('contractType', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">Any</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Range</label>
              <select
                name="salaryRange"
                id="salaryRange"
                value={`${filters.minSalary}-${filters.maxSalary}`}
                onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
              >
                <option value="">Any Salary</option>
                {SALARY_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div
            key={member.id}
            onClick={() => handleNavigateToStaff(member.id)}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={member.name || 'Staff'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl font-medium text-gray-400">
                    {member.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <button
                onClick={(e) => handleFavorite(member, e)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  className={favorites.has(member.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <VerifiedIcon verified={member.verified || false} />
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {member.level || 'N/A'}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{member.role}</p>
                <p>{member.location}</p>
                <p>{member.experience} years experience</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.skills?.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      )}

      {!loading && staff.length === 0 && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No staff found matching your criteria.</p>
          </div>
        </div>
      )}

      <ScheduleReminderModal 
        isOpen={showScheduleReminder}
        onClose={handleCloseReminder}
        showCount={scheduleReminderCount}
      />
    </div>
  );
}