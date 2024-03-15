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
import {LoaderService} from 'src/app/services/loader.service';

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
  targets = [
    {
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
  formatters = [
    {
      id: 'date',
    }, {
      id: 'datetime',
    }, {
      id: 'country',
    }, {
      id: 'language',
    }, {
      id: 'combine',
    }, {
      id: 'split',
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<SchemaFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private repositoriesService: RepositoriesService,
    private snackBrService: SnackBarService,
    private fb: FormBuilder,
    private loaderService: LoaderService,
  ) {
  }

  async ngOnInit() {
    if (this.repository_id) {
      this.repositoriesService.getSchema(this.repository_id).subscribe((schema: RepositorySchema[]) => {
        this.formInit(schema);
      });
    }
  }

  GetSchemaElement(source = '', target = '', formatter = '', formatterAddition = ''): FormGroup {
    return this.fb.group({
      source: [source, vb(z.string().min(1))],
      target: [target, vb(z.string().min(1))],
      formatter: [formatter],
      formatter_addition: [formatterAddition],
    });
  }

  get repository_id() {
    return this.data.repository_id;
  }

  private async formInit(schema: RepositorySchema[] | null) {
    if (schema) {
      this.schemaForms = schema.map(item => this.GetSchemaElement(item.source, item.target, item.formatter, item.formatter_addition));
      this.schemaFormsArray = new FormArray(this.schemaForms);
      this.form = this.fb.group({
        schema: [this.schemaFormsArray],
      });
    } else {
      this.form = this.fb.group({
        schema: [],
      });
    }
    this.loaderService.close();
  }

  submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    this.schemaFormsArray.markAllAsTouched();
    this.schemaFormsArray.updateValueAndValidity();
    if (this.form.valid && this.repository_id && this.form.value.schema.value.length && this.schemaFormsArray.valid) {
      this.loaderService.open();
      this.repositoriesService.updateSchema(this.repository_id, this.form.value.schema.value).subscribe({
        next: () => {
          this.loaderService.close();
          this.snackBrService.success('Repository schema configured successfully');
          this.dialogRef.close({submitted: true});
        },
        error: (error: any) => {
          this.loaderService.close();
          this.snackBrService.error(error.error.message);
        },
      });
    }
  }

  AddNewSchema(schema: FormArray) {
    schema.push(this.GetSchemaElement('', '', '', ''));
  }

  DeleteSchema(schema: FormArray, index: number) {
    schema.removeAt(index);
  }
}
