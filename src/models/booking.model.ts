import { User } from "./user.model";
import { Computer } from "./computer.model";

export interface Booking {
  id: number;
  hours: number;
  user: User;
  pc: Computer;
}

export interface BookingResponse {
  data: Booking[];
  page: number;
  size: number;
  totalElements: number;
  totalPages?: number;
}
