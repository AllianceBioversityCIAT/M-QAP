import {CommonModule} from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgSelectModule} from '@ng-select/ng-select';
import {concat, Observable, of, Subject} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter, map,
  switchMap,
  tap,
} from 'rxjs/operators';
import {OrganizationsService} from 'src/app/services/organizations.service';
import {Organization} from '../types/organization.model.type';

@Component({
  selector: 'app-organization-input',
  templateUrl: './organization-input.component.html',
  styleUrls: ['./organization-input.component.scss'],
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
      useExisting: forwardRef(() => OrganizationInputComponent),
      multi: true,
    },
  ],
})
export class OrganizationInputComponent
  implements ControlValueAccessor, OnDestroy, OnInit {
  @Output() add = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Input() multiple: boolean = false;
  @Input() labelTemplate?: TemplateRef<any>;
  @Input() placeholder = 'Search ...';
  @Input() readonly: boolean = false;

  value?: Organization | null;
  filteredOptions$: Observable<any> = of([]);
  partnerInput$ = new Subject<string>();
  loading = false;
  selectedItem?: any;
  control = new FormControl<Organization | null>(null, Validators.required);

  onChange?: (value: any) => void;
  onTouched?: () => void;
  compareObjects: (v1: any, v2: any) => boolean = (v1, v2): boolean => {
    return v1.id === v2;
  };

  trackByFn(item: Organization) {
    return item.id;
  }

  constructor(
    private organizationsService: OrganizationsService,
  ) {
  }

  ngOnInit(): void {
    this.initializeSelect([]);
    this.control.valueChanges.subscribe((value) => {
      this.value = value;
      if (this.onTouched) this.onTouched();
      if (this.onChange) this.onChange(value);
    });
  }

  initializeSelect(presetValues: Array<any>): void {
    this.filteredOptions$ = concat(
      of(presetValues),
      this.partnerInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        filter((term) => {
          return typeof term == 'string' && term.length >= 2;
        }),
        tap(() => (this.loading = true)),
        switchMap((term) => {
          const queryString = [];
          queryString.push(`limit=20`);
          queryString.push(`page=1`);
          queryString.push(`sortBy=name:ASC`);
          queryString.push(`search=${term}`);
          return this.organizationsService.find(queryString.join('&')).pipe(
            catchError(() => of({ data: [] })),
            tap(() => (this.loading = false)),
            map((response) => {
              return response.data.map(org => this.prepareOption(org));
            })
          );
        })
      )
    );
  }

  selected() {
    this.control.setValue(this.selectedItem);
  }

  displayFn(option: Organization): string {
    return option && option.name ? option.name : '';
  }

  prepareOption(option: Organization): Organization {
    const nameParts = [];
    if (option && option?.name) {
      nameParts.push(option.name);
      if (option?.acronym) {
        nameParts.push(option.acronym);
      }
    }
    option.name = nameParts.join(' - ');

    return option;
  }

  async writeValue(value: any) {
    if (value?.id) {
      value = this.prepareOption(value);
      this.initializeSelect([value]);
      this.value = value;
      this.selectedItem = value;
      this.control.patchValue(value, {emitEvent: false});
    } else if (typeof value == 'number') {
      this.organizationsService.get(value).subscribe((org) => {
        org = this.prepareOption(org);
        this.initializeSelect([org]);
        this.value = org;
        this.selectedItem = org;
        this.control.patchValue(org, {emitEvent: false});
      });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(_isDisabled: boolean): void {
  }

  ngOnDestroy(): void {
  }
}
