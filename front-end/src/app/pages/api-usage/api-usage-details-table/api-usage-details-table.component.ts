import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {MatTableDataSource} from '@angular/material/table';
import {ApiStatisticsSummary, ApiUsage, WosApiUsage} from 'src/app/share/types/api-statistics.model.type';
import {Paginated} from 'src/app/share/types/paginate.type';
import {LoaderService} from 'src/app/services/loader.service';
import {PageEvent} from '@angular/material/paginator';
import {BehaviorSubject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';

@Component({
  selector: 'app-api-usage-details-table',
  templateUrl: './api-usage-details-table.component.html',
  styleUrls: ['./api-usage-details-table.component.scss']
})
export class ApiUsageDetailsTableComponent implements OnInit, OnDestroy {
  columnsToDisplay: string[] = ['api_key', 'name', 'type', 'creation_date', 'path'];
  columnsToDisplayWos: string[] = ['api_key', 'name', 'type', 'creation_date', 'doi'];
  dataSource!: MatTableDataSource<ApiUsage | WosApiUsage>;
  response!: Paginated<ApiUsage | WosApiUsage>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'creation_date:DESC';
  text = '';
  form!: FormGroup;

  @Input() selectedQuota: ApiStatisticsSummary | null = null;
  @Input() selectedApiKeySummaryType = '';
  quotaId: number | null = null;
  @Input() yearSubject = new BehaviorSubject<number>((new Date()).getFullYear());
  yearSubjectSubscription: Subscription | null = null;

  constructor(
    private apiKeyService: ApiKeysService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.quotaId = this.selectedQuota?.id ? this.selectedQuota.id : null;
    if (this.quotaId) {
      this.yearSubjectSubscription = this.yearSubject.subscribe((value) => {
        this.loadData(value);
      });
    }
  }

  ngOnDestroy() {
    if (this.yearSubjectSubscription) {
      this.yearSubjectSubscription.unsubscribe();
    }
  }

  initForm() {
    this.form = this.fb.group({
      text: [''],
      sortBy: ['creation_date:DESC'],
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

  async loadData(year: number = (new Date()).getFullYear()) {
    if (this.quotaId) {
      this.loaderService.open();
      const queryString = [];
      queryString.push(`limit=${this.pageSize}`);
      queryString.push(`page=${this.pageIndex + 1}`);
      queryString.push(`sortBy=${this.sortBy}`);
      queryString.push(`search=${this.text}`);

      this.apiKeyService
        .findDetails(queryString.join('&'), this.quotaId, this.selectedApiKeySummaryType, year)
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
  }

}
