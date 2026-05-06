import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, AuthError } from '@angular/fire/auth';
import { Database, ref, set } from '@angular/fire/database';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  private auth = inject(Auth);
  private db   = inject(Database);
  private router = inject(Router);

  isLogin = true;
  name = '';
  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMsg = '';
  }

  async submit() {
    this.loading = true;
    this.errorMsg = '';
    try {
      if (this.isLogin) {
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
      } else {
        const cred = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        await set(ref(this.db, `users/${cred.user.uid}`), {
          name: this.name,
          email: this.email,
          reportsSubmitted: 0,
          safetyScore: 0,
          verifiedReports: 0,
          createdAt: Date.now()
        });
      }
      this.router.navigate(['/home']);
    } catch (e) {
      const err = e as AuthError;
      this.errorMsg = err.message.replace('Firebase: ', '').replace(/ \(auth.*\)\.?/, '');
    } finally {
      this.loading = false;
    }
  }
}