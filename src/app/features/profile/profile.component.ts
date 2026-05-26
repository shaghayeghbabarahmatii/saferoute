import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MContainerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';

  ngOnInit() {
    this.userName = localStorage.getItem('saferoute_user') || 'Unknown User';
    const users: any[] = JSON.parse(localStorage.getItem('saferoute_users') || '[]');
    const user = users.find((u: any) => u.name === this.userName);
    this.userEmail = user ? user.email : '';
  }
}