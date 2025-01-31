import {createAction, props} from '@ngrx/store';

export const authActions =
{
  login : createAction('[Auth] Login', props<{ username: string, password: string }>()),
  loginSuccess : createAction('[Auth] Login Success', props<{ id:number, username: string, password: string, status: boolean }>()),
  loginFailure : createAction('[Auth] Login Falure', props<{ error: string }>()),

  logout : createAction('[Auth] Logout', props<{ id:number }>()),
  // logoutSuccess : createAction('[Auth] Logout Success', props<{ }>()),
}
