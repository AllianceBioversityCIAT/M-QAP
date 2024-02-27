import {Component, Inject, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RepositoriesService} from 'src/app/services/repositories.service';
import {vb} from 'src/app/services/validator.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {z} from 'zod';
import {RepositorySchema} from 'src/app/share/types/repository-schema.model.type';

export interface DialogData {
  repository_id: number;
}

@Component({
  selector: 'app-schema-form',
  templateUrl: './schema-form.component.html',
  styleUrls: ['./schema-form.component.scss'],
})
export class SchemaFormComponent implements OnInit {
  form!: FormGroup;
  schemaFormsArray!: FormArray;
  schemaForms!: FormGroup[];
  targets = [{
    id: 'Title',
  }, {
    id: 'Authors',
  }, {
    id: 'Handle',
  }, {
    id: 'Keywords',
  }, {
    id: 'Description',
  }, {
    id: 'Rights',
  }, {
    id: 'Open Access',
  }, {
    id: 'DOI',
  }, {
    id: 'Online publication date',
  }, {
    id: 'Issued date',
  }, {
    id: 'Countries',
  }, {
    id: 'Country ISO code',
  }, {
    id: 'Action Area',
  }, {
    id: 'Affiliation',
  }, {
    id: 'AGROVOC Keywords',
  }, {
    id: 'Commodities',
  }, {
    id: 'Funding source',
  }, {
    id: 'Impact Area',
  }, {
    id: 'ORCID',
  }, {
    id: 'Region of the research',
  }, {
    id: 'Type',
  }, {
    id: 'ISI',
  }, {
    id: 'Peer-reviewed',
  }, {
    id: 'Citation',
  }, {
    id: 'Language',
  }, {
    id: 'Publisher',
  }, {
    id: 'Journal',
  }, {
    id: 'Volume',
  }, {
    id: 'Issue',
  }, {
    id: 'Pages',
  }, {
    id: 'Reference to other knowledge products',
  }, {
    id: 'Reference to other DOI or Handle',
  }, {
    id: 'Other Url',
  }, {
    id: 'contributorName',
  }, {
    id: 'THUMBNAIL',
  }, {
    id: 'contributorType',
  }];

  constructor(
    public dialogRef: MatDialogRef<SchemaFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private repositoriesService: RepositoriesService,
    private snackBrService: SnackBarService,
    private fb: FormBuilder
  ) {
  }

  async ngOnInit() {
    if (this.repository_id) {
      this.formInit(null);
      this.repositoriesService.getSchema(this.repository_id).subscribe((schema: RepositorySchema[]) => {
        this.formInit(schema);
      });
    }
  }

  GetSchemaElement(source = '', target = ''): FormGroup {
    return this.fb.group({
      source: [source, vb(z.string().min(1))],
      target: [target, vb(z.string().min(1))],
    });
  }

  get repository_id() {
    return this.data.repository_id;
  }

  private async formInit(schema: RepositorySchema[] | null) {
    if (schema) {
      this.schemaForms = schema.map(item => this.GetSchemaElement(item.source, item.target));
      this.schemaFormsArray = new FormArray(this.schemaForms);
      this.form = this.fb.group({
        schema: [this.schemaFormsArray],
      });
    } else {
      this.form = this.fb.group({
        schema: [],
      });
    }
  }

  submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.valid && this.repository_id && this.form.value.schema.value.length) {
      this.repositoriesService.updateSchema(this.repository_id, this.form.value.schema.value).subscribe({
        next: () => {
          this.snackBrService.success('Repository schema configured successfully');
          this.dialogRef.close({submitted: true});
        },
        error: (error: any) => this.snackBrService.error(error.error.message),
      });
    }
  }

  AddNewSchema(deliverables: FormArray) {
    deliverables.push(this.GetSchemaElement('', ''));
  }

  DeleteSchema(schema: FormArray, index: number) {
    schema.removeAt(index);
  }
}
