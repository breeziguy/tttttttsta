import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Users, Calendar, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import NotificationBell from '../../components/NotificationBell';

interface DashboardStats {
  activeStaffCount: number;
  pendingInterviews: number;
}

interface Activity {
  id: string;
  type: 'hire' | 'interview' | 'subscription' | 'report';
  description: string;
  date: string;
}

export default function Overview() {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    activeStaffCount: 0,
    pendingInterviews: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        setConnectionError(false);

        // Fetch active staff count
        const { data: staffData, error: staffError } = await supabase
          .from('staff_hiring_status')
          .select('id, staff:staff_id(name)')
          .eq('client_id', profile.id)
          .eq('status', 'hired');

        if (staffError) throw staffError;

        // Fetch pending interviews
        const { data: interviewData, error: interviewError } = await supabase
          .from('staff_interviews')
          .select('id, staff:staff_id(name)')
          .eq('client_id', profile.id)
          .eq('status', 'scheduled');

        if (interviewError) throw interviewError;

        // Get recent activities
        const activities: Activity[] = [];

        // Get recent hires
        const { data: hires, error: hiresError } = await supabase
          .from('staff_hiring_status')
          .select(`
            id,
            created_at,
            staff:staff_id (name)
          `)
          .eq('client_id', profile.id)
          .eq('status', 'hired')
          .order('created_at', { ascending: false })
          .limit(5);

        if (hiresError) throw hiresError;

        hires?.forEach(hire => {
          if (hire.staff?.name) {
            activities.push({
              id: hire.id,
              type: 'hire',
              description: `You hired ${hire.staff.name}`,
              date: hire.created_at
            });
          }
        });

        // Get recent interviews
        const { data: interviews, error: interviewsError } = await supabase
          .from('staff_interviews')
          .select(`
            id,
            created_at,
            staff:staff_id (name)
          `)
          .eq('client_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (interviewsError) throw interviewsError;

        interviews?.forEach(interview => {
          if (interview.staff?.name) {
            activities.push({
              id: interview.id,
              type: 'interview',
              description: `You scheduled an interview with ${interview.staff.name}`,
              date: interview.created_at
            });
          }
        });

        // Sort activities by date
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setStats({
          activeStaffCount: staffData?.length || 0,
          pendingInterviews: interviewData?.length || 0
        });
        setRecentActivities(activities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setConnectionError(true);
        toast.error('Unable to load dashboard data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard data. Please check your connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome section with background image */}
      <div 
        className="relative rounded-lg shadow-sm p-6 mb-6 h-[200px] overflow-hidden"
        style={{
          backgroundImage: 'url("/02 - RECTANGLE.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold mb-2" 
                style={{ color: '#CAED63' }}
              >
                {getGreeting()}, {profile?.full_name || user?.email || 'User'}
              </h1>
              <p 
                className="text-xl"
                style={{ color: '#CAED63' }}
              >
                {profile?.subscription_tier?.charAt(0).toUpperCase() + profile?.subscription_tier?.slice(1)} Plan
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.activeStaffCount}</h3>
              <p className="text-gray-600">Active Staff</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.pendingInterviews}</h3>
              <p className="text-gray-600">Pending Interviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {profile?.account_status ? profile.account_status.charAt(0).toUpperCase() + profile.account_status.slice(1) : 'Active'}
              </h3>
              <p className="text-gray-600">Account Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  activity.type === 'hire' ? 'bg-green-100' :
                  activity.type === 'interview' ? 'bg-blue-100' :
                  activity.type === 'subscription' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'hire' ? <Users className="text-green-600" size={16} /> :
                   activity.type === 'interview' ? <Calendar className="text-blue-600" size={16} /> :
                   <Clock className="text-gray-600" size={16} />}
                </div>
                <div>
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-center py-8">
            No Recent Activity to Display
          </div>
        )}
      </div>
    </>
  );
}