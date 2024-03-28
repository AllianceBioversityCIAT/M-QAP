import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {SnackBarService} from './snack-bar.service';
import {SnackBarComponent} from './snack-bar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    SnackBarComponent
  ],
  imports: [CommonModule, MatSnackBarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  providers: [SnackBarService],
})
export class SnackBarModule {
}
