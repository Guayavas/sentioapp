import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {}
