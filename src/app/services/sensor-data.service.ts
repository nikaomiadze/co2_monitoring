import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private apiUrl = 'https://dockertest-production-65f4.up.railway.app/api/SensorData';

  constructor(private http: HttpClient) {}

  getDataByDeviceId(deviceId: string): Observable<any> {
    const token = localStorage.getItem('Token'); // Get stored JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Attach token
    });
    return this.http.get(`${this.apiUrl}/${deviceId}`,{headers});
  }
}
