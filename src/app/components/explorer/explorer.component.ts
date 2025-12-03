import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Question, Response } from '../../models/data.models';

// PrimeNG Modules
import { ListboxModule } from 'primeng/listbox';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListboxModule,
    TabViewModule,
    TableModule,
    CardModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.css'
})
export class ExplorerComponent implements OnInit {
  dataService = inject(DataService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  // Data
  questions = this.dataService.questions;
  selectedQuestion: Question | null = null;
  responses = this.dataService.currentResponses;

  // Search Filter
  filterText = signal('');

  // Computed: Group responses by Category for Tabs
  groupedResponses = computed(() => {
    const current = this.responses();
    if (!current.length) return [];

    // Group by categoryName
    const groups = current.reduce((acc, resp) => {
      const cat = resp.categoryName || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(resp);
      return acc;
      }, {} as Record<string, Response[]>);

    return Object.keys(groups).map(key => ({
      category: key,
      items: groups[key]
    }));
  });

  filteredQuestions = computed(() => {
    const text = this.filterText().toLowerCase();
    return this.questions().filter(q => q.text.toLowerCase().includes(text));
  });

  ngOnInit() {
    this.dataService.getQuestions().subscribe();
  }

  onQuestionSelect(event: any) {
    if (event.value) {
      this.dataService.getResponses(event.value.id).subscribe();
    }
  }

  deleteResponse(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta respuesta?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.dataService.deleteResponse(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Respuesta eliminada correctamente' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la respuesta' });
          }
        });
      }
    });
  }

  deleteQuestion(event: Event, id: number) {
    event.stopPropagation(); // Prevent listbox selection
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta pregunta? Se eliminarán todas las respuestas asociadas.',
      header: 'Eliminar Pregunta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.dataService.deleteQuestion(id).subscribe({
          next: () => {
            this.selectedQuestion = null; // Clear selection
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta eliminada correctamente' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la pregunta' });
          }
        });
      }
    });
  }
}
