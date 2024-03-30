import { ApplicationRef, ComponentRef, EnvironmentInjector, Injectable, createComponent } from '@angular/core';
import { DialogComponent } from '../components/dialog/dialog.component';
import { AsyncSubject, Observable, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRef!: ComponentRef<DialogComponent>;
  private dialog!: AsyncSubject<any>;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
    ) { }

  open({title, body, cancelButton, confirmButton}: {title?: any, body?: string, cancelButton?: any, confirmButton?: any}): Observable<any> {
    if (this.appRef.viewCount > 1) {
      this.close();
    }
    this.dialog = new AsyncSubject<any>();
    this.dialogRef = createComponent(DialogComponent, {
      environmentInjector: this.injector
    });

    if (title)
      this.dialogRef.setInput('title', title);
    if (body)
      this.dialogRef.setInput('body', body);
    if (cancelButton)
      this.dialogRef.setInput('cancelButton', cancelButton);
    if (confirmButton)
      this.dialogRef.setInput('confirmButton', confirmButton);

    document.body.appendChild(this.dialogRef.location.nativeElement);

    this.appRef.attachView(this.dialogRef.hostView);
    return this.dialog.asObservable();
  }

  isOpen() {
    return this.dialog ? !this.dialog.closed : false;
  };

  close(returnValue?: any) {
    this.dialog.next(returnValue);
    this.dialog.complete();
    this.dialog.unsubscribe();
    timer(250).subscribe(() => {
      this.appRef.detachView(this.dialogRef.hostView);
      this.dialogRef.destroy();
    });
  }
}
