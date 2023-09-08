import { ApplicationRef, ComponentRef, EnvironmentInjector, Injectable, createComponent } from '@angular/core';
import { DialogComponent } from '../components/dialog/dialog.component';
import { AsyncSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRef!: ComponentRef<DialogComponent>;
  private dialog!: AsyncSubject<any>;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open({title, body}: {title: string, body?: string}): Observable<any> {
    if (this.appRef.viewCount > 1) {
      this.close();
    }
    this.dialog = new AsyncSubject<any>();
    this.dialogRef = createComponent(DialogComponent, {
      environmentInjector: this.injector
    });

    this.dialogRef.setInput('title', title);
    this.dialogRef.setInput('body', body);

    document.body.appendChild(this.dialogRef.location.nativeElement);

    this.appRef.attachView(this.dialogRef.hostView);
    return this.dialog.asObservable();
  }

  close(returnValue?: any) {
    this.appRef.detachView(this.dialogRef.hostView);
    this.dialogRef.destroy();
    this.dialog.next(returnValue);
    this.dialog.complete();
    this.dialog.unsubscribe();
  }
}
