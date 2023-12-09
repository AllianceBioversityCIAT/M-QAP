import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCycleTableComponent } from './training-cycle-table.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TrainingCycleService } from 'src/app/services/training-cycle.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { Paginated } from 'src/app/share/types/paginate.type';
import { TrainingCycle } from 'src/app/share/types/training-cycle.model.type';

describe('TrainingCycleTableComponent', () => {
  let component: TrainingCycleTableComponent;
  let fixture: ComponentFixture<TrainingCycleTableComponent>;

  let trainingCycleService: any;

  beforeEach(() => {
    trainingCycleService = jasmine.createSpyObj([
      'find',
      'get',
      'create',
      'update',
      'upsert',
      'delete',
    ]);

    const list: Array<TrainingCycle> = [
      {
        id: 1,
        creation_date: '',
        update_date: '',
        predictions: [],
        text: 'Cycle text1',
      },
      {
        id: 2,
        creation_date: '',
        update_date: '',
        predictions: [],
        text: 'Cycle text2',
      },
    ];

    const findResponse: Paginated<TrainingCycle> = {
      data: list,
      meta: {
        currentPage: 1,
        itemsPerPage: 2,
        totalItems: 2,
        totalPages: 1,
        search: '',
        searchBy: [],
        select: [],
        sortBy: [],
      },
      
    };

    trainingCycleService.find.and.returnValue(of(findResponse));

    TestBed.configureTestingModule({
      declarations: [TrainingCycleTableComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        HttpClientModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: TrainingCycleService, useValue: trainingCycleService },
      ],
    });
    fixture = TestBed.createComponent(TrainingCycleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should form init', () => {
    component.ngOnInit();
    expect(component.form).toBeTruthy();
    expect(component.form).toBeInstanceOf(FormGroup);
  });
});
