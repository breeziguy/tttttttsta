import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { Calendar, CreditCard, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  created_at: string;
  payment_reference: string;
  amount_paid: number;
  payment_status: string;
  subscription_plans: {
    name: string;
    price: number;
  };
}

export default function TransactionHistory() {
  const { profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [profile?.id]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('client_subscriptions')
        .select(`
          id,
          created_at,
          payment_reference,
          payment_status,
          amount_paid,
          subscription_plans (
            name,
            price
          )
        `)
        .eq('client_id', profile?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-gray-600">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50 px-6 py-3">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </div>
              <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan
              </div>
              <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </div>
              <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </div>
              <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase">
                Reference
              </div>
            </div>
          </div>

          <div className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't made any transactions yet.
                </p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-gray-900">
                        {transaction.subscription_plans.name}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        ₦{transaction.amount_paid.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.payment_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.payment_status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {transaction.payment_reference.slice(-8)}
                        </span>
                        <button
                          onClick={() => {
                            // Download receipt functionality
                            toast.success('Receipt downloaded');
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}