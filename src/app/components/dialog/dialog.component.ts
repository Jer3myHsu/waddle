import { Component, HostListener, Input } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  @Input() title = '';
  @Input() body = '';

  constructor(private DialogService: DialogService) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.dialogRef.close(true);
    }
  }

  get dialogRef() {
    return this.DialogService;
  }

}
