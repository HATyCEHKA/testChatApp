import {Component, input, InputSignal, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {Message} from "../../model/chat";

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

}
