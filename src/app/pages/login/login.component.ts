import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../services/message/message.service';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { AuthErrorMessages } from '../../shared/enums/auth-error-messages.enum';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { getFormControlFromFormGroup } from '../../shared/functions/form.functions';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
    private readonly logHelper: LogHelper;
    private routeParamsSubscription: Subscription | undefined;
    public readonly TITLE_LOGIN_KEY: string = 'LOGIN';
    public readonly TITLE_PASSWORD_RESET_KEY: string = 'PASSWORD_RESET';
    public readonly loginFormGroup: FormGroup;
    public isResettingPassword: boolean;
    public title: string;

    public constructor(
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute)
    {
        // TODO: add pattern check for password
        this.logHelper = new LogHelper(LoginComponent.name);
        this.loginFormGroup = this.formBuilder.group({
            email: ['', Validators.compose([Validators.email, Validators.required])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
        });
        this.isResettingPassword = false;
        this.title = this.TITLE_LOGIN_KEY;
    }

    public async ngOnInit(): Promise<void> {
        this.routeParamsSubscription = this.route.params.subscribe( (params: Params) => {
            this.loginFormGroup.patchValue(
                {
                    email: params.email ?? '',
                    password: params.password ?? '',
                }
            );
        });
    }

    public ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    public getLoginFormControl(formControlName: string): FormControl | null {
        return getFormControlFromFormGroup(this.loginFormGroup, formControlName);
    }

    public async login(): Promise<void> {
        try {
            const authUser = await this.authService.signIn(this.loginFormGroup.value.email, this.loginFormGroup.value.password);
            if (authUser !== undefined) { // only when email is verified (promise will be rejected otherwise)
                await this.router.navigateByUrl('/home', { replaceUrl: true });
            }
        } catch (e: unknown) {
            if (e === AuthErrorMessages.UNVERIFIED_EMAIL) {
                this.logHelper.logDefault(this.login.name, 'Login failed, because account is unverified');
                await this.messageService.createAlert('UNVERIFIED_REGISTRATION', 'VERIFY_ACCOUNT', false,
                    [
                        {
                            text: 'REQUEST_VERIFICATION_LINK',
                            handler: async (): Promise<void> => {
                                try {
                                    await this.authService.sendEmailVerification(true);
                                    LogHelper.log({ mainId: LoginComponent.name, secondaryId: 'unverified alert handler', message: 'Verification email has been sent' });
                                    await this.messageService.createToast('VERIFICATION', 'VERIFICATION_LINK_SENT', 'bottom', 'success', 3000);
                                    await this.messageService.dismissAlert();
                                } catch (error: unknown) {
                                    await this.messageService.displayErrorMessage(
                                        {
                                            mainId: LoginComponent.name,
                                            secondaryId: 'unverified alert handler',
                                            message: 'sendEmailVerification error',
                                            options: { value: error }
                                        },
                                        'toast',
                                        true,
                                        5000,
                                        'top'
                                    );
                                }
                            }
                        },
                        {
                            text: 'CLOSE',
                            handler: async (): Promise<void> => {
                                try {
                                    await this.authService.signOut();
                                    LogHelper.log({ mainId: LoginComponent.name, secondaryId: 'unverified alert handler', message: 'Closing alert' });
                                    await this.messageService.dismissAlert();
                                } catch (error: unknown) {
                                    LogHelper.log({ mainId: LoginComponent.name, secondaryId: 'unverified alert handler', message: 'signOut error', options: { value: error } }, 'error');
                                }
                            }
                        },
                    ]
                );
            } else {
                return this.messageService.displayErrorMessage(new LogInfo(LoginComponent.name, this.login.name, e), 'toast', false, 5000, 'top');
            }
        }
    }

    public async goToRegister(): Promise<void> {
        try {
            await this.router.navigate(['/register', { email: this.loginFormGroup.value.email, password: this.loginFormGroup.value.password }]);
        } catch (e: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(LoginComponent.name, this.goToRegister.name, e), 'toast', false, 5000, 'bottom');
        }
    }

    public resetPassword(): void {
        this.isResettingPassword = true;
        this.title = this.TITLE_PASSWORD_RESET_KEY;
    }

    public setIsResettingPassword(isResetting: boolean): void {
        this.isResettingPassword = isResetting;
        this.title = this.TITLE_LOGIN_KEY;
    }
}
