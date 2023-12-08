import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private _state$ = new BehaviorSubject<boolean>(false);
  public state$ = this._state$.asObservable();

  open() {
    this._state$.next(true);
  }

  close() {
    this._state$.next(false);
  }
}
