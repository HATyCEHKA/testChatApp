import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthUser} from "../model/user";
import {filter, Observable, tap, switchMap, from,first, of} from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthApiService{
  private BASE_URL = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  public logIn(userName:string, password: string): Observable<AuthUser|null>{
    return this.http.get<AuthUser[]>(this.BASE_URL + 'users', {params: {username: userName, password: password}})
      .pipe(
        switchMap(((users:AuthUser[])=>{
            if(!users || !users.length)
              return of(null);
            return this.updateOnlineStatus(users[0].id, true);
          })
        )
    );
  }

  private updateOnlineStatus(userId:number, isOnline:boolean): Observable<AuthUser>{
    return this.http.patch<AuthUser>(this.BASE_URL + 'users/'+userId, {status: isOnline});
  }

  public logOut(userId: number){
    return this.updateOnlineStatus(userId, false);
  }

  public updateUser(userId: number, newUserName: string, newPassword:string){
    return this.http.patch<AuthUser>(this.BASE_URL + 'users/'+userId, {username: newUserName, password: newPassword});
  }
}
