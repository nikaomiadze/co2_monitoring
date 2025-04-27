import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class DeviceService {
  private baseUrl = 'https://dockertest-production-65f4.up.railway.app/api/user';

  constructor(private http: HttpClient) {}

  getDevices(): Observable<any> {
    const token = localStorage.getItem('Token'); // Get stored JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Attach token
    });
    return this.http.get(`${this.baseUrl}/devices`,{headers});
  }

  addDevice(data: { deviceId: string, title: string }): Observable<any> {
    const token = localStorage.getItem('Token'); // Get stored JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Attach token
    });
    return this.http.post(`${this.baseUrl}/add-device`, data, {headers});
  }
  private getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }
}
