import {Injectable} from "@angular/core";
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from "./login/auth.service";
import {tap} from "rxjs";
import {map} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth_service:AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.auth_service.isAuthenticated.pipe(
      tap(res=>{
        if(!res)
          this.router.navigate(['/login']);
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class NotAuthGuard implements CanActivate {
  constructor(private router: Router, private auth_service:AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.auth_service.isAuthenticated.pipe(
      map(res=>{
        if(res)
          return this.router.parseUrl('/');
        return true;
      })
    );
  }
}
