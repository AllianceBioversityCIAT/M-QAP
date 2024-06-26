import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TrainingDataService} from 'src/app/services/training-data.service';
import {vb} from 'src/app/services/validator.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {z} from 'zod';
import {LoaderService} from 'src/app/services/loader.service';

export interface DialogData {
  id?: number;
  data?: any;
}

@Component({
  selector: 'app-training-data-form',
  templateUrl: './training-data-form.component.html',
  styleUrls: ['./training-data-form.component.scss'],
})
export class TrainingDataFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TrainingDataFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private trainingDataService: TrainingDataService,
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
      this.trainingDataService.get(this.id).subscribe((data) => {
        this.form.patchValue(data);
        this.loaderService.close();
      });
    } else if (!!this.data?.data) {
      this.form.patchValue(this.data.data);
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      text: ['', vb(z.string().min(2).max(255))],
      source: ['system/form', vb(z.string().min(4).max(255))],
      clarisa: [null, vb(z.object({}))],
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.loaderService.open();
      this.trainingDataService
        .upsert(this.id, this.form.value)
        .subscribe({
          next: () => {
            this.loaderService.close();
            if (this.id) {
              this.snackBarService.success(
                'Training data updated successfully.'
              );
            } else {
              this.snackBarService.success('Training data added successfully.');
            }
            this.dialogRef.close({submitted: true});
          },
          error: (error) => {
            this.loaderService.close();
            if (this.id) {
              this.snackBarService.error('Training data failed to update.');
            } else if (this.data?.data) {
              this.snackBarService.error(
                'Training data failed to add (Duplicated Data).'
              );
            } else {
              this.snackBarService.error(error.error.message);
            }
          },
        });
    }
  }
}
