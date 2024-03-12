import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Paginated} from 'src/app/share/types/paginate.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {LoaderService} from 'src/app/services/loader.service';
import {PageEvent} from '@angular/material/paginator';
import {ApiStatisticsSummary} from 'src/app/share/types/api-statistics.model.type';

@Component({
  selector: 'app-api-usage-table',
  templateUrl: './api-usage-table.component.html',
  styleUrls: ['./api-usage-table.component.scss']
})
export class ApiUsageTableComponent {
  columnsToDisplay: string[] = ['api_key', 'parent_name', 'parent_type', 'name', 'type', 'api_requests', 'quota', 'used_wos_quota', 'parent_is_active', 'is_active', 'actions'];
  dataSource!: MatTableDataSource<ApiStatisticsSummary>;
  response!: Paginated<ApiStatisticsSummary>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'name:ASC';
  text = '';
  form!: FormGroup;
  selectedApiKey: ApiStatisticsSummary | null = null;
  selectedApiKeySummaryType = '';

  constructor(
    public dialog: MatDialog,
    private apiKeyService: ApiKeysService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.loaderService.open();
    this.loadData();
  }

  initForm() {
    this.form = this.fb.group({
      text: [''],
      sortBy: ['name:ASC'],
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

  async loadData(year: number = (new Date()).getFullYear()) {
    const queryString = [];
    queryString.push(`limit=${this.pageSize}`);
    queryString.push(`page=${this.pageIndex + 1}`);
    queryString.push(`sortBy=${this.sortBy}`);
    queryString.push(`search=${this.text}`);

    this.apiKeyService
      .findSummary(queryString.join('&'), year)
      .subscribe((response) => {
        this.response = response;
        this.length = response.meta.totalItems;
        this.dataSource = new MatTableDataSource(response.data);
        this.loaderService.close();
      });
  }

  viewDetails(apiStatisticsSummary: ApiStatisticsSummary, type: string): void {
    this.selectedApiKey = apiStatisticsSummary;
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
    this.selectedApiKey = null;
  }
}
