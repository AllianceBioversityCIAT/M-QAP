import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {EmailType} from 'src/app/share/types/email.model.type';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Paginated} from 'src/app/share/types/paginate.type';
import {MatDialog} from '@angular/material/dialog';
import {EmailsService} from 'src/app/services/emails.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {PageEvent} from '@angular/material/paginator';
import {EmailBodyComponent} from "../email-body/email-body.component";

@Component({
  selector: 'app-email-table',
  templateUrl: './email-table.component.html',
  styleUrls: ['./email-table.component.scss']
})
export class EmailTableComponent {
  columnsToDisplay: string[] = ['id', 'name', 'subject', 'email', 'status', 'creation_date', 'update_date', 'actions'];
  dataSource!: MatTableDataSource<EmailType>;
  form!: FormGroup;
  response!: Paginated<EmailType>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:DESC';
  text = '';

  constructor(
    public dialog: MatDialog,
    private emailsService: EmailsService,
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
      sortBy: ['id:DESC'],
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

  async loadData() {
    this.loaderService.open();
    const queryString = [];
    queryString.push(`limit=${this.pageSize}`);
    queryString.push(`page=${this.pageIndex + 1}`);
    queryString.push(`sortBy=${this.sortBy}`);
    queryString.push(`search=${this.text}`);

    this.emailsService
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

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.loadData();
  }

  openShowEmailBodyDialog(data: any): void {
    this.dialog.open(EmailBodyComponent, {
      width: '700px',
      data: data,
    });
  }
}
