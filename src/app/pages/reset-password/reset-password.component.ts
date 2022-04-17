import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { MessageService } from '../../services/message/message.service';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { ActivatedRoute, Params } from '@angular/router';
import { first } from 'rxjs';

@Component({
    selector: 'app-login-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
    public readonly emailFormGroup: FormGroup;
    public readonly logHelper: LogHelper;

    public constructor(
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
        this.logHelper = new LogHelper(ResetPasswordComponent.name);
        this.emailFormGroup = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    public ngOnInit(): void {
        this.route.params.pipe(first()).subscribe({
            next: (params: Params) => {
                this.emailFormGroup.patchValue({ email: params['email'] ?? '' });
            },
            error: (e: unknown) => {
                this.logHelper.logError('Get route parameters error', e);
            }
        });
    }

    public async sendLink(): Promise<void> {
        try {
            await this.messageService.createLoading('SENDING_PASSWORD_RESET_LINK_WITH_DOTS');
            await this.authService.sendPasswordResetEmail(this.emailFormGroup.value.email);
            this.logHelper.logDefault(this.sendLink.name, 'Password reset link has been sent');
            await this.messageService.dismissLoading();
            return await this.messageService.createToast('PASSWORD_RESET', 'PASSWORD_RESET_EMAIL_SENT', 'top', 'success');
        } catch (error: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(ResetPasswordComponent.name, this.sendLink.name, error), 'toast', true, 5000, 'top');
        }
    }
}
