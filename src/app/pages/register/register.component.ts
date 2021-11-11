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
  }

  ngOnInit() {
  }

  public goBackToLogin() {
    this.router.navigateByUrl("/login").then(b => {
      console.log("goBackToLogin: " + b);
    }).catch(error => console.error("goBackToLogin error: " + error.message || error));
  }

  public register() {
    const pass = this.registrationFormGroup.value.password;
    const passAgain = this.registrationFormGroup.value.passwordAgain;
    const email = this.registrationFormGroup.value.email;
    if (pass && passAgain && email) {
      if (pass === passAgain) {
        this.authService.register(email, pass).then(() => {
          console.log("Account successfully created!");
          this.router.navigateByUrl("/device-setup").then(() => {
            console.log("redirected to setup");
          }).catch(error => {
            console.error("setup redirect error: " + error.message || error);
          });
        }).catch(error => {
          console.error("Register error: " + error.message || error)
          console.error("Register error code: " + error.code);
        });
      } else {
        this.messageService.createAlert("Registration failed", "Passwords are not matching!", true).then(() => {
          console.log("Password match fail alert created!");
        });
        // TODO: password not matching error with toast or alert
      }
    }
  }

  resetForm() {
    this.registrationFormGroup.reset();
  }
}
