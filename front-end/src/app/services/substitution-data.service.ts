import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import {Paginated} from '../share/types/paginate.type';
import {SubstitutionData} from '../share/types/substitution-data.model.type';
import {Upsert} from '../share/types/utilities';

@Injectable({
  providedIn: 'root'
})
export class SubstitutionDataService {
  private api: string = `${environment.api_url}/substitution-data`;

  constructor(private http: HttpClient) {
  }

  find(queryString: string) {
    return this.http.get<Paginated<SubstitutionData>>(`${this.api}?${queryString}`);
  }

  get(id: number) {
    return this.http.get(`${this.api}/` + id);
  }

  create(data: Upsert<SubstitutionData>) {
    return this.http.post(`${this.api}`, data);
  }

  update(id: number, data: Upsert<SubstitutionData>) {
    return this.http.patch(`${this.api}/` + id, data);
  }

  upsert(id: number | null | undefined, data: Upsert<SubstitutionData>) {
    return !!id ? this.update(id, data) : this.create(data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/` + id);
  }
}
