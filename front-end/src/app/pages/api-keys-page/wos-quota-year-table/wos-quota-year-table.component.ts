import {Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {filter, switchMap} from 'rxjs';
import {WosQuota} from 'src/app/share/types/wos-quota.model.type';
import {WosQuotaYear} from 'src/app/share/types/wos-quota-year.model.type';
import {MatDialog} from '@angular/material/dialog';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {PageEvent} from '@angular/material/paginator';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {WosQuotaYearFormComponent} from '../wos-quota-year-form/wos-quota-year-form.component';
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

@Component({
  selector: 'app-wos-quota-year-table',
  templateUrl: './wos-quota-year-table.component.html',
  styleUrls: ['./wos-quota-year-table.component.scss']
})
export class WosQuotaYearTableComponent {
  columnsToDisplay: string[] = ['id', 'year', 'quota', 'creation_date', 'update_date', 'actions'];
  dataSource!: MatTableDataSource<WosQuotaYear>;
  response!: Paginated<WosQuotaYear>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  form!: FormGroup;
  @Input() selectedWosQuota: WosQuota | null = null;
  wosQuotaId: number | null = null;

  constructor(
    public dialog: MatDialog,
    private apiKeyService: ApiKeysService,
    private snackBarService: SnackBarService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.wosQuotaId = this.selectedWosQuota?.id ? this.selectedWosQuota.id : null;
    if (this.wosQuotaId) {
      this.loadData();
    }
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
    if (this.wosQuotaId) {
      this.loaderService.open();
      const queryString = [];
      queryString.push(`limit=${this.pageSize}`);
      queryString.push(`page=${this.pageIndex + 1}`);
      queryString.push(`sortBy=${this.sortBy}`);
      queryString.push(`search=${this.text}`);
      queryString.push(`wosQuotaId=${this.wosQuotaId}`);

      this.apiKeyService
        .findWosQuotaYear(queryString.join('&'))
        .subscribe((response) => {
          this.response = response;
          this.length = response.meta.totalItems;
          this.dataSource = new MatTableDataSource(response.data);
          this.loaderService.close();
        });
    }
  }

  openDialog(id?: number): void {
    if (id) {
      this.loaderService.open();
    }
    const dialogRef = this.dialog.open(WosQuotaYearFormComponent, {
      data: {id, wosQuotaId: this.wosQuotaId},
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
          message: 'Are you sure you want to delete this quota?',
          title: 'Delete',
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => {
          this.loaderService.open();
          return this.apiKeyService.deleteWosQuotaYear(id);
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
