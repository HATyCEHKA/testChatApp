import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../login/auth.service";

@Component({
  selector: 'user',
  templateUrl: 'user.component.html',
  styleUrls: ['user.component.css'],
  imports: [CommonModule, FormsModule, TranslateModule]
})

export class UserComponent implements OnInit {

  constructor(protected auth_service:AuthService, protected translate:TranslateService) {
    translate.currentLang
  }

  ngOnInit() {
  }

  changeLang(e:any){
    this.translate.use(e.value);
  }
}
