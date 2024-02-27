import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Paginated} from '../share/types/paginate.type';
import {environment} from 'src/environments/environment';
import {Repository} from '../share/types/repository.model.type';
import {RepositorySchema} from '../share/types/repository-schema.model.type';
import {Upsert} from '../share/types/utilities';

@Injectable({
  providedIn: 'root',
})
export class RepositoriesService {
  private api: string = `${environment.api_url}/repositories`;

  constructor(private http: HttpClient) {
  }

  find(queryString: string) {
    return this.http.get<Paginated<Repository>>(`${this.api}?${queryString}`);
  }

  get(id: number) {
    return this.http.get<Repository>(`${this.api}/` + id);
  }

  search(term: string) {
    return this.http.get<Array<Repository>>(`${this.api}/search`, {
      params: {
        term,
      },
    });
  }

  create(data: Upsert<Repository, 'id'>) {
    return this.http.post<Repository>(`${this.api}`, data);
  }

  update(id: number, data: Upsert<Repository, 'id'>) {
    return this.http.patch<Repository>(`${this.api}/` + id, data);
  }

  upsert(id: number | null | undefined, data: Upsert<Repository>) {
    return !!id ? this.update(id, data) : this.create(data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/` + id);
  }

  getSchema(repository_id: number) {
    return this.http.get<RepositorySchema[]>(`${this.api}/schema/` + repository_id);
  }

  updateSchema(repository_id: number, data: RepositorySchema) {
    return this.http.patch<RepositorySchema[]>(`${this.api}/schema/` + repository_id, data);
  }
}
