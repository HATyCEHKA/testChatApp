import {
  Component,
  OnInit,
  model,
  input,
  ModelSignal, InputSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Observable} from "rxjs";
import {FormsModule} from "@angular/forms";
import {tap, pipe} from "rxjs";
import {User} from "../../model/user";

@Component({
  selector: 'selected_users',
  templateUrl: 'selected_users.component.html',
  imports: [CommonModule, FormsModule],
  providers: []
})

export class SelectedUsersComponent implements OnInit {
  constructor() {  }

  Users: InputSignal<User[]|null> = input.required();
  SelectedUsers: ModelSignal<number[]> = model.required();
  UnSelectableUserId = input();

  ngOnInit() {  }

  protected select(user:User){
    if(this.SelectedUsers().indexOf(user.id)>=0)
    {
      if(!this.UnSelectableUserId() || user.id!=this.UnSelectableUserId())
        this.SelectedUsers.update((users:number[]) => users.filter((u)=>u!=user.id));
    }
    else
      this.SelectedUsers.update((users:number[]) => [...users, user.id]);
  }

}

