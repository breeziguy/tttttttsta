import { useEffect, useState } from 'react';

interface LoadingBarProps {
  duration?: number;
  onComplete?: () => void;
  mode: 'vetting' | 'home';
}

const VETTING_TIPS = [
  "Background checks help ensure workplace safety",
  "Verify credentials to prevent fraud",
  "Protect your family and business with proper vetting",
  "Due diligence saves time and money in the long run"
];

const HOME_TIPS = [
  "Welcome back to your dashboard",
  "Managing your staff made simple",
  "Access all your hiring tools in one place",
  "Track your staff performance easily"
];

export default function LoadingBar({ duration = 3000, onComplete, mode }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tips = mode === 'vetting' ? VETTING_TIPS : HOME_TIPS;

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const tipInterval = duration / tips.length;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      setCurrentTip(Math.min(Math.floor(elapsed / tipInterval), tips.length - 1));

      if (now < endTime) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [duration, onComplete, tips.length]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-lg w-full px-8">
        <div className="text-2xl font-medium text-gray-900 text-center mb-4">
          {mode === 'vetting' ? 'Switching to Vetting Portal' : 'Returning to Dashboard'}
        </div>
        <div className="text-lg text-gray-600 text-center mb-8 min-h-[3rem] transition-all duration-300">
          {tips[currentTip]}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}