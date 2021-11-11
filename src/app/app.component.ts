import {Component} from '@angular/core';
import {AuthService} from "./services/firebase/auth/auth.service";
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private authService: AuthService,
    private router: Router,
    private auth: AngularFireAuth
  ) {
    this.initializeApp();
  }

  public initializeApp() {
    console.log("Initializing app");
    // auto-login if logged in user is detected
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.router.navigateByUrl('/device-setup').then( () => console.log("Logged in user detected"));
      } else {
        this.router.navigateByUrl('/login').then( () => console.log("No logged in user detected"));
      }
    }).then( () => {
      console.log("User is removed");
    }).catch( error => {
      console.log("onAuthStateChanged error: " + error.message || error || error.code);
    })
  }
}
