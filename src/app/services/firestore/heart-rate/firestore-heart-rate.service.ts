import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreBaseService } from '../base/firestore-base.service';
import { HeartRate } from '../../../shared/models/classes/HeartRate';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class FirestoreHeartRateService extends FirestoreBaseService<HeartRate> {

    public constructor(
        firestore: Firestore,
        private authService: FirebaseAuthService
    ) {
        super(firestore, HeartRate, HeartRate.getFirestoreConverter());
        this.authService.authUserSubject.subscribe((user: User | undefined) => {
            if (user !== undefined) {
                this.collectionPath = `userData/${ user.uid }/heartRateData`;
            }
        });
    }
}
