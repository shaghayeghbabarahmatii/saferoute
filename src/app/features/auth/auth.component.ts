import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLogin = true;
  name = '';
  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  constructor(private router: Router) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMsg = '';
  }

  submit() {
    this.loading = true;
    this.errorMsg = '';

    const users: any[] = JSON.parse(localStorage.getItem('saferoute_users') || '[]');

    if (this.isLogin) {
      const user = users.find((u: any) =>
        u.email === this.email && u.password === this.password
      );
      if (user) {
        localStorage.setItem('saferoute_auth', 'true');
        localStorage.setItem('saferoute_user', user.name);
        this.router.navigate(['/map']);
      } else {
        this.errorMsg = 'Incorrect email or password.';
      }
    } else {
      if (!this.name || !this.email || !this.password) {
        this.errorMsg = 'Please fill in all fields.';
        this.loading = false;
        return;
      }
      const exists = users.find((u: any) => u.email === this.email);
      if (exists) {
        this.errorMsg = 'An account with this email already exists.';
        this.loading = false;
        return;
      }
      users.push({ name: this.name, email: this.email, password: this.password });
      localStorage.setItem('saferoute_users', JSON.stringify(users));
      localStorage.setItem('saferoute_auth', 'true');
      localStorage.setItem('saferoute_user', this.name);
      this.router.navigate(['/map']);
    }
    this.loading = false;
  }
}
