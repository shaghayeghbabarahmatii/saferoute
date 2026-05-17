import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, MContainerComponent],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css'
})
export class ReportDetailComponent {
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/map']); }
}
