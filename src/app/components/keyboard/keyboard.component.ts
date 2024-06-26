import { state, style, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KeyStatus } from 'src/app/enums/key-status';
import { KeyTile } from 'src/app/models/key-tile';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss'],
  animations: [
    trigger('fade', [
      state('*', style({
        transition: 'all 0.25s ease-out'
      }))
    ])
  ]
})
export class KeyboardComponent {
  @Output() keyPress = new EventEmitter<string>();
  @Input() keyColor: {[key: string]: KeyTile} = {};

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

  getKeyColor(key: string): string {
    switch (this.keyColor[key]?.status) {
      case KeyStatus.Partial:
        return 'goldenrod';
      case KeyStatus.Correct:
        return 'darkgreen';
      case KeyStatus.Used:
        return '#e7c789';
    }
    return '';
  }
}
