import { AuthUser } from '../model/user';
import {authActions} from "./auth.actions";
import {createFeature, createReducer, on} from "@ngrx/store";

export namespace authReducer {
  export const authFeatureKey = 'auth';

  export interface AuthState {
    isAuthenticated: boolean;
    user: AuthUser | null;
    errorMessage: string | null;
  }

  const loadState = function(): AuthState {
    let s = localStorage.getItem('authData');
    if(s) {
      try{
        let user = JSON.parse(s) as AuthUser;
        if(user){
          return {
            isAuthenticated: true,
            user: {
                  username: user.username,
                  password: user.password,
                  status: user.status,
                  id: user.id
            },
            errorMessage: null
          };
        }
      }
      catch{}
    }
    return {
      isAuthenticated: false,
      user: null,
      errorMessage: null
    };
  };

  export const initialState = loadState();
}

export const authFeature = createFeature({
  name: authReducer.authFeatureKey,
  reducer: createReducer(
    authReducer.initialState,
    on(authActions.loginSuccess, (state, { id, username, password, status }) => ({ ...state, isAuthenticated: true, user: {id: id, username: username, password:password, status: status}, errorMessage:  null })),
    on(authActions.loginFailure, (state, { error }) => ({ ...state,  isAuthenticated: false, user: null, errorMessage:  error })),
    on(authActions.logout, (state, { }) => ({ ...state,  isAuthenticated: false, user: null, errorMessage:  null })),
    on(authActions.updateUserFailure, (state, { error }) => ({ ...state,  errorMessage:  error })),
  )
})
