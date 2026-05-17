import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';

@Component({
  selector: 'app-safe-route',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent],
  templateUrl: './safe-route.component.html',
  styleUrl: './safe-route.component.css'
})
export class SafeRouteComponent {
  destination = '';
  routeChecked = false;

  checkRoute() {
    if (this.destination) {
      this.routeChecked = true;
    }
  }
}
