import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/firebase/auth/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

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
  ) {
    this.loginFormGroup = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.email, Validators.required])),
      password: new FormControl('', Validators.required)
    });
    this.isResettingPassword = false;
    this.email = "";
    this.title = "LOGIN"
  }

  ngOnInit() {
  }

  public login() {
    const email = this.loginFormGroup.value.email;
    const password = this.loginFormGroup.value.password;
    if (email && password) {
      this.authService.login(email, password).then(() => {
        // TODO: navigate to home
        // TODO: check if user has a device
        this.router.navigateByUrl('/device-setup').then(() => console.log('No saved devices detected, redirecting to device-setup'));
      }).catch(error => {
        console.error("Login error: " + error.message);
        console.error("Login error code: " + error.code);
      });
    }
  }

  public goToRegister() {
    this.router.navigateByUrl('/register').then(() => console.log('navigated to register')).catch(error => {
      console.error('nav error: ' + error.message || error);
    });
  }

  public resetPassword() {
    this.isResettingPassword = true;
    this.title = "PASSWORD_RESET";
    this.email = this.loginFormGroup.value.email;
    console.log("email: " + this.email);
  }

  public loginWithGoogle() {
    this.authService.loginWithGoogle().then(() => {
      // TODO: navigate to home
    }).catch(error => {
      console.error("Google login error: " + error.message);
      console.error("Google login error code: " + error.code);
    });
  }

  setIsResettingPassword(event: any) {
    this.isResettingPassword = event;
    this.title = "LOGIN";
  }
}
