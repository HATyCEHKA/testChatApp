import {Component, input, InputSignal, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {Message} from "../../model/chat";
import {User} from "../../model/user";

@Component({
  selector: 'messages',
  templateUrl: 'messages.component.html',
  imports: [CommonModule, TranslateModule],
  providers: []
})

export class MessagesComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  Messages: InputSignal<Message[] | undefined> = input<Message[]>();
  Users: InputSignal<User[] | null | undefined > = input<User[]|null>();


  protected getUserName(id:Number){
    let users = this.Users();
    if(!users) return id;
    let user =  users.find(u=>u.id==id);
    return user? user.username : id;
  }

  protected getLocalTime(timeString:string){
    let date = Date.parse(timeString);
    if(!isNaN(date))
      return  new Date(date).toLocaleString();
    return timeString;
  }

}
