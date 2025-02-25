import {Injectable} from "@angular/core";
import {AuthUser} from "../model/user";
import {Store} from "@ngrx/store";
import {authReducer} from "../store/auth.reducers";
import {authSelectors} from "../store/auth.selectors";
import {authActions} from "../store/auth.actions";
import {Observable} from "rxjs";


@Injectable({ providedIn: 'root' })
export class AuthService{
  authState: Observable<authReducer.AuthState>;
  errorMessage: Observable<string| null>;
  isAuthenticated: Observable<boolean>;
  currentUser: Observable<AuthUser|null>;
  currentUserId:number = -1;

  constructor(private store: Store<authReducer.AuthState>) {
    this.authState = this.store.select(authSelectors.authStateSelector);
    this.errorMessage = this.store.select(authSelectors.authErrorSelector);
    this.currentUser = this.store.select(authSelectors.authUserSelector);
    this.isAuthenticated = this.store.select(authSelectors.authIsAuthenticatedSelector);

    this.currentUser.subscribe((user:AuthUser|null)=>this.currentUserId = user? user.id: -1);
  }

  public logIn(userName:string, password: string){
    this.store.dispatch(authActions.login({username: userName, password: password}));
  }

  public logOut(){
    if(this.currentUserId>=0)
      this.store.dispatch(authActions.logout({id: this.currentUserId}));
  }

  public updateUser(newUserName: string, newPassword: string){
    if(this.currentUserId>=0 && newUserName && newPassword)
      this.store.dispatch(authActions.updateUser({id: this.currentUserId, newUsername: newUserName, newPassword: newPassword}));
  }
}
