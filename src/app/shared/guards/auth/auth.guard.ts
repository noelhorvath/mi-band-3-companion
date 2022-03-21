import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { FirebaseAuthService } from '../../../services/firebase/auth/firebase-auth.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LogHelper } from '../../models/classes/LogHelper';
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
    private readonly logHelper: LogHelper;

    public constructor(
        private authService: FirebaseAuthService,
        private router: Router)
    {
        this.logHelper = new LogHelper(AuthGuard.name);
    }

    public canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authService.getAuthUserObservable().pipe(map((user: User | undefined): boolean => !!user && user.emailVerified), tap( async (isLoggedIn: boolean) => {
            if (!isLoggedIn) {
                try {
                    await this.router.navigateByUrl('/login', { replaceUrl: true });
                } catch (e: unknown) {
                    this.logHelper.logError(this.canActivate.name, e);
                }
            }
        }));
    }

    public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate(childRoute, state);
    }
}
