import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {vb} from 'src/app/services/validator.service';
import {z} from 'zod';
import {LoaderService} from 'src/app/services/loader.service';

export interface DialogData {
  id?: number;
  data?: any;
}

@Component({
  selector: 'app-wos-quota-form',
  templateUrl: './wos-quota-form.component.html',
  styleUrls: ['./wos-quota-form.component.scss']
})
export class WosQuotaFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<WosQuotaFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private apiKeysService: ApiKeysService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
    private loaderService: LoaderService,
  ) {
  }

  async ngOnInit() {
    this.formInit();
    this.patchForm();
  }

  get id() {
    return this.data?.id;
  }

  patchForm() {
    if (this.id) {
      this.apiKeysService.getWosQuota(this.id).subscribe((data) => {
        this.form.patchValue(data);
        this.loaderService.close();
      });
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      name: ['', vb(z.string().min(2).max(255))],
      organization: [null],
      responsible: [null],
      alert_on: [0, vb(z.number().int().min(0).max(99.99))],
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.loaderService.open();
      await this.apiKeysService
        .upsertWosQuota(this.id, this.form.value)
        .subscribe({
          next: () => {
            this.loaderService.close();
            if (this.id) {
              this.snackBarService.success(
                'WoS quota updated successfully.'
              );
            } else {
              this.snackBarService.success('WoS quota added successfully.');
            }
            this.dialogRef.close({submitted: true});
          },
          error: (error) => {
            this.loaderService.close();
            this.snackBarService.error(error.error.message);
          },
        });
    }
  }

}
