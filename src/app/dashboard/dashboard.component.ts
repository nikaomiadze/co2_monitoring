import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { SensorDataService } from '../services/sensor-data.service';
import { Device } from '../models/Device.model';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
              const formattedTime = this.formatTimestamp(sensorData.timestamp);
              const updatedDevice: Device = {
                ...device,
                latestTemp: sensorData.temperature?.toString() || '0',
                latestCo2: sensorData.cO2?.toString() || '0',
                humidity: sensorData.humidity?.toString() || '0',
                time: formattedTime || '0',
                chartData: JSON.stringify(sensorData)
              };
              this.devices.push(updatedDevice);
            });
          });
        });

        Promise.all(deviceRequests).then(() => {
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

        const maxTemp = 50;
        const value = temp

        const semiRingOptions = {
          responsive: true,
          cutout: '70%',
          rotation: -90,
          circumference: 180,
          plugins: {
            legend: { display: false }
          }
        };

        new Chart('tempPieChart' + index, {
          type: 'doughnut',
          data: {
            labels: ['Safe', 'Warning', 'Danger'],
            datasets: [{
              data: [35, 10, 5], // Green (0–20), Yellow (20–30), Red (30–40)
              backgroundColor: ['#32CD32', '#FFD700', '#FF0000'], // Green, Yellow, Red
              borderWidth: 0.5,
            }]
          },
          options: {
            responsive: true,
            cutout: '70%',
            rotation: -90,
            circumference: 180,
            plugins: {
              legend: { display: false },
            }
          },
          plugins: [arrowPluginFactory(value, maxTemp)]
        });

        const maxCO2 = 1000;
      const co2Value = Math.min(co2, maxCO2);

      new Chart('co2PieChart' + index, {
        type: 'doughnut',
        data: {
          labels: ['Safe', 'Warning', 'Danger'],
          datasets: [{
            data: [650, 200, 150], // green, yellow, red ranges
            backgroundColor: ['#32CD32', '#FFD700', '#FF0000'],
            borderWidth: 0.5
          }]
        },
        options: semiRingOptions,
        plugins: [arrowPluginFactory(co2Value, maxCO2)]
      });


       const maxHumidity = 100;
          const humidityValue = Math.min(humidity, maxHumidity);

          new Chart('humidityPieChart' + index, {
            type: 'doughnut',
            data: {
              labels: ['Safe', 'Warning', 'Danger'],
              datasets: [{
                data: [70, 20, 10], // green, yellow, red ranges
                backgroundColor: ['#32CD32', '#FFD700', '#FF0000'],
                borderWidth: 0.5
              }]
            },
            options: semiRingOptions,
            plugins: [arrowPluginFactory(humidityValue, maxHumidity)]
          });

      });
    }, 0);
  }

  private formatTimestamp(isoString: string): string {
    if (!isoString) return '';

    try {
      const date = new Date(isoString);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const year = date.getUTCFullYear();

      return `${hours}:${minutes} ${month}/${day}/${year}`;
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return isoString;
    }
  }

  logout() {
    localStorage.removeItem('Token');
    this.router.navigate(['/login']);
  }
}

function arrowPluginFactory(value: number, max: number) {
  return {
    id: 'arrowPlugin',
    afterDraw(chart: any) {
      const { ctx, chartArea } = chart;

      const meta = chart.getDatasetMeta(0);
      const arc = meta?.data[0];
      if (!arc) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 1.35;

      const angle = (-1 * Math.PI) + (value / max) * Math.PI;
      const radius = arc.outerRadius * 0.85;

      const tipX = centerX + radius * Math.cos(angle);
      const tipY = centerY + radius * Math.sin(angle);

      const baseWidth = 0.03 * Math.PI;
      const baseLeftX = centerX + 10 * Math.cos(angle - baseWidth);
      const baseLeftY = centerY + 10 * Math.sin(angle - baseWidth);
      const baseRightX = centerX + 10 * Math.cos(angle + baseWidth);
      const baseRightY = centerY + 10 * Math.sin(angle + baseWidth);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(baseLeftX, baseLeftY);
      ctx.lineTo(baseRightX, baseRightY);
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();
    }
  };
}
