import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../services/message/message.service';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { FirebaseErrorMessage } from '../../shared/enums/firebase.enum';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { first } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    private readonly logHelper: LogHelper;
    public readonly loginFormGroup: FormGroup;

    public constructor(
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.logHelper = new LogHelper(LoginComponent.name);
        this.loginFormGroup = this.formBuilder.group({
            email: ['', Validators.compose([Validators.email, Validators.required])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
        });
    }

    public ngOnInit(): void {
        this.route.params.pipe(first()).subscribe({
            next: (params: Params) => {
                this.loginFormGroup.patchValue(
                    {
                        email: params['email'] ?? '',
                        password: params['password'] ?? '',
                    }
                );
            },
            error: (e: unknown) => {
                this.logHelper.logError('Get route parameters error', e);
            }
        });
    }

    public async login(): Promise<void> {
        try {
            const authUser = await this.authService.signIn(this.loginFormGroup.value.email, this.loginFormGroup.value.password);
            if (authUser !== undefined) { // only when email is verified (promise will be rejected otherwise)
                await this.router.navigateByUrl('/home', { replaceUrl: true });
            }
        } catch (e: unknown) {
            if (e === FirebaseErrorMessage.UNVERIFIED_EMAIL) {
                this.logHelper.logDefault(this.login.name, 'Login failed, because account is unverified');
                await this.messageService.createAlert('UNVERIFIED_REGISTRATION', 'VERIFY_ACCOUNT', false,
                    [
                        {
                            text: 'REQUEST_VERIFICATION_LINK',
                            handler: async (): Promise<void> => {
                                try {
                                    await this.authService.sendEmailVerification(true);
                                    LogHelper.log({ mainId: LoginComponent.name, secondaryId: 'unverified alert handler', message: 'Verification email has been sent' });
                                    await this.messageService.createToast('VERIFICATION', 'VERIFICATION_LINK_SENT', 'top', 'success', 3000);
                                    await this.messageService.dismissAlert();
                                } catch (error: unknown) {
                                    await this.messageService.displayErrorMessage(
                                        {
                                            mainId: LoginComponent.name,
                                            secondaryId: 'unverified alert handler',
                                            message: error,
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
            return await this.messageService.displayErrorMessage(new LogInfo(LoginComponent.name, this.goToRegister.name, e), 'toast', false, 5000, 'top');
        }
    }

    public async goToPasswordReset(): Promise<void> {
        try {
            await this.router.navigate(['/reset-password', { email: this.loginFormGroup.value.email }]);
        } catch (e: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(LoginComponent.name, this.goToPasswordReset.name, e), 'toast', false, 5000, 'top');
        }
    }
}
