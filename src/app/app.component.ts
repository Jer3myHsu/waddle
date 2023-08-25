import { Component, HostListener, OnInit, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WordService } from './services/word.service';
import { KeyStatus } from './enums/key-status';

interface KeyTile {
  key: string,
  status: KeyStatus
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly wordLength = 5;
  readonly tries = 6;

  answer: Signal<string> = toSignal(this.wordService.getRandomWord(this.wordLength), {initialValue: 'WATER'});
  input: WritableSignal<KeyTile[]> = signal([]);
  guess: WritableSignal<KeyTile[]> = signal([]);

  attempt: Signal<KeyTile[]> = computed(() => {
    if (this.guess()?.length < this.wordLength || this.answer()?.length < this.wordLength) {
      return [];
    }
    const guess = structuredClone(this.guess());
    for (let i = 0; i < this.wordLength; i++) {
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
  attemptNumber: WritableSignal<number> = signal(6);


  constructor(private wordService: WordService) {
    effect(() => {
      if (this.attempt().reduce((isCorrect, keyTile) => keyTile.status === KeyStatus.Correct && isCorrect, true)) {
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
        if (this.input().length === this.wordLength) {
          console.log(this.input().reduce((word, keyTile) => word + keyTile.key, ''));
          this.guess.set(this.input());
          this.attemptNumber.update(t => t - 1);
          this.input.set([]);
        }
        break;
      default:
        if (this.input().length < this.wordLength) {
          this.input.update(w => {
            w.push({key, status: KeyStatus.None});
            return w;
          });
        }
    }
  }

  ngOnInit(): void {
  }

}
