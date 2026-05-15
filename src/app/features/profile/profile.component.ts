import { Component } from '@angular/core';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MContainerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {}
