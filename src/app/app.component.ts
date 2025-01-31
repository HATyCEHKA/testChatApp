import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LangChangeEvent, TranslateModule, TranslateService} from "@ngx-translate/core";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TestChatApp';

  constructor(private translate: TranslateService) {
    //this.translate.addLangs(['ru', 'en']);

    this.translate.onLangChange.subscribe((event: LangChangeEvent ) => {
      //this.language = event.lang;
      localStorage.setItem('locale', event.lang);
    });

    var locale = localStorage.getItem('locale');
    if(!locale) locale ="ru";
    this.translate.setDefaultLang(locale);
    this.translate.use(locale);
  }
}
