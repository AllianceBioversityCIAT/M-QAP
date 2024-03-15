import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TrainingCycleService} from 'src/app/services/training-cycle.service';
import {vb} from 'src/app/services/validator.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {z} from 'zod';
import {LoaderService} from 'src/app/services/loader.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-training-cycle-add-dialog',
  templateUrl: './training-cycle-add-dialog.component.html',
  styleUrls: ['./training-cycle-add-dialog.component.scss'],
})
export class TrainingCycleAddDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TrainingCycleAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private trainingCycleService: TrainingCycleService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
    private loaderService: LoaderService,
  ) {
  }

  ngOnInit() {
    this.formInit();
    this.patchForm();
  }

  formInit() {
    this.form = this.fb.group({
      text: [null, vb(z.string().min(2).max(255))],
    });
  }

  get id() {
    return this.data?.id;
  }

  patchForm() {
    if (this.id) {
      this.trainingCycleService.get(this.id).subscribe((data) => {
        this.form.patchValue(data);
        this.loaderService.close();
      });
    } else {
      this.loaderService.close();
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.loaderService.open();
      await this.trainingCycleService
        .upsert(this.id, this.form.value)
        .subscribe({
          next: () => {
            this.loaderService.close();
            if (this.id) {
              this.snackBarService.success(
                'Training cycle updated  successfully.'
              );
            } else {
              this.snackBarService.success('Training cycle added successfully.');
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
