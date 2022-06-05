import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'streamDate' })
export class StreamDatePipe implements PipeTransform {
  locale = 'en-US';
  transform(value: any, pattern?: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    if (!(value instanceof Date)) {
      return value;
    }

    let dateFormat = pattern ? pattern : 'dd.MM.YYYY HH:mm:ss:SS';

    return new DatePipe(this.locale).transform(value, dateFormat);
  }
}
