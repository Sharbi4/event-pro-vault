/**
 * Utility functions for generating calendar links (Google, Apple, Outlook)
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  durationHours?: number;
}

/**
 * Format date for Google Calendar (YYYYMMDDTHHmmssZ)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format date for ICS file (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, '');
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startDate = formatGoogleDate(event.startDate);
  const endDate = event.endDate 
    ? formatGoogleDate(event.endDate)
    : formatGoogleDate(new Date(event.startDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000));

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const startDate = event.startDate.toISOString();
  const endDate = event.endDate 
    ? event.endDate.toISOString()
    : new Date(event.startDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate,
    enddt: endDate,
    body: event.description,
    location: event.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS file content for Apple Calendar / other calendar apps
 */
export function generateICSContent(event: CalendarEvent): string {
  const startDate = formatICSDate(event.startDate);
  const endDate = event.endDate 
    ? formatICSDate(event.endDate)
    : formatICSDate(new Date(event.startDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000));
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@eventpros.app`;
  
  // Escape special characters for ICS format
  const escapeICS = (str: string) => str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventPros//Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.description)}
LOCATION:${escapeICS(event.location)}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

/**
 * Download ICS file for Apple Calendar
 */
export function downloadICSFile(event: CalendarEvent): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
