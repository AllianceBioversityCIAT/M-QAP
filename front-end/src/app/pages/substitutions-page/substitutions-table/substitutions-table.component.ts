import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {SubstitutionData} from 'src/app/share/types/substitution-data.model.type';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DeleteDialogService} from 'src/app/share/delete-confirm-dialog/delete-dialog.service';
import {SubstitutionDataService} from 'src/app/services/substitution-data.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {PageEvent} from '@angular/material/paginator';
import {SubstitutionsFormComponent} from '../substitutions-form/substitutions-form.component';
import {filter, switchMap} from 'rxjs';

@Component({
  selector: 'app-substitutions-table',
  templateUrl: './substitutions-table.component.html',
  styleUrls: ['./substitutions-table.component.scss']
})
export class SubstitutionsTableComponent {
  columnsToDisplay: string[] = [
    'id',
    'find_text',
    'replace_text',
    'actions',
  ];
  dataSource!: MatTableDataSource<SubstitutionData>;
  substitutionData!: Paginated<SubstitutionData>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  form!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private deleteDialogService: DeleteDialogService,
    private substitutionDataService: SubstitutionDataService,
    private snackBarService: SnackBarService,
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
      sortBy: ['id:DEC'],
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
    this.substitutionDataService
      .find(queryString.join('&'))
      .subscribe({
        next: (response) => {
          this.substitutionData = response;
          this.length = response.meta.totalItems;
          this.dataSource = new MatTableDataSource(response.data);
          this.loaderService.close();
        },
        error: (error) => {
          this.loaderService.close();
          this.snackBarService.error(error.error.message);
        },
      });
  }

  openDialog(id?: number): void {
    if (id) {
      this.loaderService.open();
    }
    const dialogRef = this.dialog.open(SubstitutionsFormComponent, {
      data: {id},
      width: '100%',
      maxWidth: '650px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.submitted) this.loadData();
    });
  }

  delete(id: number) {
    this.deleteDialogService
      .create()
      .pipe(
        filter((answer) => answer),
        switchMap(() => {
          this.loaderService.open();
          return this.substitutionDataService.delete(id)
        })
      )
      .subscribe({
        next: () => {
          this.loaderService.close();
          this.loadData();
          this.snackBarService.success('Deleted successfully.');
        },
        error: (error) => {
          this.loaderService.close();
          this.snackBarService.error(error.error.message);
        },
      });
  }
}
