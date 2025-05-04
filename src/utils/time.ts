import { DateTime } from 'luxon';

export const time = (utcTime: string, timezone?: string): string => {
    if (!utcTime) return "";

    const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const utcDate = DateTime.fromISO(utcTime, { zone: 'utc' });
    if (!utcDate.isValid) return "";

    const localTime = utcDate.setZone(userTimezone);
    return localTime.toFormat('HH:mm');
};

