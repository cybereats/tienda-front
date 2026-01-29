import { User } from "./user.model";
import { Computer } from "./computer.model";

export interface Booking {
  id: number;
  hours: number;
  user: User;
  pc: Computer;
  createdAt?: string;
}

export interface BookingResponse {
  data: Booking[];
  page: number;
  size: number;
  totalElements: number;
  totalPages?: number;
}

export interface PCStats {
  cpuUsage: number;
  ramUsage: number;
  ramTotal: number;
  gpuUsage: number;
  gpuTemp: number;
  diskUsage: number;
  networkUp: number;
  networkDown: number;
  uptime: string;
  activeProcesses: number;
}
