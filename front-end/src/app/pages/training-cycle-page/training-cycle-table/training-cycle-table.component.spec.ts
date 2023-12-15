import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingCycleTableComponent } from './training-cycle-table.component';
import { MatDialog } from '@angular/material/dialog';
import { TrainingCycleService } from 'src/app/services/training-cycle.service';
import { FormGroup } from '@angular/forms';
import { Paginated } from 'src/app/share/types/paginate.type';
import { TrainingCycle } from 'src/app/share/types/training-cycle.model.type';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PagePaseModule } from '../../page-pase.module';

describe('TrainingCycleTableComponent', () => {
  let component: TrainingCycleTableComponent;
  let fixture: ComponentFixture<TrainingCycleTableComponent>;

  let trainingCycleService: any;
  let matDialogService: any;

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
    //
    const any = null;
    trainingCycleService.delete.and.returnValue(of(any));

    //

    matDialogService = jasmine.createSpyObj(['open']);
    const openReturnedObject = jasmine.createSpyObj(['afterClosed']);
    openReturnedObject.afterClosed.and.returnValue(of(true));
    matDialogService.open.and.returnValue(openReturnedObject);
    //

    TestBed.configureTestingModule({
      declarations: [TrainingCycleTableComponent],
      imports: [PagePaseModule, BrowserAnimationsModule],
      providers: [
        { provide: TrainingCycleService, useValue: trainingCycleService },
        { provide: MatDialog, useValue: matDialogService },
      ],
    });
    fixture = TestBed.createComponent(TrainingCycleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should form init', () => {
    component.ngOnInit();
    expect(component.form).toBeInstanceOf(FormGroup);
  });

  it('After delete should lead the data function called', () => {
    spyOn(component, 'loadData');
    component.delete(1);
    expect(component.loadData).toHaveBeenCalledTimes(1);
  });
});
