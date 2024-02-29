import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UsersService} from 'src/app/services/users.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss']
})
export class UsersFormComponent implements OnInit {
  form!: FormGroup;
  userRoles = [{
    id: 'admin',
    name: 'Admin'
  }, {
    id: 'user',
    name: 'User'
  }];

  constructor(
    public dialogRef: MatDialogRef<UsersFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private usersService: UsersService,
    private snackBrService: SnackBarService,
    private fb: FormBuilder
  ) {
  }

  async ngOnInit() {
    this.formInit();
    this.patchForm();
  }

  get id() {
    return this.data?.id;
  }

  async patchForm() {
    if (this.id) {
      this.usersService.get(this.id).subscribe((repository) => {
        this.form.patchValue(repository);
      });
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      role: [null, Validators.required],
    });
  }

  submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.usersService.upsert(this.id, this.form.value).subscribe({
        next: () => {
          if (this.id)
            this.snackBrService.success('User added successfully');
          else this.snackBrService.success('User updated successfully');
          this.dialogRef.close({submitted: true});
        },
        error: (error: any) => this.snackBrService.error(error.error.message),
      });
    }
  }
}
