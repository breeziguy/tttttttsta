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

  // Generate available time slots from 6 AM to 5:30 PM in 30-minute intervals with AM/PM
  const timeSlots = [];
  for (let hour = 6; hour < 18; hour++) {
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    timeSlots.push(`${displayHour}:00 ${ampm}`);
    // Add 5:30 PM slot, avoid adding 6:00 PM
    if (hour !== 17) {
        timeSlots.push(`${displayHour}:30 ${ampm}`);
    }
  }

  // Get next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(selectedDate);
      const [timePart, ampm] = selectedTime.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (ampm === 'AM' && hours === 12) { // Handle midnight case (12 AM)
        hours = 0;
      }

      dateTime.setHours(hours, minutes);
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
          Return
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