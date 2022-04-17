import { Injectable } from '@angular/core';
import { FirestoreBaseService } from '../../base/firestore-base.service';
import { ActivityInfo } from '../../../../shared/models/classes/ActivityInfo';
import { Firestore } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { FirebaseAuthService } from '../../../firebase/auth/firebase-auth.service';

@Injectable({
    providedIn: 'root'
})
export class FirestoreActivityInfoService extends FirestoreBaseService<ActivityInfo> {

    public constructor(
        firestore: Firestore,
        private authService: FirebaseAuthService
    ) {
        super(firestore, ActivityInfo, ActivityInfo.getFirestoreConverter());
        this.authService.authUserSubject.subscribe((user: User | undefined) => {
            if (user !== undefined) {
                this.collectionPath = `userData/${ user.uid }/activityInfo`;
            }
        });
    }
}
