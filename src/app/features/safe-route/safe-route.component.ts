import { Component, inject, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { GoogleMap, MapMarker, MapPolyline, MapInfoWindow } from '@angular/google-maps';
import { FirebaseService } from '../../services/firebase.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-safe-route',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent, GoogleMap, MapMarker, MapPolyline, MapInfoWindow],
  templateUrl: './safe-route.component.html',
  styleUrl: './safe-route.component.css'
})
export class SafeRouteComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private firebaseService = inject(FirebaseService);
  private geminiService = inject(GeminiService);

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  destination = '';
  locationStatus = '';
  routeChecked = false;
  checking = false;
  hazards: any[] = [];
  aiAdvisory = '';
  aiLoading = false;
  allReports: any[] = [];
  routePath: google.maps.LatLngLiteral[] = [];
  selectedHazard: any = null;

  center: google.maps.LatLngLiteral = { lat: 24.4539, lng: 54.3773 };
  zoom = 11;
  mapOptions: google.maps.MapOptions = { mapTypeId: 'roadmap' };
  userLocation: google.maps.LatLngLiteral | null = null;

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#F97316',
    strokeWeight: 5,
    strokeOpacity: 0.8
  };

  ngOnInit() {
    this.firebaseService.getReports((reports) => {
      this.allReports = reports;
      this.cdr.detectChanges();
    });
    this.detectLocation();
  }

  detectLocation() {
    if (!navigator.geolocation) return;
    this.locationStatus = 'Detecting...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.locationStatus = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        this.cdr.detectChanges();
      },
      () => { this.locationStatus = 'Could not detect location.'; }
    );
  }

  getRoutePoints(): Promise<google.maps.LatLngLiteral[]> {
    return new Promise((resolve) => {
      if (!this.userLocation) { resolve([]); return; }
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng),
        destination: this.destination,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result) {
          const path = result.routes[0].overview_path;
          resolve(path.map(p => ({ lat: p.lat(), lng: p.lng() })));
        } else {
          resolve([]);
        }
      });
    });
  }

  getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  isNearRoute(report: any, routePoints: google.maps.LatLngLiteral[]): boolean {
    return routePoints.some(point =>
      this.getDistanceKm(report.lat, report.lng, point.lat, point.lng) <= 0.5
    );
  }

  async checkRoute() {
    if (!this.destination || !this.userLocation) return;
    this.checking = true;
    this.hazards = [];
    this.aiAdvisory = '';
    this.routeChecked = false;
    this.routePath = [];
    this.cdr.detectChanges();

    const routePoints = await this.getRoutePoints();
    this.routePath = routePoints;

    if (routePoints.length > 0) {
      this.hazards = this.allReports.filter(r => this.isNearRoute(r, routePoints));
      this.center = routePoints[Math.floor(routePoints.length / 2)];
      this.zoom = 11;
    } else {
      this.hazards = this.allReports.filter(r => r.severity === 'High');
      this.center = { ...this.userLocation };
    }

    this.routeChecked = true;
    this.checking = false;
    this.cdr.detectChanges();

    this.aiLoading = true;
    this.cdr.detectChanges();
    const hazardList = this.hazards.length > 0
      ? this.hazards.map(h => `${h.category}: ${h.description}`)
      : ['No hazards detected'];
    try {
      this.aiAdvisory = await this.geminiService.safeRouteAdvisory(
        this.destination, hazardList
      );
    } catch (e) {
      this.aiAdvisory = 'AI advisory unavailable at this time.';
    }
    this.aiLoading = false;
    this.cdr.detectChanges();
  }

  openInfoWindow(marker: MapMarker, hazard: any) {
    this.selectedHazard = hazard;
    this.cdr.detectChanges();
    this.infoWindow.open(marker);
  }

  openOriginalRoute() {
    const origin = this.userLocation ? `${this.userLocation.lat},${this.userLocation.lng}` : '';
    window.open(`https://www.google.com/maps/dir/${origin}/${encodeURIComponent(this.destination)}`, '_blank');
  }

  openAlternateRoute() {
    const origin = this.userLocation ? `${this.userLocation.lat},${this.userLocation.lng}` : '';
    window.open(`https://www.google.com/maps/dir/${origin}/${encodeURIComponent(this.destination)}/data=!4m2!4m1!3e2`, '_blank');
  }

  getMarkerOptions(severity: string): google.maps.MarkerOptions {
    const colors: { [key: string]: string } = { 'High': '#EF4444', 'Medium': '#F97316', 'Low': '#22C55E' };
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: colors[severity] || 'blue',
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2,
      }
    };
  }
}
