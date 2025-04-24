import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class DeviceService {
  private baseUrl = 'https://dockertest-production-65f4.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getDevices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/devices`);
  }

  addDevice(data: { deviceId: string, title: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-device`, data);
  }
  private getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }
}
