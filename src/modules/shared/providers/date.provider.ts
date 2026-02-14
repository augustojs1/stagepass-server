import { Injectable } from '@nestjs/common';

import { compareAsc, differenceInHours, isBefore, parse } from 'date-fns';

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
    const expiresAtDate = parse(
      expiresAt,
      'yyyy-MM-dd HH:mm:ss.SSS xx',
      new Date(),
    );

    return isBefore(expiresAtDate, now);
  }
}
