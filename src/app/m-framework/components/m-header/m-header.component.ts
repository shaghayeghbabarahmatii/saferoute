import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {
    this.title = "";
    this.featureList = [];
    this.homename = "Home";
  }

  @Input()
  set features(value: string[]) {
    this.featureList = value;
  }

  get features(): string[] {
    return this.featureList;
  }

  feature2path(feature: string) {
    return feature.replace(/\s+/g, '').toLowerCase();
  }

  logout() {
    localStorage.removeItem('saferoute_auth');
    localStorage.removeItem('saferoute_user');
    this.router.navigate(['/login']);
  }
}
