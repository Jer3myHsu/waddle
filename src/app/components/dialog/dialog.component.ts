import { Component, Input } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  @Input() title = '';
  @Input() body = '';

  dialogRef

  constructor(private DialogService: DialogService) {
    this.dialogRef = DialogService;
  }

}
