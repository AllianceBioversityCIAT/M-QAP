import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ZodError, ZodFirstPartySchemaTypes } from 'zod';

export const vb = (schema: ZodFirstPartySchemaTypes) => {
  return (control: AbstractControl) => {
    try {
      schema.parse(control.value);
    } catch (err: any) {
      if (err instanceof ZodError) {
        console.log(err.issues);
        return err.issues;
      }
    }
    return null;
  };
};

@Injectable({
  providedIn: 'root',
})
export class ValidatorService {
  constructor() {}
}
