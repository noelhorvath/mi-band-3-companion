import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/firebase/auth/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageService} from "../../services/message/message.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    public loginFormGroup: FormGroup;
    public isResettingPassword: boolean;
    public email: string;
    public title: string;

    constructor(
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService,
    ) {
        this.loginFormGroup = new FormGroup({
            email: new FormControl('', Validators.compose([Validators.email, Validators.required])),
            password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)]))
        });
        this.isResettingPassword = false;
        this.email = "";
        this.title = "LOGIN"
    }

    ngOnInit() { }

    public async login(): Promise<void> {
        const email = this.loginFormGroup.value.email;
        const password = this.loginFormGroup.value.password;
        try {
            const authUser = await this.authService.signIn(email, password);
            if (authUser) { // only when email is verified (promise will be rejected otherwise)
                await this.router.navigateByUrl('/home', { replaceUrl: true });
            }
        } catch (e) {
            await this.messageService.errorHandler(LoginComponent.name, "Login failed", e, 'toast', false,5000,'top');
        }
    }

    public goToRegister(): void {
        this.router.navigateByUrl('/register').catch( error => console.error('nav error: ' + error.message || error) );
    }

    public resetPassword(): void {
        this.isResettingPassword = true;
        this.title = "PASSWORD_RESET";
        this.email = this.loginFormGroup.value.email;
    }

    setIsResettingPassword(event: any): void {
        this.isResettingPassword = event;
        this.title = "LOGIN";
    }
}
