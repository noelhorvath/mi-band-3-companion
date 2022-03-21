import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from '../../../services/firebase/auth/firebase-auth.service';
import { MessageService } from '../../../services/message/message.service';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { LogInfo } from '../../../shared/models/classes/LogInfo';

@Component({
    selector: 'app-login-reset-password',
    templateUrl: './login-reset-password.component.html',
    styleUrls: ['./login-reset-password.component.scss'],
})
export class LoginResetPasswordComponent {
    public readonly emailFormGroup: FormGroup;
    public readonly logHelper: LogHelper;
    @Input() public email: string | undefined;

    public constructor(
        private authService: FirebaseAuthService,
        private messageService: MessageService
    ) {
        this.logHelper = new LogHelper(LoginResetPasswordComponent.name);
        this.emailFormGroup = new FormGroup({
            email: new FormControl(this.email ?? '', Validators.compose([Validators.required, Validators.email]))
        });
    }

    public async sendLink(): Promise<void> {
        try {
            await this.authService.sendPasswordResetEmail(this.emailFormGroup.value.email);
            this.logHelper.logDefault(this.sendLink.name, 'Password reset link has been sent');
            return this.messageService.createToast('PASSWORD_RESET', 'PASSWORD_RESET_EMAIL_SENT');
        } catch (error: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(LoginResetPasswordComponent.name, this.sendLink.name, error), 'toast', true, 5000, 'top');
        }
    }
}
