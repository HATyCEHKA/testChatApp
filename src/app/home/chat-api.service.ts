import {Injectable} from "@angular/core";
import {User} from "../model/user";
import {Observable, switchMap, of,map, tap,forkJoin,catchError} from "rxjs";
import {Channel, Message} from "../model/chat";
import {HttpClient} from "@angular/common/http";


@Injectable()
export class ChatApiService{
  private BASE_URL = 'http://localhost:3000/';

  constructor(private http: HttpClient){ }

  public GetUserChannels(userId:number): Observable<Channel[]|undefined>{
    return this.http.get(this.BASE_URL + 'user_channels', {params: {userId: userId}})
      .pipe(
        switchMap(((userChannels:any)=>{
          if(!userChannels || !userChannels.length)
            return of(undefined);
          let channelIds = userChannels.map((i:any)=>i.channelId.toString());
          return this.http.get<Channel[]>(this.BASE_URL + 'channels').pipe(
            map((channels:Channel[])=>{
              return channels.filter((el:Channel)=> channelIds.indexOf(el.id.toString())>=0)
            }),
            catchError(()=>of([])));
        })),
        catchError(()=>of([]))
      );
  }

  // public GetChannelUsers(channelId:number): Observable<User[]>{
  //   return this.http.get(this.BASE_URL + 'user_channels', {params: {channelId: channelId}})
  //     .pipe(
  //       switchMap(((userChannels:any)=>{
  //         if(!userChannels || !userChannels.length)
  //           return of([]);
  //         let userIds = userChannels.map((i:any)=>i.userId.toString());
  //         return this.http.get<User[]>(this.BASE_URL + 'users').pipe(
  //           map((users:User[])=>{
  //             return users.filter((el:User)=> userIds.indexOf(el.id.toString())>=0)
  //           }),
  //           catchError(()=>of([]))
  //           );
  //       })),
  //       catchError(()=>of([]))
  //     );
  // }

  public GetChannelUsersIds(channelId:number): Observable<any[]>{
    return this.http.get<any[]>(this.BASE_URL + 'user_channels', {params: {channelId: channelId}})
      .pipe(
        switchMap(((userChannels:any[])=>{
          if(!userChannels || !userChannels.length)
            return of([]);
          return of(userChannels.map((i:any)=>i.userId as any ));
        })),
        catchError(()=>of([]))
      );
  }

  public GetChannelMessages(channelId:number): Observable<Message[]>{
    return this.http.get(this.BASE_URL + 'messages', {params: {channelId: channelId}})
      .pipe(
        switchMap(((messages:any)=>{
          if(!messages || !messages.length)
            return of([]);

          return of(messages.map((m:any)=>{
            return m;
          }));
        })),
        catchError(()=>of([]))
      );
  }

  public AddChannelMessage(channelId:number, userId:number, content:string): Observable<Message>{
    return this.http.post<Message>(this.BASE_URL + 'messages', {channelId: channelId, userId:userId, content:content, date: new Date().toISOString()});
  }

  private AddUserToChannel(channelId: number, userId:number): Observable<boolean>{
    return this.http.post(this.BASE_URL + 'user_channels', {'userId': userId, 'channelId': channelId}).pipe(
      switchMap((u_ch:any)=>{
        console.debug("AddUserToChannel", u_ch)
        return of((u_ch.userId==userId) && (u_ch.channelId==channelId));
      }),
      catchError(()=>of(false))
    );
  }

  public AddUserChannel(userId:number, channelName:string): Observable<Channel|null>{
    return this.http.post<Channel>(this.BASE_URL + 'channels', {'name': channelName}).pipe(
      switchMap((channel:Channel)=>{
        return this.AddUserToChannel(channel.id, userId).pipe(
          switchMap((res:boolean)=>{
            return of(res ? channel : null);
          })
        );
      })
    );
  }

  private DeleteUserChannel(id:number){
    console.debug("[DeleteUserChannel]", id);
    return this.http.delete(this.BASE_URL + 'user_channels/' + id);
  }

  private AddUsersToChannel(channelId:number, users: number[]): Observable<number[]>{
    const addIds = users.map(userId => this.AddUserToChannel(channelId, userId));
    return forkJoin(addIds).pipe(
      switchMap(() => this.GetChannelUsersIds(channelId)),
      tap((e) => console.debug("[AddUsersToChannel]", e))
    );
  }

  public UpdateChannelUsers(channelId:number, users: number[]): Observable<number[]>{
    return this.http.get(this.BASE_URL + 'user_channels', {params: {channelId: channelId}})
      .pipe(
        switchMap(((userChannels:any)=>{
          console.debug("[UpdateChannelUsers].existing", userChannels);
          if(userChannels && userChannels.length)
          {
            const deleteIds = userChannels.map((u_id:any) => this.DeleteUserChannel(u_id.id));
            return forkJoin(deleteIds).pipe(
              tap((e) => console.debug("[UpdateChannelUsers].finishDeleteExisting", e)),
              switchMap(() => this.AddUsersToChannel(channelId, users))
            );
          }
          else
            return this.AddUsersToChannel(channelId, users);
        })),
        catchError(()=>of([]))
      );
  }

  public GetAllUsers(): Observable<User[]>{
    return this.http.get<User[]>(this.BASE_URL + 'users');
  }

}
