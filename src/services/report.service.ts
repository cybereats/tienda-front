import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';
import { ReportStats } from '../models/report.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportService extends HTTPService {
    override url = '/api/reports';
}