import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from './../services/auth.service';
import { SensorDataService } from '../services/sensor-data.service';
import { Device } from '../models/Device.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // <-- Add this
import { DeviceService } from '../services/device.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChartModule,
    DialogModule,
    ToolbarModule,
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
  username = '';  loading = false;

  constructor(
    public authService: AuthService,
    private sensorService: SensorDataService,
    private router: Router,
    private deviceService:DeviceService
  ) {}

  ngOnInit(): void {
    // Load user's devices
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
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  navigateToDevice(deviceId: string) {
    this.router.navigate(['/device', deviceId]);
  }
}