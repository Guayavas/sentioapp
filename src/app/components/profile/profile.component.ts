import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, PasswordModule, AvatarModule, ToastModule],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  isEditing = false;

  user = {
      name: 'Usuario Prueba',
      email: 'prueba@udenar.edu.co',
      phone: '',
      studentId: '20241234567',
      program: 'Ingeniería de Sistemas'
  };

  passwords = {
      current: '',
      new: '',
      confirm: ''
  };

  constructor(private messageService: MessageService) {}

  toggleEdit() {
      if (this.isEditing) {
          // Cancel mode
          this.isEditing = false;
          this.passwords = { current: '', new: '', confirm: '' };
      } else {
          this.isEditing = true;
      }
  }

  saveChanges() {
      if (this.passwords.new && this.passwords.new !== this.passwords.confirm) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden' });
          return;
      }

      this.isEditing = false;
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente' });
      this.passwords = { current: '', new: '', confirm: '' };
  }

  getInitials(name: string): string {
      return name.substring(0, 2).toUpperCase();
  }
}
