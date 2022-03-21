import { Injectable } from '@angular/core';
import { FirestoreBaseService } from '../base/firestore-base.service';
import { User } from '../../../shared/models/classes/User';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class FirestoreUserService extends FirestoreBaseService<User> {
    public constructor(firestore: Firestore) {
        super(firestore, User, 'users');
    }
}
