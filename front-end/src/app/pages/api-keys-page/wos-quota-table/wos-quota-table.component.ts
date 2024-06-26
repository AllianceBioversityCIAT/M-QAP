import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {filter, switchMap} from 'rxjs';
import {WosQuota} from 'src/app/share/types/wos-quota.model.type';
import {MatDialog} from '@angular/material/dialog';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {LoaderService} from 'src/app/services/loader.service';
import {PageEvent} from '@angular/material/paginator';
import {WosQuotaFormComponent} from '../wos-quota-form/wos-quota-form.component';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/pages/auth/auth.service';

@Component({
  selector: 'app-wos-quota-table',
  templateUrl: './wos-quota-table.component.html',
  styleUrls: ['./wos-quota-table.component.scss']
})
export class WosQuotaTableComponent {
  columnsToDisplay: string[] = ['id', 'name', 'organization_id', 'responsible_id', 'is_active', 'alert_on', 'creation_date', 'update_date', 'actions'];
  dataSource!: MatTableDataSource<WosQuota>;
  response!: Paginated<WosQuota>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  form!: FormGroup;
  selectedWosQuota: WosQuota | null = null;
  viewTable: 'apiKeys' | 'quotas' | null = null;
  year = (new Date()).getFullYear();
  isAdmin = false;

  constructor(
    public dialog: MatDialog,
    private apiKeyService: ApiKeysService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
    public router: Router,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.isAdmin = this.authService.isAdmin();
    });
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

    this.apiKeyService
      .findWosQuota(queryString.join('&'))
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
    const dialogRef = this.dialog.open(WosQuotaFormComponent, {
      data: {id},
      width: '100%',
      maxWidth: '650px',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.submitted) this.loadData();
    });
  }

  updateStatus(id: number, is_active: boolean) {
    const operation = is_active ? 'Activate' : 'Deactivate';
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: `Are you sure you want to ${operation} this Quota?`,
          title: operation,
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => {
          this.loaderService.open();
          return this.apiKeyService.updateStatusWosQuota(id, is_active);
        })
      )
      .subscribe({
        next: () => {
          this.loaderService.close();
          this.loadData();
          this.snackBarService.success(`${operation}ed successfully.`);
        },
        error: (error) => {
          this.loaderService.close();
          this.snackBarService.error(error.error.message);
        },
      });
  }

  apiKeys(wosQuota: WosQuota): void {
    this.selectedWosQuota = wosQuota;
    this.viewTable = 'apiKeys';
  }

  quotas(wosQuota: WosQuota): void {
    this.selectedWosQuota = wosQuota;
    this.viewTable = 'quotas';
  }

  backToMainList() {
    this.selectedWosQuota = null;
    this.viewTable = null;
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
          return this.apiKeyService.deleteWosQuota(id);
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
