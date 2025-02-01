import {Component, OnInit, OutputRef, OutputEmitterRef, TemplateRef, signal} from '@angular/core';
import {inject, output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {Channel} from "../../model/chat";
import {ChannelsStore} from "./channels.store";
import {ChatApiService} from "../chat-api.service";
import {FakeSignalRService} from "../fakeSignalR.service";
import {AuthService} from "../../login/auth.service";
import {outputFromObservable, toObservable,} from '@angular/core/rxjs-interop';
import {BsModalRef, BsModalService, ModalModule} from "ngx-bootstrap/modal";
import {FormsModule} from "@angular/forms";
import {document} from "ngx-bootstrap/utils";
import {tap, pipe} from "rxjs";

@Component({
  selector: 'channels',
  templateUrl: 'channels.component.html',
  imports: [CommonModule, FormsModule, TranslateModule, ModalModule],
  providers: [ChannelsStore, ChatApiService, FakeSignalRService]
})

export class ChannelsComponent implements OnInit {
  constructor(private auth_service:AuthService, private modalService: BsModalService) {  }

  protected readonly store = inject(ChannelsStore);
  public ChannelSelected: OutputEmitterRef<Channel> = output<Channel>();
  public IsLoadingChanged: OutputRef<boolean> = outputFromObservable(toObservable(this.store.isLoading));
  protected modalRef?: BsModalRef;
  protected newChannelName = signal<string>("");

  ngOnInit() {
    this.store.loadChannels(this.auth_service.currentUserId);
    this.modalService.onShown.pipe(tap(() => this.onModalShown(document))).subscribe();
  }

  protected select(item: Channel){
    this.ChannelSelected.emit(item);
    this.store.selectChannel(item);
  }

  protected addChannel(){
    let name = this.newChannelName();
    if(!name) return;

    this.store.addChannel({userId: this.auth_service.currentUserId, channelName: name});
    this.modalRef?.hide();
  }

  protected openModal(template: TemplateRef<void>) {
    this.newChannelName.set("");
    this.modalRef = this.modalService.show(template);
  }

  protected keyDown(event:any){
    if (event.key == 'Enter')
      this.addChannel();
  }

 protected onModalShown(e:any){
    if(e) {
      var t = e.querySelector('[autofocus]');
      if(t) {
        if (t.select)
          t.select();
        t.focus();
      }
    }
  }

}

