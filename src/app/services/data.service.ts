import { Injectable, signal } from '@angular/core';
import { Pregunta, Respuesta } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Mock Data
  private mockQuestions: Pregunta[] = [
    {
      id: 1,
      text: '¿Cómo describes tu relación con tu familia y cómo te sientes en tu entorno familiar?',
      category: 'Familiar',
      status: 'approved',
      responses: [
        { id: 1, response: 'Tengo una buena relación con mi familia, nos comunicamos regularmente', category: 'Familiar', date: '2024-12-15', personId: 'EST001', sede: 'CENTRO', ciudad: 'Pasto', genero: 'Femenino' },
        { id: 2, response: 'A veces hay conflictos pero en general nos apoyamos mutuamente', category: 'Familiar', date: '2024-12-14', personId: 'EST002', sede: 'VIPRI', ciudad: 'Pasto', genero: 'Masculino' },
        { id: 3, response: 'Me siento cómodo y seguro en mi hogar', category: 'Familiar', date: '2024-12-13', personId: 'EST003', sede: 'FACARTES', ciudad: 'Pasto', genero: 'Femenino' }
      ]
    },
    {
      id: 2,
      text: '¿Cómo te sientes con respecto a tu rendimiento académico?',
      category: 'Académica',
      status: 'approved',
      responses: [
        { id: 4, response: 'Me siento satisfecho con mi progreso', category: 'Académica', date: '2024-12-15', personId: 'EST001', sede: 'CENTRO', ciudad: 'Pasto', genero: 'Femenino' },
        { id: 5, response: 'A veces me estreso con los exámenes', category: 'Académica', date: '2024-12-14', personId: 'EST002', sede: 'VIPRI', ciudad: 'Pasto', genero: 'Masculino' }
      ]
    }
  ];

  private mockPendingQuestions: Pregunta[] = [];

  // Signals
  preguntas = signal<Pregunta[]>(this.mockQuestions);
  preguntasPendientes = signal<Pregunta[]>(this.mockPendingQuestions);

  categories = signal<string[]>([
    'Familiar',
    'Académica',
    'Autoestima',
    'Relaciones Amorosas',
    'Factores de Riesgo',
    'Revisión',
    'Económica',
    'Salud Física'
  ]);

  constructor() { }

  getPreguntas() {
    return this.preguntas();
  }

  // Simulates uploading a file and parsing it
  uploadFile(file: File) {
    // Mock processing logic
    const newQuestion: Pregunta = {
      id: Date.now(),
      text: `Pregunta extraída del archivo ${file.name}`,
      category: 'Revisión',
      status: 'pending',
      responses: [
        {
          id: Date.now() + 1,
          response: 'Respuesta simulada 1 del archivo',
          category: 'Revisión',
          date: new Date().toISOString().split('T')[0],
          sede: 'CENTRO',
          ciudad: 'Pasto',
          genero: 'Femenino',
          source: 'file',
          fileName: file.name
        },
        {
          id: Date.now() + 2,
          response: 'Respuesta simulada 2 del archivo',
          category: 'Revisión',
          date: new Date().toISOString().split('T')[0],
          sede: 'VIPRI',
          ciudad: 'Pasto',
          genero: 'Masculino',
          source: 'file',
          fileName: file.name
        }
      ]
    };

    this.preguntasPendientes.update(current => [...current, newQuestion]);
  }

  updateResponse(questionId: number, updatedResponse: Respuesta) {
    // Search in active questions
    this.preguntas.update(questions =>
      questions.map(q => {
        if (q.id === questionId) {
            return {
                ...q,
                responses: q.responses.map(r => r.id === updatedResponse.id ? updatedResponse : r)
            }
        }
        return q;
      })
    );

    // Search in pending questions
    this.preguntasPendientes.update(questions =>
        questions.map(q => {
            // Find if the response belongs to this question (simplified logic as we pass questionId)
             // Check if response is in this question
             const exists = q.responses.some(r => r.id === updatedResponse.id);
             if (exists) {
                return {
                    ...q,
                    responses: q.responses.map(r => r.id === updatedResponse.id ? updatedResponse : r)
                }
             }
             return q;
        })
      );
  }

  movePendingToActive(questionId: number) {
      const pending = this.preguntasPendientes().find(q => q.id === questionId);
      if (pending) {
          pending.status = 'approved';
          this.preguntas.update(curr => [...curr, pending]);
          this.preguntasPendientes.update(curr => curr.filter(q => q.id !== questionId));
      }
  }
}
