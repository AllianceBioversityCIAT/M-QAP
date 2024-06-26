import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { concat, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CommoditiesService } from 'src/app/services/commodities.service';

@Component({
  selector: 'app-commodity-input',
  templateUrl: './commodity-input.component.html',
  styleUrls: ['./commodity-input.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    NgSelectModule,
    FormsModule,
    MatTooltipModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommodityInputComponent),
      multi: true,
    },
  ],
})
export class CommodityInputComponent
  implements ControlValueAccessor, OnDestroy, OnInit
{
  @Output() add = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Input() multiple: boolean = false;
  @Input() placeholder = 'Search ...';
  @Input() readonly: boolean = false;

  value?: string | null;
  labelFieldName = 'name';
  filteredOptions$: Observable<any> = of([]);
  partnerInput$ = new Subject<string>();
  searchControl = new FormControl();
  loading = false;
  selectedPartner?: any;
  control = new FormControl('', Validators.required);

  onChange?: (value: any) => void;
  onTouched?: () => void;
  compareObjects: (v1: any, v2: any) => boolean = (v1, v2): boolean => {
    console.log(v1, v2);

    return v1 === v2;
  };
  trackByFn(item: any) {
    return item.id;
  }

  constructor(
    private commoditiesService: CommoditiesService,
    public dialogService: MatDialog
  ) {}

  ngOnInit(): void {
    this.placeholder = this.placeholder
      ? this.placeholder
      : this.labelFieldName;
    this.filteredOptions$ = concat(
      of([]),
      this.partnerInput$.pipe(
        distinctUntilChanged(),
        debounceTime(200),
        filter((term) => {
          return typeof term == 'string' && term.length >= 2;
        }),
        tap(() => (this.loading = true)),

        switchMap((term) => {
          console.log(term);
          const queryString = [];
          queryString.push(`limit=15`);
          queryString.push(`page=1`);
          queryString.push(`search=${term}`);
          queryString.push(`parent=true`);
          return this.commoditiesService.find(queryString.join('&')).pipe(
            catchError(() => of({ data: [] })),
            tap(() => (this.loading = false)),
            map((response) => response.data)
          );
        })
      )
    );
    this.control.valueChanges.subscribe((value) => {
      this.value = value;
      if (this.onTouched) this.onTouched();
      if (this.onChange) this.onChange(value);
    });
  }

  selected() {
    this.control.setValue(this.selectedPartner);
  }

  displayFn(option: any): string {
    return option && option.name ? option.name : '';
  }

  writeValue(value: any) {
    if (value?.clarisa_id) {
      this.filteredOptions$ = of([value]);
    } else if (typeof value == 'number') {
      this.commoditiesService.get(value).subscribe((commodity) => {
        this.filteredOptions$ = of([commodity]);
      });
    }
    this.value = value;
    this.selectedPartner = value;
    this.control.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {}
  ngOnDestroy(): void {}
}
