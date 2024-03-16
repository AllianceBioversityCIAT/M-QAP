import {Injectable} from '@angular/core';
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
import {WosQuota} from '../share/types/wos-quota.model.type';
import {WosQuotaYear} from '../share/types/wos-quota-year.model.type';

@Injectable({
  providedIn: 'root'
})
export class ApiKeysService {
  private api: string = `${environment.api_url}/api-keys`;

  constructor(private http: HttpClient) {
  }

  upsertWosQuota(id: number | null | undefined, data: Upsert<WosQuota>) {
    return !!id ? this.updateWosQuota(id, data) : this.createWosQuota(data);
  }

  createWosQuota(data: Upsert<WosQuota, 'id'>) {
    return this.http.post<WosQuota>(`${this.api}/wos-quota`, data);
  }

  updateWosQuota(id: number, data: Upsert<WosQuota, 'id'>) {
    return this.http.patch<WosQuota>(`${this.api}/wos-quota/${id}`, data);
  }

  findWosQuota(queryString: string) {
    return this.http.get<Paginated<WosQuota>>(`${this.api}/wos-quota?${queryString}`);
  }

  getWosQuota(id: number) {
    return this.http.get<WosQuota>(`${this.api}/wos-quota/${id}`);
  }

  updateStatusWosQuota(id: number, is_active: boolean) {
    return this.http.patch(`${this.api}/wos-quota/update-status/` + id, {is_active});
  }

  deleteWosQuota(id: number) {
    return this.http.delete(`${this.api}/wos-quota/${id}`);
  }

  upsertWosQuotaYear(id: number | null | undefined, wosQuotaId: number, data: Upsert<WosQuotaYear>) {
    return !!id ? this.updateWosQuotaYear(id, data) : this.createWosQuotaYear(wosQuotaId, data);
  }

  createWosQuotaYear(wosQuotaId: number, data: Upsert<WosQuotaYear, 'id'>) {
    return this.http.post<WosQuotaYear>(`${this.api}/wos-quota-year/${wosQuotaId}`, data);
  }

  updateWosQuotaYear(id: number, data: Upsert<WosQuotaYear, 'id'>) {
    return this.http.patch<WosQuotaYear>(`${this.api}/wos-quota-year/${id}`, data);
  }

  findWosQuotaYear(queryString: string) {
    return this.http.get<Paginated<WosQuotaYear>>(`${this.api}/wos-quota-year?${queryString}`);
  }

  getWosQuotaYear(id: number) {
    return this.http.get<WosQuotaYear>(`${this.api}/wos-quota-year/${id}`);
  }

  deleteWosQuotaYear(id: number) {
    return this.http.delete(`${this.api}/wos-quota-year/${id}`);
  }

  upsert(id: number | null | undefined, wosQuotaId: number, data: Upsert<ApiKeys>) {
    return !!id ? this.update(id, data) : this.create(wosQuotaId, data);
  }

  create(wosQuotaId: number, data: Upsert<ApiKeys, 'id'>) {
    return this.http.post<ApiKeys>(`${this.api}/api-keys/${wosQuotaId}`, data);
  }

  update(id: number, data: Upsert<ApiKeys, 'id'>) {
    return this.http.patch<ApiKeys>(`${this.api}/api-keys/` + id, data);
  }

  find(queryString: string, wosQuotaId: number) {
    return this.http.get<Paginated<ApiKeys>>(`${this.api}/api-keys/${wosQuotaId}?${queryString}`);
  }

  get(id: number) {
    return this.http.get<ApiKeys>(`${this.api}/api-key/` + id);
  }

  updateStatus(id: number, is_active: boolean) {
    return this.http.patch(`${this.api}/api-keys/update-status/` + id, {is_active});
  }

  regenerate(id: number) {
    return this.http.patch(`${this.api}/api-keys/regenerate/` + id, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/api-keys/` + id);
  }

  getStatistics(year: number) {
    return this.http.get<ApiStatistics>(`${this.api}/usage/${year}`);
  }

  findQuotaSummary(queryString: string, year: number) {
    return this.http.get<Paginated<ApiStatisticsSummary>>(`${this.api}/quota-summary/${year}?${queryString}`);
  }

  findDetails(queryString: string, quotaId: number, type: string, year: number) {
    return this.http.get<Paginated<ApiUsage | WosApiUsage>>(`${this.api}/details/${quotaId}/${type}/${year}?${queryString}`);
  }
}
