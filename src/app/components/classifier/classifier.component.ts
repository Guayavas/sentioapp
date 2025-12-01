import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Pregunta, Respuesta } from '../../models/data.models';

// Módulos de PrimeNG
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-classifier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './classifier.component.html',
  styleUrl: './classifier.component.css'
})
export class ClassifierComponent {
  dataService = inject(DataService);
  messageService = inject(MessageService);

  // Señales
  pendingQuestions = this.dataService.preguntasPendientes;
  categories = this.dataService.categories;

  // Estado del diálogo de edición
  displayEditDialog: boolean = false;
  selectedResponse: Respuesta | null = null;
  selectedQuestionId: number | null = null;

  // Modelo del formulario de edición
  editModel: any = {};

  sedes = ['CENTRO', 'VIPRI', 'FACARTES', 'TOROBAJO', 'OTRO'];
  generos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];

  onUpload(event: any) {
    const file = event.files[0];
    this.dataService.uploadFile(file);
    this.messageService.add({ severity: 'success', summary: 'Archivo Procesado', detail: 'Se han extraído las preguntas correctamente' });
  }

  openEditDialog(response: Respuesta, questionId: number) {
      this.selectedResponse = response;
      this.selectedQuestionId = questionId;
      this.editModel = { ...response }; // Clonar objeto
      this.displayEditDialog = true;
  }

  saveEdit() {
      if (this.selectedQuestionId && this.editModel) {
          const updated: Respuesta = {
              ...this.selectedResponse!,
              ...this.editModel
          };

          this.dataService.updateResponse(this.selectedQuestionId, updated);
          this.displayEditDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'La respuesta ha sido actualizada' });
      }
  }

  approveAll(questionId: number) {
      this.dataService.movePendingToActive(questionId);
      this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Las respuestas han sido incorporadas al banco de datos' });
  }
}
