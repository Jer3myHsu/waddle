import { Component, EventEmitter, Input, Output, WritableSignal, signal } from '@angular/core';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent {
  @Output() keyPress = new EventEmitter<string>();

  keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
  ];

  getKeyColumnSize(index: number, row: number, first: boolean, last: boolean) {
    let left = (index * 2) + 1;

    if (row > 0) {
      left++;
    }
    let right = left + 2;

    if (row === 2 && first) {
      left--;
    } else if (row === 2 && last) {
      right++;
    }
    return `${left}/${right}`;
  }
}
