import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FirestoreUserService } from '../../firestore/user/firestore-user.service';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { User } from '../../../shared/models/classes/User';
import {
    Auth,
    UserCredential,
    authState,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User as AuthUser,
    createUserWithEmailAndPassword,
    sendEmailVerification, updateProfile,
    sendPasswordResetEmail,
    AuthError, updateEmail,
} from '@angular/fire/auth';
import { AuthErrorMessages } from '../../../shared/enums/auth-error-messages.enum';
import { LogInfo } from '../../../shared/models/classes/LogInfo';
import { LanguageService } from '../../language/language.service';
import { AuthSecurity } from '../../../shared/models/classes/AuthSecurity';
import { FirestoreAuthSecurityService } from '../../firestore/auth-security/firestore-auth-security.service';
import { DeviceService } from '../../device/device.service';
import { timePassedSinceDate } from '../../../shared/functions/date.functions';
import { AppSettings } from '../../../app.settings';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService {
    private readonly logHelper: LogHelper;
    private authSecurity: AuthSecurity;
    public authUserSubject: BehaviorSubject<AuthUser | undefined>;

    // TODO: delete unverified users after x days

    public constructor(
        // this.authService.authUser
        private userService: FirestoreUserService,
        private languageService: LanguageService,
        private auth: Auth,
        private authSecurityService: FirestoreAuthSecurityService,
        private deviceService: DeviceService
    ) {
        this.logHelper = new LogHelper(FirebaseAuthService.name);
        this.authUserSubject = new BehaviorSubject<AuthUser | undefined>(this.auth.currentUser !== null ? this.auth.currentUser : undefined);
        onAuthStateChanged(this.auth, async (authUser: AuthUser | null) => {
                this.authUserSubject.next(this.auth.currentUser !== null ? this.auth.currentUser : undefined);
                this.logHelper.logDefault('onAuthStateChanged', 'User status', { value: !!authUser ? 'logged in' : 'not logged in' });
        }, (error: unknown) => this.logHelper.logError('onAuthStateChanged', error)
        , () => this.logHelper.logDefault(onAuthStateChanged.name, 'completed'));
        this.languageService.isServiceInitializedSubject.subscribe( (isReady: boolean) => {
           if (isReady) {
               this.languageService.currentLanguageSubject.subscribe( (lang: string) => {
                  this.auth.languageCode = lang;
               });
           }
        });
        // auth security setup
        this.authSecurity = new AuthSecurity();
        this.deviceService.getUUID().then( (uuid: string) => {
            this.authSecurityService.list({ fieldPath: 'uuid', opStr: '==', value: uuid })
                .subscribe({
                    next: async (authSecurity: AuthSecurity[] | undefined) => {
                        this.logHelper.logDefault(FirebaseAuthService.name, 'authSecurity data changed', { value: authSecurity });
                        if (authSecurity === undefined || authSecurity.length < 1) {
                            this.authSecurity.uuid = uuid;
                            try {
                                await this.authSecurityService.add(this.authSecurity);
                            } catch (e: unknown) {
                               this.logHelper.logError(FirebaseAuthService.name, 'add AuthSecurity error', { value: e });
                            }
                        } else {
                            this.authSecurity = authSecurity[0];
                        }
                    },
                    error: (error: unknown) => this.logHelper.logError(FirebaseAuthService.name, 'get AuthSecurity error', { value: error })
                });
        }).catch((e: unknown) => {
            this.logHelper.logError(FirebaseAuthService.name, 'AuthSecurity setup error', { value: e });
        });
    }

    private static getAuthErrorMessage(error: AuthError): string | undefined {
        if (error.code !== undefined) {
            switch (error.code) {
                case 'auth/wrong-password':
                    return AuthErrorMessages.WRONG_PASSWORD;
                case 'auth/user-disabled':
                    return AuthErrorMessages.USER_IS_DISABLED;
                case 'auth/user-not-found':
                    return AuthErrorMessages.USER_NOT_FOUND;
                case 'auth/email-already-in-use':
                    return AuthErrorMessages.EMAIL_ALREADY_IN_USE;
                case 'auth/network-request-failed':
                    return AuthErrorMessages.NETWORK_REQUEST_FAILED;
                case 'auth/internal-error':
                    return AuthErrorMessages.INTERNAL_ERROR;
                case 'auth/weak-password':
                    return AuthErrorMessages.WEAK_PASSWORD;
                case 'auth/invalid-email':
                    return AuthErrorMessages.INVALID_EMAIL;
                default:
                    LogHelper.log(new LogInfo(FirebaseAuthService.name, error.code, error.message),'error');
                    break;
            }
        }
        return undefined;
    }

    public getAuthUser(): AuthUser | undefined {
        return this.auth.currentUser !== null ? this.auth.currentUser : undefined;
    }

    public async updateUserEmail(email: string): Promise<void> {
        try {
            if (this.auth.currentUser !== null) {
                await updateEmail(this.auth.currentUser, email);
                return await this.userService.updateField({ id: this.auth.currentUser.uid }, 'email', email, false);
            }
            return Promise.reject(AuthErrorMessages.USER_IS_NOT_SIGNED_IN);
        } catch (error: unknown) {
            this.logHelper.logError(this.updateUserEmail.name, 'updateUserEmail error', { value: error });
            return Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? AuthErrorMessages.UPDATING_EMAIL_FAILED);
        }
    }

    public signOut(): Promise<void> {
        return this.auth.currentUser !== null ? signOut(this.auth) : Promise.reject(AuthErrorMessages.USER_IS_NOT_SIGNED_IN);
    }

    public async signIn(email: string, password: string): Promise<AuthUser | undefined> {
        try {
            const userCredentials: UserCredential = await signInWithEmailAndPassword(this.auth ,email, password);
            // user must verify email before using the app
            if (!userCredentials.user.emailVerified) {
                return Promise.reject(AuthErrorMessages.UNVERIFIED_EMAIL);
            } else {
                return Promise.resolve(userCredentials.user);
            }
        } catch (error: unknown) {
            this.logHelper.logError(this.signIn.name, 'signIn error', { value: error });
            return Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? 'SIGN_IN_FAILED');
        }
    }

    public async sendEmailVerification(signOutUser?: boolean): Promise<void> {
        try {
            if (this.auth.currentUser === null) {
                return Promise.reject(AuthErrorMessages.USER_IS_NOT_SIGNED_IN);
            } else {
                if (this.authSecurity.lastEmailVerificationRequestDate === undefined
                    || (timePassedSinceDate(this.authSecurity.lastEmailVerificationRequestDate) > 60 ** 2 * 1000)) {
                    await sendEmailVerification(this.auth.currentUser,
                        {
                            // URL you want to redirect back to. The domain (www.example.com) for this
                            // URL must be whitelisted in the Firebase Console.
                            // You can use Firebase hosting to host this link even though
                            // for a mobile app this will not be invoked.
                            url: 'https://miband3companion.firebaseapp.com/lule',
                            // TODO: set FDL
                            // This must be true.
                            handleCodeInApp: true,
                            android: {
                                packageName: AppSettings.packageName
                            }
                        }
                    );
                    await this.authSecurityService.updateField({ id: this.authSecurity.id }, 'lastEmailVerificationRequestDate', new Date());
                    return signOutUser ? this.signOut() : Promise.resolve();
                } else {
                    return Promise.reject(AuthErrorMessages.VERIFICATION_EMAIL_REQUESTING_IS_DISABLED);
                }
            }
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    // register user and create user doc
    public async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
        try {
            if (this.authSecurity.lastAccountCreationDate === undefined
                || (timePassedSinceDate(this.authSecurity.lastAccountCreationDate) > 60 ** 2 * 1000)) {
                const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
                await this.authSecurityService.updateField({ id: this.authSecurity.id }, 'lastAccountCreationDate', new Date());
                await this.sendEmailVerification();
                await updateProfile(userCredential.user, { displayName: firstName + ' ' + lastName });
                await this.auth.signOut();
                return await this.userService.add(new User(userCredential.user?.uid, email, firstName, lastName));
            } else {
                return Promise.reject(AuthErrorMessages.ACCOUNT_CREATION_IS_DISABLED);
            }
        } catch (error: unknown) {
            this.logHelper.logError(this.register.name, 'registration error', { value: error });
            return Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? AuthErrorMessages.REGISTRATION_FAILED);
        }
    }

    public async sendPasswordResetEmail(email: string): Promise<void> {
        try {
            if (this.authSecurity.lastPasswordChangeRequestDate === undefined
                || (timePassedSinceDate(this.authSecurity.lastPasswordChangeRequestDate) > 60 ** 2 * 1000)) {
                await sendPasswordResetEmail(this.auth, email);
                return await this.authSecurityService.updateField({ id: this.authSecurity.id }, 'lastPasswordChangeRequestDate', new Date());
            } else {
                return Promise.reject(AuthErrorMessages.PASSWORD_RESETTING_IS_DISABLED);
            }
        } catch (error: unknown) {
            this.logHelper.logError(this.register.name, 'sendPasswordResetEmail error', { value: error });
            return Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? AuthErrorMessages.SENDING_PASSWORD_RESET_EMAIL_FAILED);
        }
    }

    public getAuthUserObservable(): Observable<AuthUser | undefined> {
        return authState(this.auth).pipe(take(1), map((user: AuthUser | null) => user === null ? undefined : user));
    }

}
