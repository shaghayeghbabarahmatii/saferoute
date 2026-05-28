import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MContainerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  userName: string = '';
  userEmail: string = '';
  reportsSubmitted: number = 0;
  verifiedReports: number = 0;
  safetyScore: number = 0;
  leaderboard: any[] = [];

  ngOnInit() {
    this.userName = localStorage.getItem('saferoute_user') || 'Unknown User';
    const users: any[] = JSON.parse(localStorage.getItem('saferoute_users') || '[]');
    const user = users.find((u: any) => u.name === this.userName);
    this.userEmail = user ? user.email : '';

    this.firebaseService.getReports((reports) => {
      // Count current user's reports
      const myReports = reports.filter(r => r.uid === this.userName);
      this.reportsSubmitted = myReports.length;
      this.verifiedReports = myReports.filter(r => r.verified).length;
      this.safetyScore = myReports.reduce((score, r) => {
        const points = r.severity === 'High' ? 15 : r.severity === 'Medium' ? 10 : 5;
        return score + points + (r.upvotes || 0) * 2;
      }, 0);

      // Build leaderboard from all users
      const userScores: { [key: string]: number } = {};
      reports.forEach(r => {
        if (!r.uid) return;
        const points = r.severity === 'High' ? 15 : r.severity === 'Medium' ? 10 : 5;
        userScores[r.uid] = (userScores[r.uid] || 0) + points + (r.upvotes || 0) * 2;
      });

      this.leaderboard = Object.keys(userScores)
        .map(uid => ({ name: uid, score: userScores[uid] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      this.cdr.detectChanges();
    });
  }
}
