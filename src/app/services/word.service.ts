import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  constructor(private httpClient: HttpClient) { }

  getRandomWord(wordLength: number): Observable<string> {
    const url = 'https://random-word-api.herokuapp.com/word';
    return this.httpClient.get<string[]>(url, {params: {length: wordLength, lang: 'en'}}).pipe(
      map(word => word[0]?.toUpperCase()),
      catchError(() => of('crash')));
  }
}
