import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { SensorDataService } from '../services/sensor-data.service';
import { Device } from '../models/Device.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../services/device.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  devices: Device[] = [];
  displayAddDeviceDialog = false;
  newDeviceCode = '';
  newDeviceTitle = '';
  username = '';
  loading = false;
  isLoggedIn: boolean = true;

  constructor(
    public authService: AuthService,
    private sensorService: SensorDataService,
    private router: Router,
    private deviceService: DeviceService
  ) {}

  ngOnInit() {
    this.getDevice();
  }
  showAddDeviceDialog() {
    this.displayAddDeviceDialog = true;
  }

  addDevice() {
    const newDevice = {
      deviceId: this.newDeviceCode,
      title: this.newDeviceTitle
    };
    if (!newDevice) return;

    this.loading = true;
    this.deviceService.addDevice(newDevice).subscribe({
      next: () => {
        this.displayAddDeviceDialog = false;
        this.newDeviceCode = '';
        this.newDeviceTitle = '';
        this.loading = false;
        // Refresh devices list
        this.getDevice();
      },
      error: err => {
        this.loading = false;
        console.log(err);
      }
    });
  }

  getDevice() {
    this.deviceService.getDevices().subscribe({
      next: (devices) => {
        this.devices = [];
  
        const deviceRequests = devices.map((device: Device) => {
          return this.sensorService.getDataByDeviceId(device.deviceId).toPromise().then((sensorDataArray: any[]) => {
            sensorDataArray.forEach((sensorData: any) => {
              const updatedDevice: Device = {
                ...device,
                latestTemp: sensorData.temperature?.toString() || '0',
                latestCo2: sensorData.cO2?.toString() || '0',
                humidity: sensorData.humidity?.toString() || '0',
                chartData: JSON.stringify(sensorData)
              };
              this.devices.push(updatedDevice);
            });
          });
        });
  
        Promise.all(deviceRequests).then(() => {
          // When all sensor data is loaded, THEN draw the charts
          this.drawCharts();
        });
  
      },
      error: (err) => console.error('Error fetching devices:', err)
    });
  }
  
  drawCharts() {
    setTimeout(() => {
      this.devices.forEach((device, index) => {
        const temp = Number(device.latestTemp) || 0; 
        const co2 = Number(device.latestCo2) || 0; 
        const humidity = Number(device.humidity) || 0;
  
        new Chart('tempPieChart' + index, { 
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: [ temp, 50 - temp ],
                backgroundColor: ['#32CD32', '#E5E5E5'],
                borderWidth: 0,
              },
            ],
          },
          options: { responsive: true, cutout: '70%' }
        });
  
        new Chart('co2PieChart' + index, { 
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: [ co2, 1000 - co2 ],
                backgroundColor: ['#32CD32', '#E5E5E5'],
                borderWidth: 0,
              },
            ],
          },
          options: { responsive: true, cutout: '70%' }
        });
  
        new Chart('humidityPieChart' + index, { 
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: [ humidity, 100 - humidity ],
                backgroundColor: ['#00CED1', '#E5E5E5'],
                borderWidth: 0,
              },
            ],
          },
          options: { responsive: true, cutout: '70%' }
        });
      });
    }, 0);
  }
  
  logout() {
    localStorage.removeItem('Token');
    this.router.navigate(['/login']);
  }
}
