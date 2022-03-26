import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../services/message/message.service';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { Subscription } from 'rxjs';
import { getFormControlFromFormGroup } from '../../shared/functions/form.functions';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
    private routeParamsSubscription: Subscription | undefined;
    public readonly registrationFormGroup: FormGroup;

    public constructor(
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
        this.registrationFormGroup = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            passwordAgain: ['', [Validators.required, Validators.minLength(8)]],
        });
        // TODO: maybe password infos like: min pass length, password strength, ...
        // TODO: add pattern check for password
    }

    public getRegistrationFormControl(formControlName: string): FormControl | null {
        return getFormControlFromFormGroup(this.registrationFormGroup, formControlName);
    }

    public ngOnInit(): void {
        this.routeParamsSubscription = this.route.params.subscribe( (params: Params) => {
            this.registrationFormGroup.patchValue(
                {
                    email: params['email'] ?? '',
                    password: params['password'] ?? '',
                    passwordAgain: params['password'] ?? ''
                }
            );
        });
    }

    public ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    public async register(): Promise<void> {
        try {
            if (this.registrationFormGroup.value.password === this.registrationFormGroup.value.passwordAgain) {
                await this.messageService.createLoading('CREATING_ACCOUNT_WITH_DOTS', 'circular', false, 0, true, true);
                await this.authService.register(
                    this.registrationFormGroup.value.email,
                    this.registrationFormGroup.value.password,
                    this.registrationFormGroup.value.firstName,
                    this.registrationFormGroup.value.lastName
                );
                await this.messageService.dismissLoading();
                await this.messageService.createAlert('REGISTRATION', 'SUCCESSFUL_REGISTRATION', true);
                await this.router.navigate(['/login', { email: this.registrationFormGroup.value.email, password: this.registrationFormGroup.value.password }]);
            } else {
                return this.messageService.displayErrorMessage(new LogInfo(RegisterComponent.name, this.register.name, 'PASSWORDS_NOT_MATCHING'), 'toast', false, 5000, 'top');
            }
        } catch (e: unknown) {
            await this.messageService.dismissLoading();
            await this.messageService.displayErrorMessage(new LogInfo(RegisterComponent.name, this.register.name, e), 'toast', false, 5000, 'top');
        }
    }

    public resetForm(): void {
        this.registrationFormGroup.reset();
    }
}
