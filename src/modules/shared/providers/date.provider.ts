import { Injectable } from '@nestjs/common';
import { compareAsc, differenceInHours, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class DateProvider {
  isAfter(first_date: Date, second_date: Date): boolean {
    const result = compareAsc(first_date, second_date);

    if (result === -1) {
      return true;
    }

    return false;
  }

  differenceInHours(first_date: Date, second_date: Date): number {
    const result = differenceInHours(first_date, second_date);

    return result;
  }

  isExpired(expiresAt: string, now: Date = new Date()): boolean {
    console.log('expiresAt.:', expiresAt);
    console.log('now.:', now);

    const expiresAtDate = new Date(expiresAt);

    if (isNaN(expiresAtDate.getTime())) {
      throw new Error('Invalid expiresAt date');
    }

    return expiresAtDate.getTime() <= now.getTime();
  }

  unixToTimezoneTimestamp(unixTimestamp: number, timezone: string): string {
    const date = new Date(unixTimestamp * 1000);

    const zonedDate = toZonedTime(date, timezone);

    return format(zonedDate, 'yyyy-MM-dd HH:mm:ss.SSS xxx');
  }
}
