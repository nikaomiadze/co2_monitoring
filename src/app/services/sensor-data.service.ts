import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private apiUrl = 'https://dockertest-production-65f4.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getDataByDeviceId(deviceId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${deviceId}`);
  }
}
