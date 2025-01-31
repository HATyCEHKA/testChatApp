import { Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {HomeComponent} from "./home/home.component";
import {UserComponent} from "./user/user.component";
import {AuthGuard, NotAuthGuard} from "./auth.guard";

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate:[NotAuthGuard], title: 'TestChatApp - Login' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], title: 'TestChatApp - Home' },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard], title: 'TestChatApp - User' },

  { path: '', redirectTo: 'home',  pathMatch: 'full' },
];
