import {Component} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Paginated} from 'src/app/share/types/paginate.type';
import {MatDialog} from '@angular/material/dialog';
import {PredictionsService} from 'src/app/services/predictions.service';
import {Prediction} from 'src/app/share/types/prediction.model.type';
import {TrainingDataFormComponent} from '../../training-data-page/training-data-form/training-data-form.component';
import {LoaderService} from 'src/app/services/loader.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {OrganizationsService} from 'src/app/services/organizations.service';

@Component({
  selector: 'app-predictions-table',
  templateUrl: './predictions-table.component.html',
  styleUrls: ['./predictions-table.component.scss'],
})
export class PredictionsTableComponent {
  form!: FormGroup;
  columnsToDisplay: string[] = [
    'id',
    'text',
    'name',
    'acronym',
    'confidant',
    'cycle',
    'actions',
  ];
  dataSource!: MatTableDataSource<Prediction>;
  response!: Paginated<Prediction>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'text:ASC';
  text = '';

  constructor(
    public dialog: MatDialog,
    private predictionsService: PredictionsService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private organizationsService: OrganizationsService,
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.form = this.fb.group({
      text: [''],
      sortBy: ['text:ASC'],
    });

    this.form.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500)
    ).subscribe({
      next: (value: any) => {
        this.text = value.text;
        this.sortBy = value.sortBy;
        this.loadData();
      }
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.loadData();
  }

  openDialog(prediction: Prediction): void {
    this.loaderService.open();
    this.organizationsService.get(prediction.clarisa_id).subscribe((org) => {
      this.loaderService.close();
      const dialogRef = this.dialog.open(TrainingDataFormComponent, {
        data: {
          data: {
            text: prediction.text,
            source: 'system/prediction',
            clarisa: org,
          },
        },
        width: '100%',
        maxWidth: '650px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && result.submitted) this.loadData();
      });
    });
  }

  async loadData() {
    this.loaderService.open();
    const queryString = [];
    queryString.push(`limit=${this.pageSize}`);
    queryString.push(`page=${this.pageIndex + 1}`);
    queryString.push(`sortBy=${this.sortBy}`);
    queryString.push(`search=${this.text}`);

    this.predictionsService
      .find(queryString.join('&'))
      .subscribe((response) => {
        this.response = response;
        this.length = response.meta.totalItems;
        this.dataSource = new MatTableDataSource(response.data);
        this.loaderService.close();
      });
  }
}
