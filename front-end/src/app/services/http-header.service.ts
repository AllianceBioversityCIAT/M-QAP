import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpHeaderService implements HttpInterceptor {
  constructor() {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let access_token = localStorage.getItem('access_token');

    req = req.clone({
      headers: req.headers.set('Authorization', access_token ? 'Bearer ' + access_token : '')
    });

    return next.handle(req).pipe(tap(() => {
      },
      (err: any) => {
        console.error(err);
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          }
        }
      }));
  }
}
