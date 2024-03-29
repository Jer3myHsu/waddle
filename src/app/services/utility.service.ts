import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  loopArray<T>(arr: T[], action: (item: T) => void, options: {delay?: number, immediateStart?: boolean} = {delay: 1000, immediateStart: true}, callback?: () => void) {
    setTimeout(() => {
      action(arr[0]);
      const newArr = arr.slice(1);
      if (newArr.length) {
        this.loopArray(newArr, action, {delay: options.delay, immediateStart: false}, callback);
      } else {
        callback?.();
      }
    }, options.immediateStart ? 0 : options.delay);
  }
}
