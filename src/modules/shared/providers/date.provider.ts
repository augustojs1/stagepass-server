import { Injectable } from '@nestjs/common';

import { compareAsc } from 'date-fns';

@Injectable()
export class DateProvider {
  isAfter(first_date: Date, second_date: Date): boolean {
    const result = compareAsc(first_date, second_date);

    if (result === -1) {
      return true;
    }

    return false;
  }
}
