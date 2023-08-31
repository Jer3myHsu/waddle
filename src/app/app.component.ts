import { Component, HostListener, OnInit, Signal, WritableSignal, computed, effect, signal, untracked } from '@angular/core';
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
  ), {initialValue: 'WATER'});
  input: WritableSignal<KeyTile[]> = signal([]);
  guess: WritableSignal<KeyTile[]> = signal([]);

  attempt: Signal<KeyTile[]> = computed(() => {
    if (this.guess()?.length < Config.wordLength || this.answer()?.length < Config.wordLength) {
      return [];
    }
    const guess = structuredClone(this.guess());
    for (let i = 0; i < Config.wordLength; i++) {
      if (guess[i].key === this.answer()?.[i]) {
        guess[i].status = KeyStatus.Correct;
      }
      for (const keyTile of guess) {
        if (keyTile.key === this.answer()?.[i] && keyTile.status === KeyStatus.None) {
          keyTile.status = KeyStatus.Partial;
          break;
        }
      }
    }
    return guess;
  });
  attemptNumber: WritableSignal<number> = signal(Config.tries);
  guessHistory: WritableSignal<KeyTile[][]> = signal([]);
  keyHistory: WritableSignal<KeyTile[]> = signal([]);


  constructor(private wordService: WordService) {
    effect(() => {
      if (this.attempt().reduce((isCorrect, keyTile) => keyTile.status === KeyStatus.Correct && isCorrect, !!this.attempt()?.length)) {
        console.log('You Win');
      } else if (this.attemptNumber() <= 0) {
        console.log('You Lose');
      }
      // this.answer.
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const { key } = event;
    if (/^[A-Z]$/i.test(key)) {
      this.keyPress(key.toUpperCase());
    } else if (key === 'Backspace' || key === 'Enter') {
      this.keyPress(key);
    }
  }

  keyPress(key: string) {
    switch (key) {
      case 'Backspace':
        this.input.update(w => w.slice(0, -1));
        break;
      case 'Enter':
        if (this.input().length === Config.wordLength) {
          this.guess.set(this.input());
          this.guessHistory.mutate(history => {
            history.push(this.attempt());
          });
          this.attemptNumber.update(t => t - 1);
          this.input.set([]);
        }
        break;
      default:
        if (this.input().length < Config.wordLength) {
          this.input.mutate(i => i.push({key, status: KeyStatus.None}));
        }
    }
  }

  ngOnInit(): void {
  }

}
