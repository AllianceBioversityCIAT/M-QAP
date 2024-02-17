import { NgModule } from '@angular/core';
import { TrainingCyclePageRoutingModule } from './training-cycle-page-routing.module';
import { TrainingCyclePageComponent } from './training-cycle-page.component';
import { TrainingCycleTableComponent } from './training-cycle-table/training-cycle-table.component';
import { TrainingCycleAddDialogComponent } from './training-cycle-add-dialog/training-cycle-add-dialog.component';
import { PagePaseModule } from '../page-pase.module';
import { DeleteConfirmDialogModule } from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    TrainingCyclePageComponent,
    TrainingCycleTableComponent,
    TrainingCycleAddDialogComponent,
  ],
  imports: [
    PagePaseModule,
    TrainingCyclePageRoutingModule,
    DeleteConfirmDialogModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
})
export class TrainingCyclePageModule {}
