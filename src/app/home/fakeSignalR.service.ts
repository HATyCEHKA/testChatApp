import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {interval, tap} from "rxjs";
import {ChatApiService} from "./chat-api.service";
import {Message} from "../model/chat";
import {Observable} from "rxjs";
import {switchMap, of, from} from "rxjs";
import {filter} from "rxjs";

@Injectable()
export class FakeSignalRService{
  constructor(private http: HttpClient, private chatApiService: ChatApiService){
  }

  subscribeNewMessageFromServer(channelId: number, maxDate:Date):Observable<Message>{
    let lastDate = maxDate.toISOString();
    //console.log("FakeSignalRService", lastDate);
    return interval(1000).pipe(
        switchMap(()=>{
          return this.chatApiService.GetChannelMessages(channelId).pipe(
            switchMap((messages:Message[])=>{
              return from(messages).pipe(
                filter(m=>m.date>lastDate),
                tap((m)=>{
                  if(m.date>lastDate)
                    lastDate = m.date;
                })
              )
            })
          )
        })
      );
  }

}
