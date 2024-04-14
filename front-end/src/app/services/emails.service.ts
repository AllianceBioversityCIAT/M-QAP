import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import {Paginated} from '../share/types/paginate.type';
import {EmailType} from '../share/types/email.model.type';

@Injectable({
  providedIn: 'root'
})
export class EmailsService {
  private api: string = `${environment.api_url}/emails`;

  constructor(private http: HttpClient) {
  }

  find(queryString: string) {
    return this.http.get<Paginated<EmailType>>(`${this.api}?${queryString}`);
  }
}
