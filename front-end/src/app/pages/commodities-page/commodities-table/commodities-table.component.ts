import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {
  MediaService,
  UploadFileResponse,
} from 'src/app/services/media.service';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommoditiesService} from 'src/app/services/commodities.service';
import {CommoditiesFormComponent} from '../commodities-form/commodities-form.component';
import {Commodity} from 'src/app/share/types/commodity.model.type';
import {Organization} from 'src/app/share/types/organization.model.type';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/pages/auth/auth.service';

@Component({
  selector: 'app-commodities-table',
  templateUrl: './commodities-table.component.html',
  styleUrls: ['./commodities-table.component.scss'],
})
export class CommoditiesTableComponent {
  columnsToDisplay: string[] = ['id', 'name', 'parent_id', 'source', 'actions'];
  dataSource!: MatTableDataSource<Commodity>;
  response!: Paginated<Commodity>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  organizations: Organization[] = [];
  form!: FormGroup;
  isAdmin = false;

  constructor(
    public dialog: MatDialog,
    private commoditiesService: CommoditiesService,
    private snackBarService: SnackBarService,
    private mediaService: MediaService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
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

    this.commoditiesService
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
    const dialogRef = this.dialog.open(CommoditiesFormComponent, {
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
    this.commoditiesService.processSheet(e.fileName).subscribe(() => {
      this.loaderService.close();
      this.loadData();
    });
  }

  downloadFile() {
    this.mediaService.downloadFile('M-QAP_Commodities.xlsx', 'M-QAP_Commodities');
  }

  delete(id: number) {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: 'Are you sure you want to delete this record ?',
          title: 'Delete',
        },
      })
      .afterClosed()
      .subscribe(async (dialogResult) => {
        if (dialogResult == true) {
          this.loaderService.open();
          await this.commoditiesService.delete(id).subscribe({
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
      });
  }
}
