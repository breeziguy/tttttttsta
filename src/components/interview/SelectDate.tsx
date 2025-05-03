import { useState } from 'react';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SelectDateProps {
  staffId: string;
  staffName: string;
  onNext: (date: Date) => void;
  onBack: () => void;
}

export default function SelectDate({ staffId, staffName, onNext, onBack }: SelectDateProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const navigate = useNavigate();

  // Generate available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00'
  ];

  // Get next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      onNext(dateTime);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Schedule Interview</h2>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Return to Results
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Date</h3>
        <div className="grid grid-cols-7 gap-2">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`p-4 rounded-lg border text-center ${
                selectedDate?.toDateString() === date.toDateString()
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-2xl font-semibold mt-1">
                {date.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Time</h3>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`p-3 rounded-lg border text-center ${
                selectedTime === time
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">{time}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}