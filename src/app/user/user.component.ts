import {Component, OnInit, signal} from '@angular/core';
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

  isEditingPass = signal(false);

  ngOnInit() {
  }

  changeLang(e:any){
    this.translate.setDefaultLang(e.value);
    this.translate.use(e.value);
  }

  do(user: any, pass: any){
    if(!user && !pass)
      return;

    this.auth_service.updateUser(user, pass);
  }
}
