import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Paginated} from '../share/types/paginate.type';
import {environment} from 'src/environments/environment';
import {User} from '../share/types/user.model.type';
import {Upsert} from '../share/types/utilities';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private api: string = `${environment.api_url}/users`;

  constructor(private http: HttpClient) {
  }

  find(queryString: string) {
    return this.http.get<Paginated<User>>(`${this.api}?${queryString}`);
  }

  get(id: number) {
    return this.http.get<User>(`${this.api}/` + id);
  }

  search(term: string) {
    return this.http.get<Array<User>>(`${this.api}/search`, {
      params: {
        term,
      },
    });
  }

  create(data: Upsert<User, 'id'>) {
    return this.http.post<User>(`${this.api}`, data);
  }

  update(id: number, data: Upsert<User, 'id'>) {
    return this.http.patch<User>(`${this.api}/` + id, data);
  }

  upsert(id: number | null | undefined, data: Upsert<User>) {
    return !!id ? this.update(id, data) : this.create(data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/` + id);
  }
}
