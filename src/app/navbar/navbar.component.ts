import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  logout() {
    signOut(this.auth).then(() => this.router.navigate(['/auth']));
  }
}