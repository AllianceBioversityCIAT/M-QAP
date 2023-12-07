import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private _open = false;

  get state() {
    return this._open;
  }
  
  open() {
    this._open = true;
  }

  close() {
    this._open = false;
  }
}
