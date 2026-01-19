import { Computer } from "./computer.model";
import { User } from "./user.model";

export interface Report {
    id: number;
    priority: string;
    description: string;
    subject: string;
    user: User;
    pc: Computer;
    status: string;
    createdAt: string;
}

export interface ReportResponse {
    data: Report[];
    page: number;
    size: number;
    totalElements: number;
    totalPages?: number; // Optional since backend doesn't return it
}

export interface ReportStats {
    IN_PROGRESS: number;
    RESOLVED: number;
    PENDING: number;
}
