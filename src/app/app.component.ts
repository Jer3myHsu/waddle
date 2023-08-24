import { Component, HostListener, OnInit, Signal, WritableSignal, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WordService } from './services/word.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  randomWord: Signal<string | undefined> = toSignal(this.wordService.getRandomWord());
  guess: WritableSignal<string> = signal('');


  constructor(private wordService: WordService) {
    effect(() => console.log(this.randomWord()));
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
        this.guess.update(w => w.substring(0, w.length - 1));
        break;
      case 'Enter':
        if (this.guess().length === 5) {
          this.checkWord(this.guess());
          this.guess.set('');
        }
        break;
      default:
        if (this.guess().length < 5) {
          this.guess.update(w => w + key);
        }
    }

    console.log(this.guess())
  }

  checkWord(guess: string) {
    console.log(guess);
  }

  ngOnInit(): void {
  }


}
