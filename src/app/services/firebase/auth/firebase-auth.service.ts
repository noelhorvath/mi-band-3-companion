import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirestoreUserService } from '../../firestore/user/firestore-user.service';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { User } from '../../../shared/models/classes/User';
import {
    ActionCodeSettings,
    Auth,
    AuthError,
    authState,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updateProfile,
    User as AuthUser,
    UserCredential
} from '@angular/fire/auth';
import { FirebaseErrorMessages } from '../../../shared/enums/firebase.enum';
import { LogInfo } from '../../../shared/models/classes/LogInfo';
import { LanguageService } from '../../language/language.service';
import { AuthSecurity } from '../../../shared/models/classes/AuthSecurity';
import { FirestoreAuthSecurityService } from '../../firestore/auth-security/firestore-auth-security.service';
import { DeviceService } from '../../device/device.service';
import { FirebaseServerInfoService } from '../server-info/firebase-server-info.service';
import { NetworkStatus } from '../../../shared/types/custom.types';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService {
    private readonly logHelper: LogHelper;
    private authSecurity: AuthSecurity;
    private firebaseConnection: NetworkStatus;
    public authUserSubject: BehaviorSubject<AuthUser | undefined>;

    // TODO: delete unverified users after x days

    public constructor(
        private userService: FirestoreUserService,
        private languageService: LanguageService,
        private auth: Auth,
        private authSecurityService: FirestoreAuthSecurityService,
        private deviceService: DeviceService,
        private serverInfo: FirebaseServerInfoService
    ) {
        this.logHelper = new LogHelper(FirebaseAuthService.name);
        this.authUserSubject = new BehaviorSubject<AuthUser | undefined>(this.auth.currentUser !== null ? this.auth.currentUser : undefined);
        onAuthStateChanged(
            this.auth,
            async (authUser: AuthUser | null) => {
                this.authUserSubject.next(this.auth.currentUser !== null ? this.auth.currentUser : undefined);
                this.logHelper.logDefault('onAuthStateChanged', 'User status', { value: !!authUser ? 'logged in' : 'not logged in' });
            },
            (error: unknown) => this.logHelper.logError('onAuthStateChanged', error)
        );
        this.languageService.isServiceInitializedSubject.subscribe((isReady: boolean) => {
            if (isReady) {
                this.languageService.currentLanguageSubject.subscribe((lang: string) => {
                    this.auth.languageCode = lang;
                });
            }
        });
        // auth security setup
        this.authSecurity = new AuthSecurity();
        this.deviceService.getUUID().then((uuid: string) => {
            this.authSecurityService.listWithValueChanges({ fieldPath: 'uuid', opStr: '==', value: uuid })
                .subscribe({
                    next: async (authSecurity: AuthSecurity[] | undefined) => {
                        this.logHelper.logDefault(this.authSecurityService.listWithValueChanges.name, 'authSecurity data changed', { value: authSecurity });
                        if (authSecurity === undefined || authSecurity.length === 0) {
                            this.authSecurity.uuid = uuid;
                            this.authSecurityService.add(this.authSecurity)
                                .then( () => this.logHelper.logDefault('add AuthSecurity', 'new AuthSecurity has been added'))
                                .catch( (e: unknown) => this.logHelper.logError('add AuthSecurity error', e));
                        } else {
                            this.authSecurity = authSecurity[0];
                        }
                    },
                    error: (error: unknown) => this.logHelper.logError('get AuthSecurity error', error)
                });
        }).catch((e: unknown) => {
            this.logHelper.logError('AuthSecurity setup error', e);
        });
        this.firebaseConnection = 'offline';
        this.serverInfo.connectionStatusSubject.subscribe( (status: NetworkStatus) => this.firebaseConnection = status );
    }

    private static getAuthErrorMessage(error: AuthError): string | undefined {
        if ('code' in error) {
            switch (error.code) {
                case 'auth/wrong-password':
                    return FirebaseErrorMessages.WRONG_PASSWORD;
                case 'auth/user-disabled':
                    return FirebaseErrorMessages.USER_IS_DISABLED;
                case 'auth/user-not-found':
                    return FirebaseErrorMessages.USER_NOT_FOUND;
                case 'auth/email-already-in-use':
                    return FirebaseErrorMessages.EMAIL_ALREADY_IN_USE;
                case 'auth/network-request-failed':
                    return FirebaseErrorMessages.NETWORK_REQUEST_FAILED;
                case 'auth/internal-error':
                    return FirebaseErrorMessages.INTERNAL_ERROR;
                case 'auth/weak-password':
                    return FirebaseErrorMessages.WEAK_PASSWORD;
                case 'auth/invalid-email':
                    return FirebaseErrorMessages.INVALID_EMAIL;
                default:
                    LogHelper.log(new LogInfo(FirebaseAuthService.name, error.code, error.message), 'error');
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
                this.userService.updateField({ id: this.auth.currentUser.uid }, 'email', email, false)
                    .then( () => this.logHelper.logDefault('update User', 'email has been updated'))
                    .catch( (e: unknown) => this.logHelper.logError('update User error', e));
                return Promise.resolve();
            }
            return Promise.reject(FirebaseErrorMessages.USER_IS_NOT_SIGNED_IN);
        } catch (error: unknown) {
            this.logHelper.logError(this.updateUserEmail.name, 'updateUserEmail error', { value: error });
            return Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? FirebaseErrorMessages.UPDATING_EMAIL_FAILED);
        }
    }

    public signOut(): Promise<void> {
        return this.auth.currentUser !== null ? signOut(this.auth) : Promise.reject(FirebaseErrorMessages.USER_IS_NOT_SIGNED_IN);
    }

    public async signIn(email: string, password: string): Promise<AuthUser | undefined> {
        try {
            const userCredentials = await signInWithEmailAndPassword(this.auth, email, password);
            // user must verify email before using the app
            if (!userCredentials.user.emailVerified) {
                return Promise.reject(FirebaseErrorMessages.UNVERIFIED_EMAIL);
            } else {
                return Promise.resolve(userCredentials.user);
            }
        } catch (error: unknown) {
            this.logHelper.logError(this.signIn.name, 'signIn error', { value: error });
            return error instanceof Error && 'code' in error
                ? Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? FirebaseErrorMessages.SIGN_IN_FAILED)
                : Promise.reject(error);
        }
    }

    public async sendEmailVerification(signOutUser?: boolean, actionCodeSettings?: ActionCodeSettings): Promise<void> {
        try {
            if (this.auth.currentUser === null) {
                return Promise.reject(FirebaseErrorMessages.USER_IS_NOT_SIGNED_IN);
            } else {
                if (this.firebaseConnection === 'online') {
                    if (this.authSecurity.lastEmailVerificationRequestDate !== undefined) {
                        const timeDifference = await this.serverInfo.timePassedSinceServerTimeInSeconds(this.authSecurity.lastEmailVerificationRequestDate);
                        if (timeDifference >= 60 ** 2) {
                            await sendEmailVerification(this.auth.currentUser, actionCodeSettings);
                        } else {
                            return Promise.reject(FirebaseErrorMessages.VERIFICATION_EMAIL_REQUESTING_IS_DISABLED);
                        }
                    } else {
                        await sendEmailVerification(this.auth.currentUser, actionCodeSettings);
                    }
                    this.authSecurityService.updateField({ id: this.authSecurity.id }, 'lastEmailVerificationRequestDate', await this.serverInfo.getServerTime())
                        .then( () => this.logHelper.logDefault('update AuthSecurity', 'lastEmailVerificationRequestDate has been updated'))
                        .catch( (e: unknown) => this.logHelper.logError('update AuthSecurity error', e));
                    return signOutUser ? this.signOut() : Promise.resolve();
                } else {
                    return Promise.reject(FirebaseErrorMessages.NETWORK_REQUEST_FAILED);
                }
            }
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    // register user and create user doc
    // @ts-ignore
    public async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
        try {
            if (this.firebaseConnection === 'online') {
                let userCredential: UserCredential;
                if (this.authSecurity.lastEmailVerificationRequestDate !== undefined) {
                    const timeDifference = await this.serverInfo.timePassedSinceServerTimeInSeconds(this.authSecurity.lastEmailVerificationRequestDate);
                    if (timeDifference >= 60 ** 2) {
                        userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
                    } else {
                        return Promise.reject(FirebaseErrorMessages.ACCOUNT_CREATION_IS_DISABLED);
                    }
                } else {
                    userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
                }
                this.authSecurityService.updateField({ id: this.authSecurity.id }, 'lastAccountCreationDate', await this.serverInfo.getServerTime())
                    .then( () => this.logHelper.logDefault('update AuthSecurity', 'lastAccountCreationDate has been updated'))
                    .catch( (e: unknown) => this.logHelper.logError('update AuthSecurity error', e));
                await this.sendEmailVerification();
                await updateProfile(userCredential.user, { displayName: firstName + ' ' + lastName });
                this.userService.add(new User(userCredential.user?.uid, email, firstName, lastName))
                    .then( () => this.logHelper.logDefault('add User', 'new user has been added'))
                    .catch( (e: unknown) => this.logHelper.logError('add User error', e));
                return await this.auth.signOut();
            } else {
                return Promise.reject(FirebaseErrorMessages.NETWORK_REQUEST_FAILED);
            }
        } catch (error: unknown) {
            this.logHelper.logError(this.register.name, 'registration error', { value: error });
            return error instanceof Error && 'code' in error
                ? Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? FirebaseErrorMessages.REGISTRATION_FAILED)
                : Promise.reject(error);
        }
    }

    public async sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void> {
        try {
            if (this.firebaseConnection === 'online') {
                if (this.authSecurity.lastEmailVerificationRequestDate !== undefined) {
                    const timeDifference = await this.serverInfo.timePassedSinceServerTimeInSeconds(this.authSecurity.lastEmailVerificationRequestDate);
                    if (timeDifference >= 60 ** 2) {
                        await sendPasswordResetEmail(this.auth, email, actionCodeSettings);
                    } else {
                        return Promise.reject(FirebaseErrorMessages.PASSWORD_RESETTING_IS_DISABLED);
                    }
                } else {
                    await sendPasswordResetEmail(this.auth, email, actionCodeSettings);
                }
                this.authSecurityService.updateField({ id: this.authSecurity.id }, 'lastPasswordChangeRequestDate', await this.serverInfo.getServerTime())
                    .then( () => this.logHelper.logDefault('update AuthSecurity', 'lastPasswordChangeRequestDate has been updated'))
                    .catch( (e: unknown) => this.logHelper.logError('update AuthSecurity error', e));
                return Promise.resolve();
            } else {
                return Promise.reject(FirebaseErrorMessages.NETWORK_REQUEST_FAILED);
            }
        } catch (error: unknown) {
            this.logHelper.logError(this.register.name, 'sendPasswordResetEmail error', { value: error });
            return Promise.reject(FirebaseAuthService.getAuthErrorMessage(error as AuthError) ?? FirebaseErrorMessages.SENDING_PASSWORD_RESET_EMAIL_FAILED);
        }
    }

    public getAuthUserObservable(): Observable<AuthUser | undefined> {
        return authState(this.auth).pipe(first(), map((user: AuthUser | null) => user === null ? undefined : user));
    }

}
