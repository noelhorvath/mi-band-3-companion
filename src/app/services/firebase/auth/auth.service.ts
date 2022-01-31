import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {BehaviorSubject, Observable} from "rxjs";
import {take} from "rxjs/operators";
import {updateEmail} from "@angular/fire/auth";
import {User as AuthUser}  from "firebase/auth";
import {User} from "../../../shared/models/classes/User";
import {UserService} from "../firestore/user/user.service";

@Injectable({ providedIn: 'root' })

export class AuthService {
    // for firebase errors
    private readonly USER_NOT_FOUND_KEY = 'USER_NOT_FOUND';
    private readonly WRONG_PASSWORD_KEY = 'WRONG_PASSWORD';
    private readonly USER_IS_DISABLED_KEY = 'USER_IS_DISABLED';
    private readonly INVALID_EMAIL_KEY = 'INVALID_EMAIL';
    private readonly WEAK_PASSWORD_KEY = 'WEAK_PASSWORD';
    private readonly EMAIL_ALREADY_IN_USE_KEY = 'EMAIL_ALREADY_IN_USE';
    private readonly NETWORK_REQUEST_FAILED_KEY: 'NETWORK_REQUEST_FAILED';
    private readonly INTERNAL_ERROR_KEY: 'INTERNAL_ERROR';
    // for non-firebase errors
    private readonly UNVERIFIED_EMAIL_KEY = 'UNVERIFIED_EMAIL';
    private _authUser: AuthUser;
    public authUserSubject: BehaviorSubject<AuthUser>;
    public isServiceInitializedSubject: BehaviorSubject<boolean>;

    constructor(
        private auth: AngularFireAuth,
        private userService: UserService,
    ) {
        this.isServiceInitializedSubject = new BehaviorSubject<boolean>(false);
        this.auth.onAuthStateChanged(async user => {
            if (!this.authUserSubject) {
                this.authUserSubject = new BehaviorSubject<AuthUser>(user);
                this.isServiceInitializedSubject.next(true);
            }

            this.authUser = user;
            this.authUserSubject.next(user);
            console.log(AuthService.name + " -> User status: " + (!!user ? 'logged in' : 'not logged in'));
        }, error => console.error(AuthService.name + ' -> onAuthStateChanged error: ' + error.message || error))
            .catch(e => console.error(AuthService.name + ' -> onAuthStateChanged error: ' + e));
    }

    public async updateUserEmail(email: string): Promise<void> {
        try {
            await updateEmail(this.authUser, email);
            return await this.userService.updateField(this.authUser.uid, 'email', email,false);
        } catch (error) {
            throw this.getErrorMessage(error) ?? 'UPDATING_EMAIL_FAILED';
        }
    }

    public signOut(): Promise<void> {
        if (!this.auth.user) { return; }
        return this.auth.signOut();
    }

    public async signIn(email: string, password: string): Promise<AuthUser | void> {
        try {
            const userCredentials = await this.auth.signInWithEmailAndPassword(email, password);
            // user must verify email before using the app
            // if email is verified and user uses google account to log in then google account automatically gets linked to email/pass account
            // and both email and google login works fine
            if (!userCredentials.user.emailVerified) {
                await this.auth.signOut();
                return Promise.reject(this.UNVERIFIED_EMAIL_KEY);
            } else {
                return Promise.resolve(userCredentials.user);
            }
        } catch (error) {
            throw this.getErrorMessage(error) ?? 'SIGN_IN_FAILED';
        }
    }

    // register user and create user doc
    public async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.sendEmailVerification();
            await userCredential.user.updateProfile({displayName: firstName + ' ' + lastName});
            await this.auth.signOut();
            return await this.userService.add(new User(userCredential.user.uid, email, firstName, lastName));
        } catch (error) {
            throw this.getErrorMessage(error) ?? 'REGISTRATION_FAILED';
        }
    }

    public async sendPasswordResetEmail(email: string): Promise<any> {
        try {
            return await this.auth.sendPasswordResetEmail(email);
        } catch (error) {
            throw this.getErrorMessage(error) ?? 'SENDING_PASSWORD_RESET_EMAIL_FAILED';
        }
    }

    public getAuthUser(): Observable<AuthUser> {
        return this.auth.authState.pipe(take(1));
    }

    public get authUser() {
        return this._authUser;
    }

    private set authUser(authUser: AuthUser) {
        this._authUser = authUser;
    }

    private getErrorMessage(error: any): string | null {
        if (error && error.code) {
            switch (error.code) {
                case 'auth/wrong-password':
                    return this.WRONG_PASSWORD_KEY;
                case 'auth/user-disabled':
                    return this.USER_IS_DISABLED_KEY;
                case 'auth/user-not-found':
                    return this.USER_NOT_FOUND_KEY;
                case 'auth/email-already-in-use':
                    return this.EMAIL_ALREADY_IN_USE_KEY;
                case 'auth/network-request-failed':
                    return this.NETWORK_REQUEST_FAILED_KEY;
                case 'auth/internal-error':
                    return this.INTERNAL_ERROR_KEY;
                case 'auth/weak-password':
                    return this.WEAK_PASSWORD_KEY;
                case 'auth/invalid-email':
                    return this.INVALID_EMAIL_KEY;
                default:
                    return null;
            }
        }
    }

}
