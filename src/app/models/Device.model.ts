export interface Device {
    id: string;
    username?: string;
    deviceId: string;
    chartData?: string;
    latestTemp:string;
    latestCo2?:string;
    humidity?:string;
    title:string;
    time?:string;
  }