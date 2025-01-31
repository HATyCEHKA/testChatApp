import {Injectable} from "@angular/core";
import {User} from "../model/user";
import {Observable, switchMap, of,map, tap} from "rxjs";
import {Channel, Message} from "../model/chat";
import {HttpClient} from "@angular/common/http";
import {catchError,} from "rxjs/operators";


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

  public GetChannelUsers(channelId:number): Observable<User[]>{
    return this.http.get(this.BASE_URL + 'user_channels', {params: {channelId: channelId}})
      .pipe(
        switchMap(((userChannels:any)=>{
          if(!userChannels || !userChannels.length)
            return of([]);
          let userIds = userChannels.map((i:any)=>i.userId.toString());
          return this.http.get<User[]>(this.BASE_URL + 'users').pipe(
            map((users:User[])=>{
              return users.filter((el:User)=> userIds.indexOf(el.id.toString())>=0)
            }),
            catchError(()=>of([]))
            );
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

}
