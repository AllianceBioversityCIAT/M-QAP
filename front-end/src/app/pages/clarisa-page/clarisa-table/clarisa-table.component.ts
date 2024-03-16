import {Component} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Paginated} from 'src/app/share/types/paginate.type';
import {MatDialog} from '@angular/material/dialog';
import {OrganizationsService} from 'src/app/services/organizations.service';
import {Organization} from 'src/app/share/types/organization.model.type';
import {LoaderService} from 'src/app/services/loader.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';

@Component({
  selector: 'app-clarisa-table',
  templateUrl: './clarisa-table.component.html',
  styleUrls: ['./clarisa-table.component.scss'],
})
export class ClarisaTableComponent {
  columnsToDisplay: string[] = ['id', 'name', 'acronym', 'code', 'hq_location', 'institution_type', 'website_link'];
  dataSource!: MatTableDataSource<Organization>;
  response!: Paginated<Organization>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:ASC';
  text = '';
  form!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private organizationService: OrganizationsService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
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

    this.organizationService
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
}
