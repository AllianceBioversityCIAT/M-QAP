import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {vb} from 'src/app/services/validator.service';
import {z} from 'zod';

export interface DialogData {
  id?: number;
  wosQuotaId: number;
  data?: any;
}

@Component({
  selector: 'app-wos-quota-year-form',
  templateUrl: './wos-quota-year-form.component.html',
  styleUrls: ['./wos-quota-year-form.component.scss']
})
export class WosQuotaYearFormComponent {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<WosQuotaYearFormComponent>,
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

  get wosQuotaId() {
    return this.data.wosQuotaId;
  }

  patchForm() {
    if (this.id) {
      this.apiKeysService.getWosQuotaYear(this.id).subscribe((data) => {
        this.form.patchValue(data);
      });
    } else if (!!this.data?.data) {
      this.form.patchValue(this.data.data);
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      year: ['', vb(z.number().positive())],
      quota: ['', vb(z.number().positive())],
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      await this.apiKeysService
        .upsertWosQuotaYear(this.id, this.wosQuotaId, this.form.value)
        .subscribe({
          next: () => {
            if (this.id) {
              this.snackBarService.success(
                'Quota updated successfully.'
              );
            } else {
              this.snackBarService.success('Quota added successfully.');
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
