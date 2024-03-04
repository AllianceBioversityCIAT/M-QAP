import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { fadeInOut } from 'src/app/animations/fade-in-out';

@Component({
  selector: 'app-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss'],
  animations: [fadeInOut(300, 300)],
})
export class ErrorsComponent {
  @Input() control!: AbstractControl | null;
  @Input() animation: boolean = false;

  get errors() {
    const errorsList: any = [];

    Object.keys(this.control?.errors ?? {}).forEach((key) => {
      if (this.control?.errors) errorsList.push(this.control?.errors[key]);
    });
    return errorsList;
  }

  get touched() {
    return this.control?.touched ?? false;
  }
}
