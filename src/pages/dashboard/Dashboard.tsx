import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import Overview from './Overview';
import DiscoverStaff from './DiscoverStaff';
import Interviews from './Schedule';
import MyHires from './Hiring';
import Settings from './Settings';
import TransactionHistory from './TransactionHistory';
import StaffDetails from '../../components/StaffDetails';
import Vetting from './Vetting';
import Resources from './Resources';
import Performance from './Performance';
import HelpCenter from './HelpCenter';
import LoadingBar from '../../components/LoadingBar';
import Logo from '../../components/Logo';
import {
  LayoutGrid,
  Users,
  UserPlus,
  Wallet,
  LineChart,
  Clock,
  FileText,
  FileSearch2,
  CalendarDays,
  HelpCircle,
  Settings as SettingsIcon,
  Menu,
  X,
  Receipt,
  Database,
  FileDown,
  History,
  Home,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isVettingMode, setIsVettingMode] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'vetting' | 'home'>('home');

  useEffect(() => {
    const lastPath = localStorage.getItem('dashboardPath');
    if (lastPath && lastPath !== '/') {
      navigate(lastPath);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardPath', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const isVetting = location.pathname.includes('/dashboard/vetting');
    setIsVettingMode(isVetting);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return currentPath.includes(path);
  };

  const getRandomDuration = () => {
    return Math.floor(Math.random() * (5000 - 3000 + 1) + 3000);
  };

  const handleVettingClick = async () => {
    setLoadingMode('vetting');
    setShowLoadingBar(true);
    navigate('/dashboard/vetting');
    setCurrentPath('/dashboard/vetting');
  };

  const handleBackToHome = async () => {
    setLoadingMode('home');
    setShowLoadingBar(true);
    navigate('/dashboard');
    setCurrentPath('/dashboard');
  };

  const handleLoadingComplete = () => {
    setShowLoadingBar(false);
  };

  const renderSidebarItems = () => {
    if (isVettingMode) {
      return (
        <>
          <a
            href="/dashboard/vetting"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard/vetting');
              setCurrentPath('/dashboard/vetting');
            }}
            className={`flex items-center px-3 py-2 text-sm rounded-lg ${
              isActivePath('/dashboard/vetting')
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Database size={18} className="mr-3" />
            Vetting Database
          </a>

          <a
            href="/dashboard/vetting/requests"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard/vetting/requests');
              setCurrentPath('/dashboard/vetting/requests');
            }}
            className={`flex items-center px-3 py-2 text-sm rounded-lg ${
              isActivePath('/dashboard/vetting/requests')
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileSearch2 size={18} className="mr-3" />
            Vetting Requests
          </a>

          <a
            href="/dashboard/vetting/history"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard/vetting/history');
              setCurrentPath('/dashboard/vetting/history');
            }}
            className={`flex items-center px-3 py-2 text-sm rounded-lg ${
              isActivePath('/dashboard/vetting/history')
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History size={18} className="mr-3" />
            Verification Reports
          </a>

          <div className="border-t my-4"></div>

          <a
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleBackToHome();
            }}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Home size={18} className="mr-3" />
            Dashboard
          </a>
        </>
      );
    }

    return (
      <>
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
            setCurrentPath('/dashboard');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard') && !isActivePath('/dashboard/discover')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid size={18} className="mr-3" />
          Dashboard
        </a>

        <a
          href="/dashboard/discover"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/discover');
            setCurrentPath('/dashboard/discover');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/discover')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users size={18} className="mr-3" />
          Discover Employee
        </a>

        <a
          href="/dashboard/hiring"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/hiring');
            setCurrentPath('/dashboard/hiring');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/hiring')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserPlus size={18} className="mr-3" />
          My Hires
        </a>

        <a
          href="/dashboard/vetting"
          onClick={(e) => {
            e.preventDefault();
            handleVettingClick();
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/vetting')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileSearch2 size={18} className="mr-3" />
          Vetting
        </a>

        <a
          href="/dashboard/performance"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/performance');
            setCurrentPath('/dashboard/performance');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/performance')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LineChart size={18} className="mr-3" />
          Performance
        </a>

        <a
          href="/dashboard/resources"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/resources');
            setCurrentPath('/dashboard/resources');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/resources')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock size={18} className="mr-3" />
          Training & Guides
        </a>

        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          <FileText size={18} className="mr-3" />
          Documents
        </a>

        <a
          href="/dashboard/schedule"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/schedule');
            setCurrentPath('/dashboard/schedule');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/schedule')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CalendarDays size={18} className="mr-3" />
          Interviews
        </a>

        <a
          href="/dashboard/transactions"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/transactions');
            setCurrentPath('/dashboard/transactions');
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            isActivePath('/dashboard/transactions')
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Receipt size={18} className="mr-3" />
          Transactions
        </a>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showLoadingBar && (
        <LoadingBar
          duration={getRandomDuration()}
          onComplete={handleLoadingComplete}
          mode={loadingMode}
        />
      )}

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Company Logo */}
          <div className="flex flex-col p-4 border-b">
            <div className="flex items-center">
              <Logo />
              <div className="ml-3">
                <div className="font-semibold text-gray-900">{profile?.full_name || 'User'}</div>
                <div className="text-xs text-gray-500">{profile?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {renderSidebarItems()}
          </nav>

          {/* Settings and Help */}
          {!isVettingMode && (
            <div className="p-4 space-y-1">
              <a
                href="/dashboard/help"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard/help');
                  setCurrentPath('/dashboard/help');
                }}
                className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                  isActivePath('/dashboard/help')
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <HelpCircle size={18} className="mr-3" />
                Help Center
              </a>
              <a
                href="/dashboard/settings"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard/settings');
                  setCurrentPath('/dashboard/settings');
                }}
                className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                  isActivePath('/dashboard/settings')
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SettingsIcon size={18} className="mr-3" />
                Manage Account
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:ml-64 p-8 ${showLoadingBar ? 'invisible' : 'visible'}`}>
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="discover" element={<DiscoverStaff />} />
            <Route path="schedule" element={<Interviews />} />
            <Route path="hiring" element={<MyHires />} />
            <Route path="settings" element={<Settings />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="vetting/*" element={<Vetting />} />
            <Route path="resources" element={<Resources />} />
            <Route path="performance" element={<Performance />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="staff/:id" element={<StaffDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}