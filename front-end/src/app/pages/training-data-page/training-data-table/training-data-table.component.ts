import {Component, EventEmitter} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {TrainingDataService} from 'src/app/services/training-data.service';
import {TrainingDataFormComponent} from '../training-data-form/training-data-form.component';
import {
  MediaService,
  UploadFileResponse,
} from 'src/app/services/media.service';
import {Paginated} from 'src/app/share/types/paginate.type';
import {TrainingData} from 'src/app/share/types/training-data.model.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DeleteDialogService} from 'src/app/share/delete-confirm-dialog/delete-dialog.service';
import {filter, switchMap} from 'rxjs';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-training-data-table',
  templateUrl: './training-data-table.component.html',
  styleUrls: ['./training-data-table.component.scss'],
})
export class TrainingDataTableComponent {
  columnsToDisplay: string[] = [
    'id',
    'text',
    'name',
    'acronym',
    'source',
    'actions',
  ];
  dataSource!: MatTableDataSource<TrainingData>;
  trainingData!: Paginated<TrainingData>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'text:ASC';
  text = '';
  form!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private deleteDialogService: DeleteDialogService,
    private trainingDataService: TrainingDataService,
    private snackBarService: SnackBarService,
    private mediaService: MediaService,
    private loaderService: LoaderService,
    private fb: FormBuilder
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

  loadData() {
    this.loaderService.open();
    const queryString = [];
    queryString.push(`limit=${this.pageSize}`);
    queryString.push(`page=${this.pageIndex + 1}`);
    queryString.push(`sortBy=${this.sortBy}`);
    queryString.push(`search=${this.text}`);
    this.trainingDataService
      .find(queryString.join('&'))
      .subscribe((response) => {
        this.trainingData = response;
        this.length = response.meta.totalItems;
        this.dataSource = new MatTableDataSource(response.data);
        this.loaderService.close();
      });
  }

  openDialog(id?: number): void {
    if (id) {
      this.loaderService.open();
    }
    const dialogRef = this.dialog.open(TrainingDataFormComponent, {
      data: {id},
      width: '100%',
      maxWidth: '650px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.submitted) this.loadData();
    });
  }

  fileUploaded(e: UploadFileResponse) {
    this.loaderService.open();
    this.trainingDataService.processSheet(e.fileName).subscribe(() => {
      this.loaderService.close();
      this.loadData();
    });
  }

  downloadFile() {
    this.mediaService.downloadFile(
      'M-QAP_Matched_institutions.xlsx',
      'M-QAP_Matched_institutions'
    );
  }

  delete(id: number) {
    this.deleteDialogService
      .create()
      .pipe(
        filter((answer) => answer),
        switchMap(() => {
          this.loaderService.open();
          return this.trainingDataService.delete(id)
        })
      )
      .subscribe(() => {
        this.loadData();
        this.snackBarService.success('Deleted successfully.');
      });
  }
}
