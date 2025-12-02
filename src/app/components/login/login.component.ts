import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, ToastModule, MessageModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  loginError = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  login() {
    this.loginError = false;
    if (this.username && this.password) {
      this.loading = true;
      this.authService.login(this.username, this.password).subscribe({
        next: () => {
          this.router.navigate(['/app/home']);
        },
        error: (err) => {
          this.loading = false;
          this.loginError = true;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Credenciales inválidas o error de servidor' });
        }
      });
    }
  }
}
