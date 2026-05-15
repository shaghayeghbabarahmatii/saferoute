import { Component } from '@angular/core';
import { MContainerComponent } from '../m-framework/components/m-container/m-container.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
