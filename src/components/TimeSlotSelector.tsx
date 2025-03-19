import React from 'react';
import { getTimeSlotsBasedOnDuration } from '@/lib/timeSlots';

interface TimeSlotSelectorProps {
  duration: string; // Duration of the hike as a string, e.g. "2 hours"
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ duration, selectedSlot, onSelectSlot }) => {
  const slots = getTimeSlotsBasedOnDuration(duration);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Select a Time Slot:</h3>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelectSlot(slot)}
            className={`px-3 py-2 border rounded transition-colors ${
              selectedSlot === slot
                ? 'bg-primary text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
