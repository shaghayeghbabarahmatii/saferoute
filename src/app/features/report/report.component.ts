import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { FirebaseService } from '../../services/firebase.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  private cdr = inject(ChangeDetectorRef);
  private firebaseService = inject(FirebaseService);
  private geminiService = inject(GeminiService);

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
  aiResult   = '';
  aiLoading  = false;
  manualLat: number | null = null;
  manualLng: number | null = null;

  photoPreview: string = '';
  photoBase64: string = '';
  photoType: string = '';
  analyzingPhoto: boolean = false;

  onPhotoSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.photoType = file.type;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
      this.photoBase64 = this.photoPreview.split(',')[1];
      this.cdr.detectChanges();
      this.analyzePhoto();
    };
    reader.readAsDataURL(file);
  }

  async analyzePhoto() {
    if (!this.photoBase64) return;
    this.analyzingPhoto = true;
    this.cdr.detectChanges();
    try {
      const result = await this.geminiService.analyzeHazardPhoto(
        this.photoBase64, this.photoType
      );
      this.description = result;
    } catch (e) {
      this.description = '';
    }
    this.analyzingPhoto = false;
    this.cdr.detectChanges();
  }

  removePhoto() {
    this.photoPreview = '';
    this.photoBase64 = '';
    this.photoType = '';
    this.cdr.detectChanges();
  }

  getLocation() {
    if (!navigator.geolocation) {
      this.locationStatus = 'Geolocation not supported.';
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

    if (this.manualLat && this.manualLng) {
      this.coords = { lat: this.manualLat, lng: this.manualLng };
    }

    if (!this.coords) {
      this.errorMsg = 'Please capture your location or enter coordinates manually.';
      return;
    }

    this.submitting = true;
    this.errorMsg   = '';
    this.successMsg = '';
    this.aiResult   = '';
    this.cdr.detectChanges();

    const uid = localStorage.getItem('saferoute_user') || 'anonymous';
    const savedCategory = this.category;
    const savedDescription = this.description;

    this.firebaseService.saveReport({
      uid,
      category:    savedCategory,
      severity:    this.severity,
      description: savedDescription,
      lat:         this.coords.lat,
      lng:         this.coords.lng,
      timestamp:   Date.now(),
      upvotes:     0,
      disputes:    0,
      verified:    false,
      photoBase64: this.photoBase64 || null,
      photoType:   this.photoType || null
    });

    this.successMsg = '✅ Report submitted! Analyzing with AI...';
    this.aiLoading = true;
    this.submitting = false;
    this.cdr.detectChanges();

    try {
      this.aiResult = await this.geminiService.classifyHazard(
        savedCategory, savedDescription
      );
    } catch (e) {
      this.aiResult = 'AI classification unavailable at this time.';
    }

    this.aiLoading = false;
    this.successMsg = '✅ Report submitted successfully!';
    this.cdr.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 4000));

    this.category     = '';
    this.severity     = '';
    this.description  = '';
    this.coords       = null;
    this.locationStatus = '';
    this.manualLat    = null;
    this.manualLng    = null;
    this.successMsg   = '';
    this.aiResult     = '';
    this.photoPreview = '';
    this.photoBase64  = '';
    this.photoType    = '';
    this.cdr.detectChanges();
  }
} 