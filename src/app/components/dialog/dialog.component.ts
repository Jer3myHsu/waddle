import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';

interface DialogElement {
  text?: string;
  icon?: string;
  hidden?: boolean;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
          style({ opacity: '0' }),
          animate('.3s ease-out', style({ opacity: '1' }))
      ]),
      transition(':leave', [
          style({ opacity: '1' }),
          animate('.25s ease-out', style({ opacity: '0' }))
      ]),
    ])
  ]
})
export class DialogComponent {
  @Input() title: DialogElement = {};
  @Input() body: string = '';
  @Input() confirmButton: DialogElement = {
    text: 'OK',
    icon: 'fa-solid fa-check'
  };
  @Input() cancelButton: DialogElement = {
    text: 'Close',
    icon: 'fa-solid fa-xmark'
  };
  isOpen: boolean = true;

  dialogRef;

  constructor(private dialogService: DialogService) {
    this.dialogRef = dialogService;
  }

}
