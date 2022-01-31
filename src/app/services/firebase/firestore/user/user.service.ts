import { Injectable } from '@angular/core';
import {BaseFirestoreService} from "../base-firestore.service";
import {User} from "../../../../shared/models/classes/User";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseFirestoreService<User>{

  constructor(firestore: AngularFirestore) {
      super(firestore, "Users", User);
  }
}
