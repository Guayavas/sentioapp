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

  /**
   * Obtiene la lista completa de preguntas desde el servidor y actualiza la señal 'questions'.
   * @returns Observable con el array de preguntas.
   */
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/data/questions`).pipe(
      tap(data => this.questions.set(data))
    );
  }

  /**
   * Carga las respuestas asociadas a una pregunta específica y actualiza la señal 'currentResponses'.
   * @param questionId ID de la pregunta.
   * @returns Observable con el array de respuestas detalladas.
   */
  getResponses(questionId: number): Observable<Response[]> {
    return this.http.get<Response[]>(`${this.apiUrl}/data/responses/${questionId}`).pipe(
      tap(data => this.currentResponses.set(data))
    );
  }

  /**
   * Envía un archivo Excel al servidor para ser procesado y previsualizado sin guardar.
   * @param file Archivo Excel seleccionado por el usuario.
   * @returns Observable con la lista de respuestas previsualizadas.
   */
  previewFile(file: File): Observable<PreviewResponse[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PreviewResponse[]>(`${this.apiUrl}/import/preview`, formData);
  }

  /**
   * Confirma y guarda permanentemente los datos importados en la base de datos.
   * @param responses Lista de respuestas validadas.
   * @param fileName Nombre del archivo original para registro.
   */
  confirmImport(responses: PreviewResponse[], fileName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/import/confirm`, { responses, originalFileName: fileName });
  }

  /**
   * Elimina una respuesta individual y actualiza la lista local.
   * @param id ID de la respuesta a eliminar.
   */
  deleteResponse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/data/responses/${id}`).pipe(
      tap(() => {
        this.currentResponses.update(list => list.filter(r => r.id !== id));
      })
    );
  }

  /**
   * Elimina una pregunta completa y todas sus respuestas asociadas.
   * @param id ID de la pregunta a eliminar.
   */
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
