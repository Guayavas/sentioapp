import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../../../services/data.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ToastModule,
    FileUploadModule,
    DialogModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  dataService = inject(DataService);
  messageService = inject(MessageService);

  showUploadDialog = false;

  openUpload() {
    this.showUploadDialog = true;
  }

  onUpload(event: any) {
    const file = event.files[0];
    this.dataService.uploadFile(file).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Éxito', detail: 'Archivo importado correctamente'});
        this.showUploadDialog = false;
        // Optionally refresh data
      },
      error: (err) => {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Falló la importación'});
      }
    });
  }
}
