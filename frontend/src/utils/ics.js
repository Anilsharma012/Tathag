export const downloadICS = ({ title, description = '', startTime, endTime, timezone = 'Asia/Kolkata', url = '' }) => {
  const dt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${Date.now()}@tathagat-live`;
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TathaGat//LiveClasses//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(startTime)}`,
    `DTEND:${dt(endTime)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description + (url ? `\\nJoin: ${url}` : ''))}` : (url ? `DESCRIPTION:${escapeText('Join: ' + url)}` : ''),
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${sanitize(title)}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const escapeText = (t) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const sanitize = (t) => t.replace(/[^a-z0-9-_]+/gi, '-').substring(0, 64);
