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
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import {UsersService} from 'src/app/services/users.service';
import {User} from '../types/user.model.type';

@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.scss'],
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
      useExisting: forwardRef(() => UserInputComponent),
      multi: true,
    },
  ],
})
export class UserInputComponent
  implements ControlValueAccessor, OnDestroy, OnInit {
  @Output() add = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Input() multiple: boolean = false;
  @Input() labelTemplate?: TemplateRef<any>;
  @Input() placeholder = 'Search ...';
  @Input() readonly: boolean = false;

  value?: User | null;
  filteredOptions$: Observable<any> = of([]);
  userInput$ = new Subject<string>();
  loading = false;
  selectedItem?: any;
  control = new FormControl<User | null>(null, Validators.required);

  onChange?: (value: any) => void;
  onTouched?: () => void;
  compareObjects: (v1: any, v2: any) => boolean = (v1, v2): boolean => {
    return v1.id === v2;
  };

  trackByFn(item: User) {
    return item.id;
  }

  constructor(
    private usersService: UsersService,
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
      this.userInput$.pipe(
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
          queryString.push(`sortBy=full_name:ASC`);
          queryString.push(`search=${term}`);
          return this.usersService.find(queryString.join('&')).pipe(
            catchError(() => of({ data: [] })),
            tap(() => (this.loading = false)),
            map((response) => {
              return response.data.map(user => this.prepareOption(user));
            })
          );
        })
      )
    );
  }

  selected() {
    this.control.setValue(this.selectedItem);
  }

  displayFn(option: User): string {
    return option && option.full_name ? option.full_name : '';
  }

  prepareOption(option: User): User {
    const nameParts = [];
    if (option && option?.full_name) {
      nameParts.push(option.full_name);
      if (option?.email) {
        nameParts.push(option.email);
      }
    }
    option.full_name = nameParts.join(' - ');

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
      this.usersService.get(value).subscribe((user) => {
        user = this.prepareOption(user);
        this.initializeSelect([user]);
        this.value = user;
        this.selectedItem = user;
        this.control.patchValue(user, {emitEvent: false});
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
