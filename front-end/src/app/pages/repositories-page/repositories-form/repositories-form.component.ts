import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RepositoriesService} from 'src/app/services/repositories.service';
import {vb} from 'src/app/services/validator.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {z} from 'zod';
import {LoaderService} from 'src/app/services/loader.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-repositories-form',
  templateUrl: './repositories-form.component.html',
  styleUrls: ['./repositories-form.component.scss'],
})
export class RepositoriesFormComponent implements OnInit {
  form!: FormGroup;
  repositoryTypes = [{
    id: 'DSpace7',
  }, {
    id: 'DSpace6',
  }, {
    id: 'DSpace5',
  }, {
    id: 'Dataverse',
  }, {
    id: 'CKAN',
  }];
  identifiersTypes = [{
    id: 'DOI',
  }, {
    id: 'Handle',
  }]

  constructor(
    public dialogRef: MatDialogRef<RepositoriesFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private repositoriesService: RepositoriesService,
    private snackBrService: SnackBarService,
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

  async patchForm() {
    if (this.id) {
      this.repositoriesService.get(this.id).subscribe((repository) => {
        this.form.patchValue(repository);
        this.loaderService.close();
      });
    }
  }

  private async formInit() {
    this.form = this.fb.group({
      name: ['', vb(z.string().min(2).max(255))],
      type: [null, [vb(z.string().min(1))]],
      base_url: ['', [vb(z.string().min(1))]],
      api_path: ['', [vb(z.string().min(1))]],
      identifier_type: ['', [vb(z.string().min(1))]],
      prefix: ['', [vb(z.string().min(1))]],
    });
  }

  submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.loaderService.open();
      this.repositoriesService.upsert(this.id, this.form.value).subscribe({
        next: () => {
          this.loaderService.close();
          if (this.id)
            this.snackBrService.success('Repository added successfully');
          else this.snackBrService.success('Repository updated successfully');
          this.dialogRef.close({submitted: true});
        },
        error: (error: any) => {
          this.loaderService.close();
          this.snackBrService.error(error.error.message);
        },
      });
    }
  }
}
