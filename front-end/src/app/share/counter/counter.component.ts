import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTooltipModule, MatIconModule],
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent {
  @Input() title: string = '';
  @Input() toolTip: string = '';
  @Input() icon: string = '';
  @Input() count: number = 0;
  @Input() percentage: number = 0;
}
