import { Component, OnInit, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap, MapMarker, MContainerComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);

  reports: any[] = [];
  filteredReports: any[] = [];

  filterCategory = '';
  filterSeverity = '';
  filterTime = '';

  categories = ['Poorly Lit Street', 'Damaged Infrastructure', 'Security Concern', 'Environmental Hazard'];
  severities = ['Low', 'Medium', 'High'];

  center: google.maps.LatLngLiteral = { lat: 24.4539, lng: 54.3773 };
  zoom = 12;

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
  };

  ngOnInit() {
    this.firebaseService.getReports((reports) => {
      this.reports = reports;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    let filtered = [...this.reports];

    if (this.filterCategory) {
      filtered = filtered.filter(r => r.category === this.filterCategory);
    }
    if (this.filterSeverity) {
      filtered = filtered.filter(r => r.severity === this.filterSeverity);
    }
    if (this.filterTime) {
      const now = Date.now();
      const ranges: { [key: string]: number } = {
        '24h': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000
      };
      if (ranges[this.filterTime]) {
        filtered = filtered.filter(r => now - r.timestamp < ranges[this.filterTime]);
      }
    }

    this.filteredReports = filtered;
    this.cdr.detectChanges();
  }

  getMarkerOptions(report: any): google.maps.MarkerOptions {
    const colors: { [key: string]: string } = {
      'High': 'red',
      'Medium': 'orange',
      'Low': 'green'
    };
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: colors[report.severity] || 'blue',
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2,
      }
    };
  }

  getTimestamp(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}
