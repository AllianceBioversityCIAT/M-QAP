import {NgModule} from '@angular/core';
import {PageBaseModule} from '../page-base.module';
import {AuthComponent} from './auth.component';
import {AuthService} from './auth.service';
import {AuthRoutingModule} from './auth-routing.module';

@NgModule({
  declarations: [AuthComponent],
  imports: [PageBaseModule, AuthRoutingModule],
  providers: [AuthService]
})
export class AuthModule {
}
