import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, MContainerComponent],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css'
})
export class ReportDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private firebaseService = inject(FirebaseService);
  private geminiService = inject(GeminiService);
  private cdr = inject(ChangeDetectorRef);

  report: any = null;
  loading = true;
  aiResult = '';
  aiLoading = false;
  reportId = '';

  ngOnInit() {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';
    this.firebaseService.getReports((reports) => {
      this.report = reports.find(r => r.id === this.reportId) || null;
      this.loading = false;
      this.cdr.detectChanges();
      if (this.report && !this.aiResult) {
        this.classifyHazard();
      }
    });
  }

  async classifyHazard() {
    this.aiLoading = true;
    this.cdr.detectChanges();
    try {
      this.aiResult = await this.geminiService.classifyHazard(
        this.report.category,
        this.report.description
      );
    } catch (e) {
      this.aiResult = 'AI classification unavailable.';
    }
    this.aiLoading = false;
    this.cdr.detectChanges();
  }

  async upvote() {
    if (!this.report) return;
    await this.firebaseService.upvoteReport(this.reportId);
  }

  async dispute() {
    if (!this.report) return;
    await this.firebaseService.disputeReport(this.reportId);
  }

  getTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

  goBack() { this.router.navigate(['/map']); }
}
 