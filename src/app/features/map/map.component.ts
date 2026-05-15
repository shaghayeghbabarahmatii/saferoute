import { Component } from '@angular/core';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MContainerComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {}
