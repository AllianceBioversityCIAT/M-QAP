import {Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {TrainingCycleService} from 'src/app/services/training-cycle.service';
import {TrainingCycleAddDialogComponent} from '../training-cycle-add-dialog/training-cycle-add-dialog.component';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Paginated} from 'src/app/share/types/paginate.type';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {TrainingCycle} from 'src/app/share/types/training-cycle.model.type';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';
import {LoaderService} from 'src/app/services/loader.service';
import {filter, switchMap} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-training-cycle-table',
  templateUrl: './training-cycle-table.component.html',
  styleUrls: ['./training-cycle-table.component.scss'],
})
export class TrainingCycleTableComponent {
  columnsToDisplay: string[] = ['id', 'text', 'creation_date', 'update_date', 'training_is_completed', 'is_active', 'actions'];
  dataSource!: MatTableDataSource<TrainingCycle>;
  form!: FormGroup;
  response!: Paginated<TrainingCycle>;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'id:DESC';
  text = '';
  @Input('trainingProgressSocket') trainingProgressSocket: any;
  trainingProgress = 0;
  trainingStatus = '';
  trainingInProgress = false;

  constructor(
    public dialog: MatDialog,
    private trainingCycleService: TrainingCycleService,
    private snackBarService: SnackBarService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.loadData();

    if (this.trainingProgressSocket) {
      this.trainingProgressSocket.on('training_progress', (message: any) => {
        this.trainingProgress = message.progress;
        this.trainingStatus = message.process;
        this.trainingInProgress = message.trainingInProgress;
        if (message.progress === 0) {
          this.snackBarService.success(`Training ${message.process} successfully.`);
          this.loadData();
        }
      });
    }
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

    this.trainingCycleService
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

  openDialog(id: number = 0): void {
    this.loaderService.open();
    const dialogRef = this.dialog.open(TrainingCycleAddDialogComponent, {
      data: {id: id},
      width: '100%',
      maxWidth: '650px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.submitted) this.loadData();
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.loadData();
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
          return this.trainingCycleService.delete(id)
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

  startTraining() {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: 'Are you sure you want to start new training cycle?',
          title: 'Start new training cycle',
        },
      })
      .afterClosed()
      .subscribe(async (dialogResult) => {
        if (dialogResult == true) {
          await this.trainingCycleService.startTraining().subscribe({
            next: () => {
              this.loadData();
              this.snackBarService.success('Training started successfully.');
            },
            error: (error) => {
              this.snackBarService.error(error.error.message);
            },
          });
        }
      });
  }

  cancelTraining() {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: 'Are you sure you want to cancel this training cycle?',
          title: 'Cancel training cycle',
        },
      })
      .afterClosed()
      .subscribe(async (dialogResult) => {
        if (dialogResult == true) {
          await this.trainingCycleService.cancelTraining().subscribe({
            next: (data: any) => {
              if (data.stopped) {
                this.snackBarService.success(data.message);
              } else {
                this.snackBarService.error(data.message);
              }
            },
            error: (error) => {
              this.snackBarService.error(error.error.message);
            },
          });
        }
      });
  }

  setActiveCycle(id: number) {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          message: 'Are you sure you want to set this cycle as active?',
          title: 'Activate training cycle',
        },
      })
      .afterClosed()
      .pipe(
        filter((i) => !!i),
        switchMap(() => {
          this.loaderService.open();
          return this.trainingCycleService.setActiveCycle(id)
        })
      )
      .subscribe({
        next: () => {
          this.loaderService.close();
          this.loadData();
          this.snackBarService.success('Active training cycle is set successfully.');
        },
        error: (error) => {
          this.loaderService.close();
          this.snackBarService.error(error.error.message);
        },
      });
  }
}
