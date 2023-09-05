import { Component, HostListener, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WordService } from './services/word.service';
import { KeyStatus } from './enums/key-status';
import { KeyTile } from './models/key-tile';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Config } from './config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  newGame$ = new BehaviorSubject<any>(undefined);

  answer: Signal<string> = toSignal(this.newGame$.pipe(
    switchMap(() => this.wordService.getRandomWord(Config.wordLength))
  ), {initialValue: 'CRASH'});
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
  guessHistory: WritableSignal<KeyTile[][]> = signal([]);
  keyHistory: WritableSignal<{[key: string]: KeyTile}> = signal({});


  constructor(private wordService: WordService) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const { key } = event;
    if (/^[A-Z]$/i.test(key)) {
      this.keyPress(key.toUpperCase());
    } else if (key === 'Backspace' || key === 'Enter') {
      this.keyPress(key);
    }
  }

  private enterWord() {
    this.guessHistory.mutate(history => {
      history.push(this.attempt());
    });
    this.keyHistory.mutate(history => {
      this.attempt().forEach(keyTile => {
        history[keyTile.key] = {
          key: keyTile.key,
          status: this.pickStatus(keyTile.status, history[keyTile.key]?.status)
        };
      });
    });
    this.triesLeft.update(t => t - 1);
    this.checkWin();
    this.input.set([]);
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
    if (this.attempt().reduce((isCorrect, keyTile) => keyTile.status === KeyStatus.Correct && isCorrect, !!this.attempt()?.length)) {
      this.triesLeft.set(0);
      console.log('You Win');
    } else if (this.triesLeft() <= 0) {
      console.log('You Lose');
    }
  }

  keyPress(key: string) {
    if (!this.triesLeft()) {
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

  resetGame(button: HTMLButtonElement) {
    button.blur();
    this.newGame$.next(undefined);
    this.input.set([]);
    this.triesLeft.set(Config.tries);
    this.guessHistory.set([]);
    this.keyHistory.set({});
  }

  ngOnInit(): void {
  }

}
