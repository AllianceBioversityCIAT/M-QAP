import {Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {ApiKeys} from 'src/app/share/types/api-keys.model.type';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {PageEvent} from '@angular/material/paginator';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {filter, switchMap} from 'rxjs';
import {ApiKeysFormComponent} from '../api-keys-form/api-keys-form.component';
import {WosQuota} from 'src/app/share/types/wos-quota.model.type';

@Component({
  selector: 'app-api-keys-table',
  templateUrl: './api-keys-table.component.html',
  styleUrls: ['./api-keys-table.component.scss']
})
export class ApiKeysTableComponent {
  columnsToDisplay: string[] = ['id', 'is_active', 'api_key', 'name', 'organization_id', 'creation_date', 'update_date', 'actions'];
  dataSource!: MatTableDataSource<ApiKeys>;
  response!: Paginated<ApiKeys>;
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
    this.form.valueChanges.subscribe((value) => {
      this.text = value.text;
      this.sortBy = value.sortBy;
      this.loadData();
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.loadData();
  }

  async loadData() {
    if (this.wosQuotaId) {
      const queryString = [];
      queryString.push(`limit=${this.pageSize}`);
      queryString.push(`page=${this.pageIndex + 1}`);
      queryString.push(`sortBy=${this.sortBy}`);
      queryString.push(`search=${this.text}`);

      this.apiKeyService
        .find(queryString.join('&'), this.wosQuotaId)
        .subscribe((response) => {
          this.response = response;
          this.length = response.meta.totalItems;
          this.dataSource = new MatTableDataSource(response.data);
        });
    }
  }

  openDialog(id?: number | null, type = 'application'): void {
    const dialogRef = this.dialog.open(ApiKeysFormComponent, {
      data: {id, type, wosQuotaId: this.wosQuotaId},
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
          message: 'Are you sure you want to delete this API-key?',
          title: 'Delete',
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => this.apiKeyService.delete(id))
      )
      .subscribe({
        next: () => {
          this.loadData();
          this.snackBarService.success('Deleted successfully.');
        },
        error: (error) => {
          this.snackBarService.error(error.error.message);
        },
      });
  }

  updateStatus(id: number, is_active: boolean) {
    const operation = is_active ? 'Activate' : 'Deactivate';
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: `Are you sure you want to ${operation} this API-key?`,
          title: operation,
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => this.apiKeyService.updateStatus(id, is_active))
      )
      .subscribe({
        next: () => {
          this.loadData();
          this.snackBarService.success(`${operation}ed successfully.`);
        },
        error: (error) => {
          this.snackBarService.error(error.error.message);
        },
      });
  }

  regenerate(id: number) {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: `Are you sure you want to regenerate this API-key?`,
          title: 'Regenerate',
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => this.apiKeyService.regenerate(id))
      )
      .subscribe({
        next: () => {
          this.loadData();
          this.snackBarService.success(`Regenerated successfully.`);
        },
        error: (error) => {
          this.snackBarService.error(error.error.message);
        },
      });
  }

}
