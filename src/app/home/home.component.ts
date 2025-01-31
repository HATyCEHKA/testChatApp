import {Component, inject, input, model, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../login/auth.service";
import {ChatApiService} from "./chat-api.service";
import {ChannelsComponent} from "./channels/channels.component";
import {ChatStore} from "../store/chat.store";
import {MessagesComponent} from "./messages/messages.component";
import {FormsModule} from "@angular/forms";
import {FakeSignalRService} from "./fakeSignalR.service";
import {Router} from "@angular/router";

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
  imports: [CommonModule, FormsModule, TranslateModule, ChannelsComponent, MessagesComponent],
  providers: [ChatApiService, ChatStore, FakeSignalRService]
})

export class HomeComponent implements OnInit {
  constructor(protected auth_service:AuthService, private router: Router,) { }

  protected readonly store = inject(ChatStore);
  protected messageText = signal<string>("");

  ngOnInit() {
    this.store.loadChannels(this.auth_service.currentUserId);
  }

  selectChannel(e:any){
    this.store.selectChannel(e);
    setTimeout(()=>this.scrollDown(), 1000);
  }

  addMessage(){
    let s = this.messageText();
    if(!s)
      return;

    this.store.addChannelMessage({userId:this.auth_service.currentUserId, content: this.messageText()});
    this.messageText.set("");
    setTimeout(()=>this.scrollDown(), 300);
  }

  keyDown(event:any){
    if (event.key == 'Enter')
      this.addMessage();
  }

  scrollDown(){
    let container =  document.getElementById('scrollMe');
    if(container)
      container.scrollTop = container.scrollHeight;
  }

  openSettings(){
    this.router.navigateByUrl('/user');
  }
}
