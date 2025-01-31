import {Component, input, InputSignal, model, ModelSignal, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {Channel} from "../../model/chat";

@Component({
  selector: 'channels',
  templateUrl: 'channels.component.html',
  imports: [CommonModule, TranslateModule],
  providers: []
})

export class ChannelsComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  Channels: InputSignal<Channel[] | undefined> = input<Channel[]>();
  SelectedChannel: ModelSignal<Channel | undefined> = model<Channel>();

  protected select(item: Channel){
    this.SelectedChannel.set(item);
  }

}
