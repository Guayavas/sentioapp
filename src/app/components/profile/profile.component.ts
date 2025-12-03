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
import { AuthService } from '../../services/auth.service';

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
      fullName: '',
      username: '',
      identifier: '',
      role: ''
  };

  passwords = {
      current: '',
      new: '',
      confirm: ''
  };

  constructor(private messageService: MessageService, private authService: AuthService) {}

  ngOnInit() {
      this.loadProfile();
  }

  loadProfile() {
      this.authService.getProfile().subscribe({
          next: (data) => {
              this.user = data;
          },
          error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el perfil' });
          }
      });
  }

  toggleEdit() {
      if (this.isEditing) {
          // Modo cancelar
          this.isEditing = false;
          this.passwords = { current: '', new: '', confirm: '' };
          this.loadProfile(); // Resetear cambios
      } else {
          this.isEditing = true;
      }
  }

  saveChanges() {
      if (this.passwords.new && this.passwords.new !== this.passwords.confirm) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden' });
          return;
      }

      const updateData = {
          fullName: this.user.fullName,
          identifier: this.user.identifier,
          currentPassword: this.passwords.current,
          newPassword: this.passwords.new
      };

      this.authService.updateProfile(updateData).subscribe({
          next: () => {
              this.isEditing = false;
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente' });
              this.passwords = { current: '', new: '', confirm: '' };
          },
          error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Error al actualizar perfil' });
          }
      });
  }

  getInitials(name: string): string {
      return name ? name.substring(0, 2).toUpperCase() : 'US';
  }
}
