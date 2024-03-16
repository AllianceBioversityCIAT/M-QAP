import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {SnackBarComponent} from './snack-bar.component';

@Injectable()
export class SnackBarService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private _snackBar: MatSnackBar) {}

  success(message: string = 'Successfully') {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: {
        html: message
      },
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snack-bar-success-panel',
    });
  }

  error(message: string = 'Failed') {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: {
        html: message
      },
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snack-bar-error-panel',
    });
  }
}
