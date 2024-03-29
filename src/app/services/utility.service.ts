import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  private loopTimeout<T>(arr: T[], action: (item: T) => void, delay: number = 1000, callback?: () => void) {
    setTimeout(() => {
      this.loopArray(arr, action, delay, callback);
    }, delay);
  }

  loopArray<T>(arr: T[], action: (item: T) => void, delay: number = 1000, callback?: () => void) {
    action(arr[0]);
    const newArr = arr.slice(1);
    if (newArr.length) {
      this.loopTimeout(newArr, action, delay, callback);
    } else {
      callback?.();
    }
  }
}
