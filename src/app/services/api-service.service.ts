import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  getPatients() {
    return this.httpClient.get(environment.queryURI + '/Patient',
      { headers: this.getHeaders(), params: this.getParams() });
  }

  filterPatients(obj: {}) {
    return this.httpClient.get(environment.queryURI + '/Patient',
      { headers: this.getHeaders(), params: this.getFilterParams(obj) });
  }

  getQuestionnaire() {
    return this.httpClient.get<any[]>('assets/questionnaire.json');
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/fhir+json'
    });
    return headers;
  }

  private getParams(): HttpParams {
    const params = new HttpParams()
                    .set('birthdate', 'gt1960-01-01')
                    .append('birthdate', 'lt1965-12-31');
    return params;
  }

  private getFilterParams(obj: {}): HttpParams {
    let params = new HttpParams();
    Object.keys(obj).forEach(key => {
      params = params.set(key, obj[key]);
    });

    return params;
  }
}


