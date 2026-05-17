import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';
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

  saveUser(uid: string, userData: any): void {
    push(ref(db, `users/${uid}`), userData);
  }

  getUser(uid: string, callback: (user: any) => void): void {
    onValue(ref(db, `users/${uid}`), (snapshot) => {
      callback(snapshot.val());
    });
  }
}
