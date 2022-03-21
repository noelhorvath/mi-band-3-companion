import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseAuthService } from '../../../services/firebase/auth/firebase-auth.service';
import { FirestoreUserService } from '../../../services/firestore/user/firestore-user.service';
import { map, tap } from 'rxjs/operators';
import { User } from '../../models/classes/User';
import { LogHelper } from '../../models/classes/LogHelper';

@Injectable({
    providedIn: 'root'
})
export class DeviceGuard implements CanActivate, CanActivateChild {
    private readonly logHelper: LogHelper;

    public constructor(
        private userService: FirestoreUserService,
        private authService: FirebaseAuthService,
        private router: Router)
    {
        this.logHelper = new LogHelper(DeviceGuard.name);
    }

    public canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.userService.get(this.authService.getAuthUser()?.uid ?? 'undefined').pipe(
            map((user: User | undefined) => user !== undefined ? (user.devices ? user.devices.length > 0 : false) : false),
            tap( async (hasDevice: boolean) => {
                if (!hasDevice) {
                    try {
                        await this.router.navigateByUrl('/device-setup', { replaceUrl: true });
                    } catch (e: unknown) {
                        this.logHelper.logError('canActivate', e);
                    }
                }
                return hasDevice;
            }));
    }

    public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate(childRoute, state);
    }

}
