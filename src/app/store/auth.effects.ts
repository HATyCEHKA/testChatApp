import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { of, tap, switchMap, pipe,catchError } from 'rxjs';
import {AuthApiService} from "../login/auth_api_service";
import {authActions} from "./auth.actions";
import { Actions, ofType, createEffect } from '@ngrx/effects';
import {AuthUser} from "../model/user";



@Injectable()
export class AuthEffects {

  constructor(
    private actions: Actions,
    private authService: AuthApiService,
    private router: Router,
  ) {  }

  LogIn =  createEffect(() =>
    this.actions.pipe(
      ofType(authActions.login),
      switchMap((data: any) => {
        return this.authService.logIn(data.username, data.password).pipe(
          switchMap((user) => {
            if(user && user.username)
              return of(authActions.loginSuccess(user));
            return of(authActions.loginFailure({ error: "Incorrect username or password" }));
          }),
          catchError((e) => {
            return of(authActions.loginFailure({ error: e.message }));
          }),
        );})
    )
  );

  LogInSuccess: Observable<any> =  createEffect(() =>
      this.actions.pipe(
        ofType(authActions.loginSuccess),
        tap((data:AuthUser) => {
          localStorage.setItem('authData', JSON.stringify(data));
          this.router.navigateByUrl('/');
        })
      ),
    { dispatch: false }
  );

  LogOut =  createEffect(() =>
    this.actions.pipe(
      ofType(authActions.logout),
      tap((data: any) => {
        this.authService.logOut(data.id).subscribe(res=> {
          localStorage.removeItem('authData');
          this.router.navigateByUrl('/login');
        },error =>{
          localStorage.removeItem('authData');
          this.router.navigateByUrl('/login');
        });
      }),
    ),
    { dispatch: false }
  );


  UpdateUser =  createEffect(() =>
    this.actions.pipe(
      ofType(authActions.updateUser),
      switchMap((data: any) => {
        return this.authService.updateUser(data.id, data.newUsername, data.newPassword).pipe(
          switchMap((user) => {
            if(user && user.username)
              return of(authActions.logout(user));
            return of(authActions.updateUserFailure({ error: "Empty response" }));
          }),
          catchError((e) => {
            return of(authActions.updateUserFailure({ error: e.message }));
          }),
        );})
    )
  );

}

