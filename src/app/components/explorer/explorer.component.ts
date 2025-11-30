import { Component, inject, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Pregunta, Respuesta } from '../../models/data.models';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ChipModule,
    TagModule,
    AutoCompleteModule,
    BadgeModule
  ],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.css'
})
export class ExplorerComponent {
  dataService = inject(DataService);

  // Señales para el estado
  preguntas = this.dataService.preguntas;
  categories = this.dataService.categories;

  // Filtros
  selectedQuestion: Pregunta | null = null;
  filteredQuestions: Pregunta[] = []; // Para autocompletar

  selectedSede: string | null = null;
  sedes = ['CENTRO', 'VIPRI', 'FACARTES', 'TOROBAJO', 'OTRO'];

  selectedGenero: string | null = null;
  generos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];

  activeCategory: string = 'Familiar';

  // Respuestas filtradas calculadas (Computed)
  responses = computed(() => {
    if (!this.selectedQuestion) return [];

    return this.selectedQuestion.responses.filter(r => {
        const categoryMatch = r.category === this.activeCategory;
        const sedeMatch = !this.selectedSede || r.sede === this.selectedSede;
        const generoMatch = !this.selectedGenero || r.genero === this.selectedGenero;

        return categoryMatch && sedeMatch && generoMatch;
    });
  });

  constructor() {
      // Seleccionar la primera pregunta por defecto si está disponible
      if (this.preguntas().length > 0) {
          this.selectedQuestion = this.preguntas()[0];
      }
  }

  filterQuestions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredQuestions = this.preguntas().filter(q => q.text.toLowerCase().includes(query));
  }

  setActiveCategory(cat: string) {
      this.activeCategory = cat;
  }

  getCategoryCount(cat: string): number {
      if (!this.selectedQuestion) return 0;
      return this.selectedQuestion.responses.filter(r => r.category === cat).length;
  }

  getSeverity(category: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
      switch(category) {
          case 'Familiar': return 'success';
          case 'Académica': return 'info';
          case 'Factores de Riesgo': return 'danger';
          case 'Autoestima': return 'warn';
          default: return 'secondary';
      }
  }
}
