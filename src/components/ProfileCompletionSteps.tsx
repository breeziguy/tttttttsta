import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Check, ChevronRight, Users, Building2, CreditCard } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  path: string;
}

export default function ProfileCompletionSteps() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Personal details about you',
      icon: <Users className="w-5 h-5" />,
      completed: false,
      path: '/dashboard/settings'
    },
    {
      id: 'company',
      title: 'Setup your company',
      description: 'Everything about your company',
      icon: <Building2 className="w-5 h-5" />,
      completed: false,
      path: '/dashboard/settings'
    }
  ]);

  useEffect(() => {
    if (profile) {
      // Filter steps based on account type
      const filteredSteps = steps.filter(step => {
        if (profile.account_type === 'individual') {
          return step.id !== 'company';
        }
        return true;
      });

      // Update completion status
      const updatedSteps = filteredSteps.map(step => {
        if (step.id === 'profile') {
          return { ...step, completed: !!profile.full_name };
        }
        if (step.id === 'company' && profile.account_type === 'corporate') {
          return { ...step, completed: !!profile.company_name };
        }
        return step;
      });

      setSteps(updatedSteps);
    }
  }, [profile]);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Complete these steps</h2>
      <p className="text-sm text-gray-500 mb-4">
        Complete your profile to access all features
      </p>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center group cursor-pointer"
            onClick={() => navigate(step.path)}
          >
            <div className="flex-shrink-0">
              {step.completed ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${step.completed ? 'text-green-500 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </div>
              {index < steps.length - 1 && (
                <div className="mt-2 ml-4 border-l-2 border-gray-100 h-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}