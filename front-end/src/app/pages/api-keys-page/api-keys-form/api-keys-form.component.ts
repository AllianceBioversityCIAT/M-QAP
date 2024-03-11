import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {ApiKeysService} from "src/app/services/api-keys.service";
import {vb} from 'src/app/services/validator.service';
import {z} from 'zod';

export interface DialogData {
  id?: number;
  type?: string;
  data?: any;
}

@Component({
  selector: 'app-api-keys-form',
  templateUrl: './api-keys-form.component.html',
  styleUrls: ['./api-keys-form.component.scss']
})
export class ApiKeysFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ApiKeysFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private apiKeysService: ApiKeysService,
    private snackBarService: SnackBarService,
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

  get type() {
    return this.data?.type;
  }

  patchForm() {
    if (this.id) {
      this.apiKeysService.get(this.id).subscribe((data) => {
        this.form.patchValue(data);
      });
    } else if (!!this.data?.data) {
      this.form.patchValue(this.data.data);
    }
  }

  private async formInit() {
    if (this.type === 'application') {
      this.form = this.fb.group({
        name: ['', vb(z.string().min(2).max(255))],
        wos_quota: [0, vb(z.number().min(0))],
      });
    } else if (this.type === 'organization') {
      this.form = this.fb.group({
        organization: [null, vb(z.object({}))],
        wos_quota: [0, vb(z.number().min(0))],
      });
    } else if (this.type === 'user') {
      this.form = this.fb.group({
        wos_quota: [0, vb(z.number().min(0))],
      });
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      await this.apiKeysService
        .upsert(this.id, this.form.value)
        .subscribe({
          next: () => {
            if (this.id) {
              this.snackBarService.success(
                'API-key updated successfully.'
              );
            } else {
              this.snackBarService.success('API-key added successfully.');
            }
            this.dialogRef.close({submitted: true});
          },
          error: (error) => {
            this.snackBarService.error(error.error.message);
          },
        });
    }
  }

}
