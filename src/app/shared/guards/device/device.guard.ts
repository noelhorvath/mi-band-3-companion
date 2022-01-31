import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../../../services/firebase/auth/auth.service";
import {StorageService} from "../../../services/storage/storage.service";
import {UserService} from "../../../services/firebase/firestore/user/user.service";
import {map, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class DeviceGuard implements CanActivate, CanActivateChild {
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private storageService: StorageService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.userService.get(this.authService.authUser ? this.authService.authUser.uid : null).pipe(
            map(user => user ? (user.devices ? user.devices.length > 0 : false) : false),
            tap( hasDevice => {
            if (!hasDevice) {
                this.router.navigateByUrl('/device-setup', { replaceUrl: true }).catch(e => console.error(DeviceGuard.name + ' -> nav error: ' + e));
            }
            return hasDevice;
        }))
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate(childRoute, state);
    }

}
