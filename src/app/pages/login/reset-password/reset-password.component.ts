import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/firebase/auth/auth.service";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  @Input() email: string;
  public emailFormGroup: FormGroup;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.emailFormGroup = new FormGroup({
      email: new FormControl(this.email, Validators.compose([Validators.required, Validators.email]))
    })
  }

  sendPasswordResetLink() {
    this.authService.sendPasswordResetEmail(this.emailFormGroup.value.email).then( () => {
      console.log("Password reset code has been sent to " + this.emailFormGroup.value.email);
    }).catch( error => {
      console.error("Password reset code sending error: " + error.message || error);
      console.error("Password reset code sending error code: " + error.code);
      if (error.code === 'auth/missing-email') {
        // TODO: alert missing email
      }
      //TODO: show alert if error occurs
    });
  }
}
