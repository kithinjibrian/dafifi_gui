import { DateTime } from 'luxon';

export const time = (utcTime: string, timezone: string = 'UTC'): string => {
    const utcDate = DateTime.fromISO(utcTime, { zone: 'utc' });
    const localTime = utcDate.setZone(timezone);
    return localTime.toFormat('HH:mm');
};
