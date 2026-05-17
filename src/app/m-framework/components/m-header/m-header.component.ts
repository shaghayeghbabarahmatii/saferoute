import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'm-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './m-header.component.html',
  styleUrl: './m-header.component.css'
})
export class MHeaderComponent {
  @Input() title: string;
  @Input() homename: string;
  private featureList: string[];
  currentPath = '';

  constructor(private router: Router) {
    this.title = "";
    this.featureList = [];
    this.homename = "Map";
    this.currentPath = this.router.url.replace('/', '');
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.urlAfterRedirects.replace('/', '');
      }
    });
  }

  @Input()
  set features(value: string[]) {
    this.featureList = value;
  }

  get features(): string[] {
    return this.featureList;
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  logout() {
    localStorage.removeItem('saferoute_auth');
    localStorage.removeItem('saferoute_user');
    this.router.navigate(['/home']);
  }
}
