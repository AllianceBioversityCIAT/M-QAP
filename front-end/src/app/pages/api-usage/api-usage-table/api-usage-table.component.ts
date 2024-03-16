import {Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {LoaderService} from 'src/app/services/loader.service';
import {PageEvent} from '@angular/material/paginator';
import {ApiStatisticsSummary} from 'src/app/share/types/api-statistics.model.type';
import {BehaviorSubject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';

@Component({
  selector: 'app-api-usage-table',
  templateUrl: './api-usage-table.component.html',
  styleUrls: ['./api-usage-table.component.scss']
})

export class ApiUsageTableComponent {
  columnsToDisplay: string[] = ['id', 'name', 'type', 'api_keys', 'api_requests', 'quota', 'used_wos_quota', 'is_active', 'actions'];
  dataSource!: MatTableDataSource<ApiStatisticsSummary>;
  response!: Paginated<ApiStatisticsSummary>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'name:ASC';
  text = '';
  form!: FormGroup;
  selectedQuota: ApiStatisticsSummary | null = null;
  selectedApiKeySummaryType = '';
  year = (new Date()).getFullYear();
  @Input() yearSubject = new BehaviorSubject<number>((new Date()).getFullYear());


  constructor(
    public dialog: MatDialog,
    private apiKeyService: ApiKeysService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.yearSubject.subscribe((value) => {
      this.loadData(value);
    });
  }

  initForm() {
    this.form = this.fb.group({
      text: [''],
      sortBy: ['name:ASC'],
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

  async loadData(year: number = this.year) {
    this.loaderService.open();
    this.year = year;
    const queryString = [];
    queryString.push(`limit=${this.pageSize}`);
    queryString.push(`page=${this.pageIndex + 1}`);
    queryString.push(`sortBy=${this.sortBy}`);
    queryString.push(`search=${this.text}`);

    this.apiKeyService
      .findQuotaSummary(queryString.join('&'), year)
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

  viewDetails(apiStatisticsSummary: ApiStatisticsSummary, type: string): void {
    this.selectedQuota = apiStatisticsSummary;
    this.selectedApiKeySummaryType = type;
  }

  calculatePercentage(numerator: number, denominator: number) {
    if (numerator === 0 || denominator === 0) {
      return 0;
    } else {
      return numerator / denominator * 100;
    }
  }

  backToMainList() {
    this.selectedQuota = null;
  }
}
