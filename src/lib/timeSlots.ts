/**
 * Parses a duration string (e.g. "2 hours", "90 min") into a number of hours.
 */
export function parseDuration(duration: string): number {
    let hours = 0;
    if (duration.toLowerCase().includes('hour')) {
      const match = duration.match(/(\d+(\.\d+)?)/);
      if (match && match[1]) {
        hours = parseFloat(match[1]);
      }
    } else if (duration.toLowerCase().includes('min')) {
      const match = duration.match(/(\d+)/);
      if (match && match[1]) {
        hours = parseInt(match[1]) / 60;
      }
    }
    return hours;
  }
  
  function formatHour(hour: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${ampm}`;
  }
  
  /**
   * Generates time slots between 8:00 AM and 4:00 PM, spaced by the hike's duration in hours.
   */
  export function generateIntervals(durationInHours: number): string[] {
    const slots: string[] = [];
    const startHour = 8;
    const endHour = 16; // 4:00 PM
    for (let hour = startHour; hour + durationInHours <= endHour; hour += durationInHours) {
      slots.push(formatHour(hour));
    }
    return slots;
  }
  
  /**
   * Based on the hike's duration string (from the hike info), returns time slots.
   */
  export function getTimeSlotsBasedOnDuration(durationStr: string): string[] {
    const hours = parseDuration(durationStr);
    if (hours === 0) {
      return generateIntervals(1);
    }
    return generateIntervals(hours);
  }
  