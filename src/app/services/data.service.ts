import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HierarchyNode, Response } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:5000/api';

  // Signals for state management
  hierarchy = signal<HierarchyNode[]>([]);
  currentResponses = signal<Response[]>([]);

  constructor(private http: HttpClient) { }

  getHierarchy(): Observable<HierarchyNode[]> {
    return this.http.get<HierarchyNode[]>(`${this.apiUrl}/data/hierarchy`).pipe(
      tap(data => this.hierarchy.set(data))
    );
  }

  getResponses(questionId: number): Observable<Response[]> {
    return this.http.get<Response[]>(`${this.apiUrl}/data/responses/${questionId}`).pipe(
      tap(data => this.currentResponses.set(data))
    );
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import/upload`, formData);
  }
}
