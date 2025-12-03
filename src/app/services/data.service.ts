import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Question, Response, PreviewResponse } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:5000/api';

  // Señales (Signals)
  questions = signal<Question[]>([]);
  currentResponses = signal<Response[]>([]);

  constructor(private http: HttpClient) { }

  // 1. Obtener Lista de Preguntas para la Barra Lateral
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/data/questions`).pipe(
      tap(data => this.questions.set(data))
    );
  }

  // 2. Obtener Respuestas para el Área Principal
  getResponses(questionId: number): Observable<Response[]> {
    return this.http.get<Response[]>(`${this.apiUrl}/data/responses/${questionId}`).pipe(
      tap(data => this.currentResponses.set(data))
    );
  }

  // 3. Previsualizar Archivo Excel
  previewFile(file: File): Observable<PreviewResponse[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PreviewResponse[]>(`${this.apiUrl}/import/preview`, formData);
  }

  // 4. Confirmar Importación
  confirmImport(responses: PreviewResponse[], fileName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/import/confirm`, { responses, originalFileName: fileName });
  }

  // 5. Eliminar Respuesta
  deleteResponse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/data/responses/${id}`).pipe(
      tap(() => {
        this.currentResponses.update(list => list.filter(r => r.id !== id));
      })
    );
  }

  // 6. Eliminar Pregunta
  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/data/questions/${id}`).pipe(
      tap(() => {
        this.questions.update(list => list.filter(q => q.id !== id));
        // También limpiar las respuestas actuales si la pregunta eliminada estaba seleccionada
        this.currentResponses.set([]);
      })
    );
  }
}
