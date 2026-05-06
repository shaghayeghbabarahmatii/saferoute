import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Database, ref, push } from '@angular/fire/database';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  private auth = inject(Auth);
  private db   = inject(Database);
  private cdr  = inject(ChangeDetectorRef);

  categories = ['Poorly Lit Street', 'Damaged Infrastructure',
                'Security Concern', 'Environmental Hazard'];
  severities = ['Low', 'Medium', 'High'];

  category    = '';
  severity    = '';
  description = '';

  locationStatus = '';
  coords: { lat: number; lng: number } | null = null;
  submitting = false;
  successMsg = '';
  errorMsg   = '';

  getLocation() {
    if (!navigator.geolocation) {
      this.locationStatus = 'Geolocation not supported by your browser.';
      this.cdr.detectChanges();
      return;
    }
    this.locationStatus = 'Detecting your location...';
    this.cdr.detectChanges();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.locationStatus = `📍 Location captured: ${this.coords.lat.toFixed(5)}, ${this.coords.lng.toFixed(5)}`;
        this.cdr.detectChanges();
      },
      () => {
        this.locationStatus = 'Could not get location. Please allow location access.';
        this.cdr.detectChanges();
      }
    );
  }

  async submitReport() {
    if (!this.category || !this.severity || !this.description) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }
    if (!this.coords) {
      this.errorMsg = 'Please capture your location first.';
      return;
    }

    this.submitting = true;
    this.errorMsg   = '';
    this.successMsg = '';
    this.cdr.detectChanges();

    try {
      const uid = this.auth.currentUser?.uid;
      const report = {
        uid:         uid,
        category:    this.category,
        severity:    this.severity,
        description: this.description,
        lat:         this.coords.lat,
        lng:         this.coords.lng,
        timestamp:   Date.now(),
        upvotes:     0,
        disputes:    0,
        verified:    false
      };

      await push(ref(this.db, 'reports'), report);

      this.successMsg  = '✅ Report submitted successfully!';
      this.category    = '';
      this.severity    = '';
      this.description = '';
      this.coords      = null;
      this.locationStatus = '';
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
      this.errorMsg = 'Failed to submit report. Please try again.';
      this.cdr.detectChanges();
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }
}