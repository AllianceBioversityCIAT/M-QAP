import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubstitutionDataService} from '../../../services/substitution-data.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {vb} from 'src/app/services/validator.service';
import {z} from 'zod';

export interface DialogData {
  id?: number;
  data?: any;
}

@Component({
  selector: 'app-substitutions-form',
  templateUrl: './substitutions-form.component.html',
  styleUrls: ['./substitutions-form.component.scss']
})
export class SubstitutionsFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SubstitutionsFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private substitutionDataService: SubstitutionDataService,
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
      this.substitutionDataService.get(this.id).subscribe((data) => {
        this.form.patchValue(data);
        this.loaderService.close();
      });
    } else if (!!this.data?.data) {
      this.form.patchValue(this.data.data);
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      find_text: ['', vb(z.string().min(1).max(255))],
      replace_text: ['', vb(z.string().min(1).max(255))],
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.loaderService.open();
      this.substitutionDataService
        .upsert(this.id, this.form.value)
        .subscribe({
          next: () => {
            this.loaderService.close();
            if (this.id) {
              this.snackBarService.success(
                'Substitution data updated successfully.'
              );
            } else {
              this.snackBarService.success('Substitution data added successfully.');
            }
            this.dialogRef.close({submitted: true});
          },
          error: (error) => {
            this.loaderService.close();
            if (this.id) {
              this.snackBarService.error('Substitution data failed to update.');
            } else if (this.data?.data) {
              this.snackBarService.error(
                'Substitution data failed to add (Duplicated Data).'
              );
            } else {
              this.snackBarService.error(error.error.message);
            }
          },
        });
    }
  }
}
