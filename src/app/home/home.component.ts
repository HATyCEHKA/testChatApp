import {Component, inject, OnInit, signal, TemplateRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {AuthService} from "../login/auth.service";
import {ChatApiService} from "./chat-api.service";
import {ChannelsComponent} from "./channels/channels.component";
import {ChatStore} from "./chat.store";
import {MessagesComponent} from "./messages/messages.component";
import {FormsModule} from "@angular/forms";
import {FakeSignalRService} from "./fakeSignalR.service";
import {Router} from "@angular/router";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {SelectedUsersComponent} from "./selected_users/selected_users.component";


@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
  imports: [CommonModule, FormsModule, TranslateModule, ChannelsComponent, MessagesComponent, SelectedUsersComponent],
  providers: [ChatApiService, ChatStore, FakeSignalRService]
})

export class HomeComponent implements OnInit {
  constructor(protected auth_service:AuthService, private router: Router, private modalService: BsModalService, private chatApiService:ChatApiService) {}

  protected readonly store = inject(ChatStore);
  protected messageText = signal<string>("");
  protected isChannelsLoading = signal(false);
  protected modalRef?: BsModalRef;

  protected allUsers = this.chatApiService.GetAllUsers();
  //protected selectedUsers: User[] = [];
  protected selectedUsers: number[] = [];

  ngOnInit() {}


  protected selectChannel(e:any){
    this.store.selectChannel(e);
    setTimeout(()=>this.scrollDown(), 1000);
  }

  protected addMessage(){
    let s = this.messageText();
    if(!s)
      return;

    this.store.addChannelMessage({userId:this.auth_service.currentUserId, content: s});
    this.messageText.set("");
    setTimeout(()=>this.scrollDown(), 300);
  }

  protected keyDown(event:any){
    if (event.key == 'Enter')
      this.addMessage();
  }

  protected scrollDown(){
    let container =  document.getElementById('scrollMe');
    if(container)
      container.scrollTop = container.scrollHeight;
  }

  protected openSettings(){
    this.router.navigateByUrl('/user');
  }

  protected openModal(template: TemplateRef<void>) {
    this.selectedUsers = this.store.selectedChannelState.users().map(u=>u.id);
    this.modalRef = this.modalService.show(template);
  }

  protected updateUsers(){
    this.store.updateChannelUsers(this.selectedUsers);
    this.modalRef?.hide();
  }
}
