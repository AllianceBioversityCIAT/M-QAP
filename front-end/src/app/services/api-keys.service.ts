import { Injectable } from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import {Paginated} from '../share/types/paginate.type';
import {ApiKeys} from '../share/types/api-keys.model.type';
import {Upsert} from '../share/types/utilities';
import {
  ApiStatistics,
  ApiStatisticsSummary,
  ApiUsage,
  WosApiUsage
} from 'src/app/share/types/api-statistics.model.type';

@Injectable({
  providedIn: 'root'
})
export class ApiKeysService {
  private api: string = `${environment.api_url}/api-keys`;

  constructor(private http: HttpClient) {
  }

  find(queryString: string) {
    return this.http.get<Paginated<ApiKeys>>(`${this.api}?${queryString}`);
  }

  get(id: number) {
    return this.http.get<ApiKeys>(`${this.api}/` + id);
  }

  search(term: string) {
    return this.http.get<Array<ApiKeys>>(`${this.api}/search`, {
      params: {
        term,
      },
    });
  }

  create(data: Upsert<ApiKeys, 'id'>) {
    return this.http.post<ApiKeys>(`${this.api}`, data);
  }

  update(id: number, data: Upsert<ApiKeys, 'id'>) {
    return this.http.patch<ApiKeys>(`${this.api}/` + id, data);
  }

  upsert(id: number | null | undefined, data: Upsert<ApiKeys>) {
    return !!id ? this.update(id, data) : this.create(data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/` + id);
  }

  updateStatus(id: number, is_active: boolean) {
    return this.http.patch(`${this.api}/update-status/` + id, {is_active});
  }

  regenerate(id: number) {
    return this.http.patch(`${this.api}/regenerate/` + id, {});
  }

  getStatistics(year: number) {
    return this.http.get<ApiStatistics>(`${this.api}/usage/${year}`);
  }

  findSummary(queryString: string, year: number) {
    return this.http.get<Paginated<ApiStatisticsSummary>>(`${this.api}/summary/${year}?${queryString}`);
  }

  findDetails(queryString: string, apiKeyId: number, type: string, year: number) {
    return this.http.get<Paginated<ApiUsage | WosApiUsage>>(`${this.api}/details/${apiKeyId}/${type}/${year}?${queryString}`);
  }
}
