import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/firebase/auth/auth.service";
import {MessageService} from "../../../services/message/message.service";

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
    @Input() email: string;
    public emailFormGroup: FormGroup;

    constructor(
        private authService: AuthService,
        private messageService: MessageService
    ) {
    }

    ngOnInit() {
        this.emailFormGroup = new FormGroup({
            email: new FormControl(this.email, Validators.compose([Validators.required, Validators.email]))
        })
    }

    public async sendPasswordResetLink() {
        try {
            console.log("Password reset code has been sent to " + this.emailFormGroup.value.email);
            await this.authService.sendPasswordResetEmail(this.emailFormGroup.value.email);
            return this.messageService.createToast('PASSWORD_RESET', 'PASSWORD_RESET_EMAIL_SENT');
        } catch (error) {
            await this.messageService.errorHandler(ResetPasswordComponent.name, error, error, 'toast',true, 5000, 'top');
        }
    }
}
