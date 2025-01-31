import {Component, OnInit} from '@angular/core';
import {TranslateModule} from "@ngx-translate/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {AuthService} from "./auth.service";

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  imports: [CommonModule, FormsModule, TranslateModule]
})

export class LoginComponent implements OnInit {
  constructor(protected auth_service:AuthService) {  }

  public username:string="";
  public password:string="";

  ngOnInit() { }

  login() {
    if(this.password && this.username)
      this.auth_service.logIn(this.username, this.password);
  }

  keyDown(event:any){
    if (event.key == 'Enter')
      this.login();
  }
}
