import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MHeaderComponent } from './m-framework/components/m-header/m-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'SafeRoute';
}
