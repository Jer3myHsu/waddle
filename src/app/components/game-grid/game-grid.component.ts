import { Component, Input, OnInit } from '@angular/core';
import { Config } from 'src/app/config';
import { KeyStatus } from 'src/app/enums/key-status';
import { KeyTile } from 'src/app/models/key-tile';

@Component({
  selector: 'app-game-grid',
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.scss']
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
