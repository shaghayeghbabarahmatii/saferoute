import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, update, get } from 'firebase/database';
import { environment } from '../../environments/environments';

const app = initializeApp(environment.firebaseConfig);
const db = getDatabase(app);

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  saveReport(report: any): void {
    push(ref(db, 'reports'), report);
  }

  getReports(callback: (reports: any[]) => void): void {
    onValue(ref(db, 'reports'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reports = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        callback(reports);
      } else {
        callback([]);
      }
    });
  }

  async upvoteReport(id: string): Promise<void> {
    const reportRef = ref(db, `reports/${id}`);
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const newUpvotes = (data.upvotes || 0) + 1;
      const verified = newUpvotes >= 3;
      await update(reportRef, { upvotes: newUpvotes, verified });
    }
  }

  async disputeReport(id: string): Promise<void> {
    const reportRef = ref(db, `reports/${id}`);
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      await update(reportRef, { disputes: (data.disputes || 0) + 1 });
    }
  }

  saveUser(uid: string, userData: any): void {
    push(ref(db, `users/${uid}`), userData);
  }

  getUser(uid: string, callback: (user: any) => void): void {
    onValue(ref(db, `users/${uid}`), (snapshot) => {
      callback(snapshot.val());
    });
  }
}
