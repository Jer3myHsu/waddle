import { Component, HostListener, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WordService } from './services/word.service';
import { KeyStatus } from './enums/key-status';
import { KeyTile } from './models/key-tile';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Config } from './config';
import { DialogService } from './services/dialog.service';
import { UtilityService } from './services/utility.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('filter', [
      state('white', style({
        backdropFilter: 'grayscale(1)'
      })),
      state('berry', style({
        backdropFilter: 'hue-rotate(200deg)'
      })),
      transition('* => *', [
        animate(500)
      ])
    ]),
    trigger('twist', [
      transition(':enter', []),
      transition('* => *', [
        animate('1s', style({ transform: 'rotate(360deg)' })),
        animate(0, style({}))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {

  newGame$ = new BehaviorSubject<any>(undefined);

  answer: Signal<string> = toSignal(this.newGame$.pipe(
    switchMap(() => this.wordService.getRandomWord(Config.wordLength))
  ), {initialValue: 'CRASH'});
  easterEgg: WritableSignal<any> = signal({});
  input: WritableSignal<KeyTile[]> = signal([]);

  attempt: Signal<KeyTile[]> = computed(() => {
    if (this.input()?.length < Config.wordLength || this.answer()?.length < Config.wordLength) {
      return [];
    }
    const guess = structuredClone(this.input());
    for (let i = 0; i < Config.wordLength; i++) {
      if (guess[i].key === this.answer()?.[i]) {
        guess[i].status = KeyStatus.Correct;
        continue;
      }
      for (const keyTile of guess) {
        if (keyTile.key === this.answer()?.[i] && keyTile.status === KeyStatus.Used) {
          keyTile.status = KeyStatus.Partial;
          break;
        }
      }
    }
    return guess;
  });
  triesLeft: WritableSignal<number> = signal(Config.tries);
  blockInput: WritableSignal<boolean> = signal(false);
  guessHistory: WritableSignal<KeyTile[][]> = signal([]);
  keyHistory: WritableSignal<{[key: string]: KeyTile}> = signal({});


  constructor(
    private dialogService: DialogService,
    private utilityService: UtilityService,
    private wordService: WordService
  ) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.dialogService.isOpen())
      return;
    const { key } = event;
    if (/^[A-Z]$/i.test(key)) {
      this.keyPress(key.toUpperCase());
    } else if (key === 'Backspace' || key === 'Enter') {
      this.keyPress(key);
    }
  }

  private enterWord() {
    this.blockInput.set(true);
    this.guessHistory.mutate(history => {
      history.push(this.attempt());
    });
    this.keyHistory.mutate(history => {
      this.utilityService.loopArray(this.attempt(), keyTile => {
        history[keyTile.key] = {
          key: keyTile.key,
          status: this.pickStatus(keyTile.status, history[keyTile.key]?.status)
        };
      }, 400, () => {
        this.triesLeft.update(t => t - 1);
        this.checkWin();
        this.input.set([]);
        this.blockInput.set(false);
      });
    });
  }

  private pickStatus(statusOne: KeyStatus, statusTwo: KeyStatus): KeyStatus {
    if (statusOne === KeyStatus.Correct || statusTwo === KeyStatus.Correct) {
      return KeyStatus.Correct;
    }
    if (statusOne === KeyStatus.Partial || statusTwo === KeyStatus.Partial) {
      return KeyStatus.Partial;
    }
    return KeyStatus.Used;
  }

  private checkWin() {
    if (this.attempt().every((keyTile) => keyTile.status === KeyStatus.Correct)) {
      this.triesLeft.set(0);
      this.openNewGameDialog({
        title: {
          text: 'You Won!',
          icon: 'fa-solid fa-trophy'
        },
        confirmButton: {
          text: 'New Game',
          icon: 'fa-solid fa-bolt'
        }
      });
    } else if (this.triesLeft() <= 0) {
      this.openNewGameDialog({
        title: {
          text: 'You Lost!',
          icon: 'fa-regular fa-face-frown'
        },
        body: `The correct word was ${this.answer()}.`,
        confirmButton: {
          text: 'New Game',
          icon: 'fa-solid fa-bolt'
        }
      });
    } else {
      // easter egg
      switch (this.attempt().reduce((word, tile) => word + tile.key, '')) {
        case 'CHEAT':
          this.dialogService.open({
            title: {
              text: 'Psst...',
              icon: 'fa-solid fa-ghost'
            },
            body: `The correct word is ${this.answer()}.`,
            cancelButton: {
              hidden: true
            }
          });
          break;
        case 'WHITE':
        case 'BERRY':
        case 'CLEAR':
          this.easterEgg.mutate(easterEgg => easterEgg.filter = this.attempt().reduce((word, tile) => word + tile.key, '').toLowerCase());
          break;
        case 'NESSA':
          break;
        case 'LIGHT':
          break;
        case 'NIGHT':
          break;
        case 'TWIST':
          this.easterEgg.mutate(easterEgg => easterEgg.twist = Math.random());
          break;
        default:
      }
    }
  }

  private openNewGameDialog(data: any) {
    this.dialogService.open(data).subscribe((startNewGame: boolean) => {
      if (startNewGame) {
        this.resetGame();
      }
    });
  }

  clickNewGame(button: HTMLButtonElement) {
    if (this.blockInput())
      return;
    this.triesLeft() ? this.openNewGameDialog({title: {text: 'New Game?'}}) : this.resetGame(button);
  }

  keyPress(key: string) {
    if (!this.triesLeft() || this.blockInput()) {
      return;
    }
    switch (key) {
      case 'Backspace':
        this.input.update(w => w.slice(0, -1));
        break;
      case 'Enter':
        if (this.input().length === Config.wordLength) {
          this.enterWord();
        }
        break;
      default:
        if (this.input().length < Config.wordLength) {
          this.input.mutate(i => i.push({key, status: KeyStatus.Used}));
        }
    }
  }

  resetGame(button?: HTMLButtonElement) {
    button?.blur();
    this.newGame$.next(undefined);
    this.blockInput.set(false);
    this.input.set([]);
    this.triesLeft.set(Config.tries);
    this.guessHistory.set([]);
    this.keyHistory.set({});
  }

  ngOnInit(): void {
  }

}
