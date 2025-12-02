import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DataService } from '../../services/data.service';
import { PreviewResponse } from '../../models/data.models';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-classifier',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, FileUploadModule, TableModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './classifier.component.html',
  styleUrl: './classifier.component.css'
})
export class ClassifierComponent {
  dataService = inject(DataService);
  messageService = inject(MessageService);

  previewData: PreviewResponse[] = [];
  originalFileName: string = '';
  isUploading = false;

  onUpload(event: any) {
    const file = event.files[0];
    this.originalFileName = file.name;
    this.isUploading = true;

    this.dataService.previewFile(file).subscribe({
      next: (data) => {
        this.previewData = data;
        this.isUploading = false;
        this.messageService.add({ severity: 'info', summary: 'Vista Previa', detail: 'Revisa los datos antes de aprobar.' });
      },
      error: (err) => {
        this.isUploading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo leer el archivo.' });
      }
    });
  }

  discard() {
    this.previewData = [];
    this.originalFileName = '';
  }

  approve() {
    if (this.previewData.length === 0) return;

    this.isUploading = true;
    this.dataService.confirmImport(this.previewData, this.originalFileName).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Datos importados correctamente.' });
        this.discard();
        this.isUploading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló el guardado.' });
        this.isUploading = false;
      }
    });
  }
}
