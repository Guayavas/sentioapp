import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { LayoutComponent } from '../layout/layout.component';
import { HeaderComponent } from '../layout/header/header.component'; // Will create this later
import { FooterComponent } from '../layout/footer/footer.component'; // Will create this later

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  login() {
    if (this.username && this.password) {
      // Mock login - in real app use AuthService
      localStorage.setItem('user', this.username);
      this.router.navigate(['/app/home']);
    }
  }
}
