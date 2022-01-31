import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/firebase/auth/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageService} from "../../services/message/message.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    public registrationFormGroup: FormGroup;

    constructor(
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService
    ) {
        this.registrationFormGroup = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)]),
            passwordAgain: new FormControl('', [Validators.required, Validators.minLength(8)]),
        });
        // TODO: reg info like min pass length
    }

    ngOnInit() {}

    public async register() {
        const pass = this.registrationFormGroup.value.password;
        const passAgain = this.registrationFormGroup.value.passwordAgain;
        const email = this.registrationFormGroup.value.email;
        const firstName = this.registrationFormGroup.value.lastName;
        const lastName = this.registrationFormGroup.value.firstName;
        try {
            if (pass && passAgain && email) {
                if (pass === passAgain) {
                    await this.messageService.createLoading('CREATING_ACCOUNT_WITH_DOTS', "circular", false, 0, true, true);
                    await this.authService.register(email, pass, firstName, lastName);
                    await this.messageService.dismissLoading();
                    await this.messageService.createAlert('REGISTRATION', 'SUCCESSFUL_REGISTRATION', true);
                    return await this.router.navigateByUrl("/login");
                } else {
                    return this.messageService.errorHandler(RegisterComponent.name, 'Registration failed', 'PASSWORDS_NOT_MATCHING', 'toast', false, 5000, 'top');
                }
            }
        } catch (e) {
            await this.messageService.dismissLoading();
            await this.messageService.errorHandler(RegisterComponent.name, 'Registration error', e, 'toast', false, 5000, 'top');
        }
    }

    public resetForm() {
        this.registrationFormGroup.reset();
    }
}
