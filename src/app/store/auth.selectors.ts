import { createFeatureSelector, createSelector } from '@ngrx/store';
import {authReducer} from "./auth.reducers";


export namespace authSelectors {

  export const authStateSelector = createFeatureSelector<authReducer.AuthState> (authReducer.authFeatureKey );

  export const authUserSelector = createSelector( authStateSelector, ( { user } ) => user );
  export const authIsAuthenticatedSelector = createSelector( authStateSelector, ( { isAuthenticated } ) => isAuthenticated )
  export const authErrorSelector = createSelector( authStateSelector, ( { errorMessage } ) => errorMessage )
}
