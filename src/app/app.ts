import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private auth = inject(Auth);
  showNav = false;

  constructor() {
    authState(this.auth).subscribe(user => this.showNav = !!user);
  }
}