import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {ApiKeysService} from "src/app/services/api-keys.service";
import {vb} from 'src/app/services/validator.service';
import {z} from 'zod';
import {LoaderService} from 'src/app/services/loader.service';

export interface DialogData {
  id?: number;
  wosQuotaId: number;
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

  get type() {
    return this.data?.type;
  }

  get wosQuotaId() {
    return this.data.wosQuotaId;
  }

  patchForm() {
    if (this.id) {
      this.apiKeysService.get(this.id).subscribe((data) => {
        this.form.patchValue(data);
        this.loaderService.close();
      });
    }
  }

  private async formInit() {
    if (this.type === 'application') {
      this.form = this.fb.group({
        name: ['', vb(z.string().min(2).max(255))],
      });
    } else if (this.type === 'organization') {
      this.form = this.fb.group({
        organization: [null, vb(z.object({}))],
      });
    } else if (this.type === 'user') {
      this.form = this.fb.group({});
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.loaderService.open();
      await this.apiKeysService
        .upsert(this.id, this.wosQuotaId, this.form.value)
        .subscribe({
          next: () => {
            this.loaderService.close();
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
            this.loaderService.close();
            this.snackBarService.error(error.error.message);
          },
        });
    }
  }
}
