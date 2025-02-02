import {createAction, props} from '@ngrx/store';

export const authActions =
{
  login : createAction('[Auth] Login', props<{ username: string, password: string }>()),
  loginSuccess : createAction('[Auth] Login Success', props<{ id:number, username: string, password: string, status: boolean }>()),
  loginFailure : createAction('[Auth] Login Failure', props<{ error: string }>()),

  logout : createAction('[Auth] Logout', props<{ id:number }>()),

  updateUser : createAction('[Auth] Update User', props<{ id:number, newUsername: string, newPassword: string }>()),
  updateUserFailure : createAction('[Auth] Update User Failure', props<{ error: string }>()),
}
