import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommoditiesService } from 'src/app/services/commodities.service';
import { vb } from 'src/app/services/validator.service';
import { SnackBarService } from 'src/app/share/snack-bar/snack-bar.service';
import { z } from 'zod';
export interface DialogData {
  id: number;
}
@Component({
  selector: 'app-commodities-form',
  templateUrl: './commodities-form.component.html',
  styleUrls: ['./commodities-form.component.scss'],
})
export class CommoditiesFormComponent implements OnInit {
  form!: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<CommoditiesFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private commoditiesService: CommoditiesService,
    private snackBrService: SnackBarService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.formInit();
    this.patchForm();
  }

  get id() {
    return this.data?.id;
  }

  async patchForm() {
    if (this.id) {
      this.commoditiesService.get(this.id).subscribe((commodity) => {
        this.form.patchValue(commodity);
      });
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      name: ['', vb(z.string().min(2).max(255))],
      parent: [null],
      source: ['system/form', vb(z.string().min(2).max(255))],
    });
  }

  submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.commoditiesService.upsert(this.id, this.form.value).subscribe({
        next: () => {
          if (this.id)
            this.snackBrService.success('Commodity added successfully');
          else this.snackBrService.success('Commodity updated successfully');
          this.dialogRef.close({ submitted: true });
        },
        error: (error: any) => this.snackBrService.error(error.error.message),
      });
    }
  }
}
