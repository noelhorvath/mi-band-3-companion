import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {GoogleAuthProvider, User} from "firebase/auth";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isUserLoggedInSubject: BehaviorSubject<boolean>;
  constructor(
    private auth: AngularFireAuth
  ) { }

  public logout(): Promise<void> {
    return this.auth.signOut();
  }

  public login(email: string, password: string): Promise<any> {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  public register(email: string, password: string): Promise<any> {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  public loginWithProvider(provider): Promise<any> {
    return this.auth.signInWithPopup(provider);
  }

  public loginWithGoogle(): Promise<any> {
    return this.loginWithProvider(new GoogleAuthProvider());
  }

  public sendPasswordResetEmail(email: string): Promise<any> {
    return this.auth.sendPasswordResetEmail(email);
  }

  public currentUserObservable(): Observable<User> {
    return this.auth.authState;
  }

}
