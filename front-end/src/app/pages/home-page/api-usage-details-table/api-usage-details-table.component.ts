import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {MatTableDataSource} from '@angular/material/table';
import {ApiStatisticsSummary, ApiUsage, WosApiUsage} from 'src/app/share/types/api-statistics.model.type';
import {Paginated} from 'src/app/share/types/paginate.type';
import {LoaderService} from '../../../services/loader.service';
import {PageEvent} from "@angular/material/paginator";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-api-usage-details-table',
  templateUrl: './api-usage-details-table.component.html',
  styleUrls: ['./api-usage-details-table.component.scss']
})
export class ApiUsageDetailsTableComponent implements OnInit {
  columnsToDisplay: string[] = ['id', 'creation_date', 'path'];
  columnsToDisplayWos: string[] = ['id', 'creation_date', 'doi'];
  dataSource!: MatTableDataSource<ApiUsage | WosApiUsage>;
  response!: Paginated<ApiUsage | WosApiUsage>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:DESC';
  text = '';
  form!: FormGroup;

  @Input() selectedApiKey: ApiStatisticsSummary | null = null;
  @Input() selectedApiKeySummaryType = '';
  apiKeyId: number | null = null;

  constructor(
    private apiKeyService: ApiKeysService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.apiKeyId = this.selectedApiKey?.id ? this.selectedApiKey.id : null;
    if (this.apiKeyId) {
      this.loadData();
    }
  }

  initForm() {
    this.form = this.fb.group({
      text: [''],
      sortBy: ['id:DESC'],
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
    if (this.apiKeyId) {
      const queryString = [];
      queryString.push(`limit=${this.pageSize}`);
      queryString.push(`page=${this.pageIndex + 1}`);
      queryString.push(`sortBy=${this.sortBy}`);
      queryString.push(`search=${this.text}`);

      this.apiKeyService
        .findDetails(queryString.join('&'), this.apiKeyId, this.selectedApiKeySummaryType, year)
        .subscribe((response) => {
          this.response = response;
          this.length = response.meta.totalItems;
          this.dataSource = new MatTableDataSource(response.data);
        });
    }
  }

}
