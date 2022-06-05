import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'map',
  pure: true,
})
export class MapPipe implements PipeTransform {
  transform<T, R>(thisArgs: T, transformFunc: (t: T, ...others: any[]) => R, ...args: any[]): R {
    return transformFunc(thisArgs, ...args);
  }
}
