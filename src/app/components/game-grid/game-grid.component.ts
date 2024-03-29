import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { Config } from 'src/app/config';
import { KeyStatus } from 'src/app/enums/key-status';
import { KeyTile } from 'src/app/models/key-tile';

@Component({
  selector: 'app-game-grid',
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: '0',
          transform: 'translate(-50%, -50%) scale(1.5)'
        }),
        animate('.25s ease-out', style({ opacity: '1', transform: 'translate(-50%, -50%)' })),
      ]),
    ]),
    trigger('reveal', [
      transition(':enter', [
        style({ backgroundColor: '#f5deb3' }),
        animate('0.1s {{delay}}s ease-out', style({ transform: 'translateY(-10px)', backgroundColor: '#f5deb3' })),
        animate('0.3s ease-out', style({})),
      ], {params: {delay: 0}})
    ]),
  ]
})
export class GameGridComponent {
  @Input() guesses: KeyTile[][] = [];
  @Input() input: KeyTile[] = [];

  get emptyTiles(): any[] {
    return new Array((Config.wordLength * Config.tries) - this.guesses.flat().length - this.input.length);
  }

  getTileColor(keyStatus: KeyStatus): {[klass: string]: any} {
    switch (keyStatus) {
      case KeyStatus.Correct:
        return {'background-color': 'darkgreen'};
      case KeyStatus.Partial:
        return {'background-color': 'goldenrod'};
    }
    return {};
  }
}
