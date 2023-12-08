import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { vb } from 'src/app/services/validator.service';
import { SnackBarService } from 'src/app/share/snack-bar/snack-bar.service';
import { z } from 'zod';

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
    private fb: FormBuilder
  ) {}

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
      });
    } else if (!!this.data?.data) {
      this.form.patchValue(this.data.data);
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      text: ['', vb(z.string().min(2).max(100))],
      source: ['system/form', vb(z.string().min(4).max(20))],
      clarisa: [null, vb(z.object({ id: z.number() }))],
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    console.log(this.form.get('text')?.errors);
    if (this.form.valid) {
      await this.trainingDataService
        .upsert(this.id, this.form.value)
        .subscribe({
          next: () => {
            if (this.id) {
              this.snackBarService.success(
                'Training data updated successfully'
              );
            } else {
              this.snackBarService.success('Training data added successfully');
            }
            this.dialogRef.close({ submitted: true });
          },
          error: (error) => {
            console.log(error);
            if (this.id) {
              this.snackBarService.error('Training data failed to update');
            } else if (this.data?.data) {
              this.snackBarService.error(
                'Training data failed to add (Duplicated Data)'
              );
            } else {
              this.snackBarService.error(error.error.message);
            }
          },
        });
    }
  }
}
