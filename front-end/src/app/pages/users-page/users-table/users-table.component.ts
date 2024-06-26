import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {User} from 'src/app/share/types/user.model.type';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {UsersService} from 'src/app/services/users.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {PageEvent} from '@angular/material/paginator';
import {UsersFormComponent} from '../users-form/users-form.component';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {filter, switchMap} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent {
  columnsToDisplay: string[] = ['id', 'full_name', 'email', 'role', 'actions'];
  dataSource!: MatTableDataSource<User>;
  response!: Paginated<User>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  form!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private usersService: UsersService,
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

    this.usersService
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
    const dialogRef = this.dialog.open(UsersFormComponent, {
      data: {id},
      width: '100%',
      maxWidth: '650px',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.submitted) this.loadData();
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
          return this.usersService.delete(id);
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
