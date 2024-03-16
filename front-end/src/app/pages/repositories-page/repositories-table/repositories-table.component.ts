import {Component} from '@angular/core';
import {filter, switchMap} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Paginated} from 'src/app/share/types/paginate.type';
import {MatDialog} from '@angular/material/dialog';
import {RepositoriesService} from 'src/app/services/repositories.service';
import {RepositoriesFormComponent} from '../repositories-form/repositories-form.component';
import {Repository} from 'src/app/share/types/repository.model.type';
import {LoaderService} from 'src/app/services/loader.service';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {SchemaFormComponent} from '../schema-form/schema-form.component';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-repositories-table',
  templateUrl: './repositories-table.component.html',
  styleUrls: ['./repositories-table.component.scss'],
})
export class RepositoriesTableComponent {
  columnsToDisplay: string[] = ['id', 'name', 'type', 'prefix', 'base_url', 'creation_date', 'update_date', 'actions'];
  dataSource!: MatTableDataSource<Repository>;
  response!: Paginated<Repository>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  form!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private repositoriesService: RepositoriesService,
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
      sortBy: ['id:ASC'],
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

  async loadData() {
    this.loaderService.open();
    const queryString = [];
    queryString.push(`limit=${this.pageSize}`);
    queryString.push(`page=${this.pageIndex + 1}`);
    queryString.push(`sortBy=${this.sortBy}`);
    queryString.push(`search=${this.text}`);

    this.repositoriesService
      .find(queryString.join('&'))
      .subscribe({
        next: (response) => {
          this.response = response;
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
    const dialogRef = this.dialog.open(RepositoriesFormComponent, {
      data: {id},
      width: '100%',
      maxWidth: '650px',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.submitted) this.loadData();
    });
  }

  openDialogSchema(repository_id?: number): void {
    this.loaderService.open();
    this.dialog.open(SchemaFormComponent, {
      data: {repository_id},
      width: '90%',
      maxHeight: '90vh',
    });
  }

  delete(id: number) {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: 'Are you sure you want to delete this record?',
          title: 'Delete',
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => {
          this.loaderService.open();
          return this.repositoriesService.delete(id);
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
