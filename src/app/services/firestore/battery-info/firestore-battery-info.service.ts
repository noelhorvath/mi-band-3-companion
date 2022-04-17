import { Injectable } from '@angular/core';
import { FirestoreBaseService } from '../base/firestore-base.service';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { User } from '@angular/fire/auth';
import { BatteryInfo } from '../../../shared/models/classes/BatteryInfo';

@Injectable({
    providedIn: 'root'
})
export class FirestoreBatteryInfoService extends FirestoreBaseService<BatteryInfo> {

    public constructor(
        firestore: Firestore,
        private authService: FirebaseAuthService
    ) {
        super(firestore, BatteryInfo, BatteryInfo.getFirestoreConverter());
        this.authService.authUserSubject.subscribe((user: User | undefined) => {
            if (user !== undefined) {
                this.collectionPath = `userData/${ user.uid }/batteryData`;
            }
        });
    }
}
