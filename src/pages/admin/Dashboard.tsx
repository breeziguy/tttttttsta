import { useAuthStore } from '../../store/auth';

export default function AdminDashboard() {
  const { signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <button
        onClick={() => signOut()}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}