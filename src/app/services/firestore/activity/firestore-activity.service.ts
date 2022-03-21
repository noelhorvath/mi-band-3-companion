import { Injectable } from '@angular/core';
import { FirestoreBaseService } from '../base/firestore-base.service';
import { Activity } from '../../../shared/models/classes/Activity';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class FirestoreActivityService extends FirestoreBaseService<Activity> {
    public constructor(
        firestore: Firestore,
        private authService: FirebaseAuthService)
    {
        super(firestore, Activity);
        this.authService.authUserSubject.subscribe( (user: User | undefined) => {
            if (user !== undefined) {
                this.collectionPath = `userData/${ user.uid }/activityData`;
            }
        });
    }
}
