import {Component, Inject} from '@angular/core';
import {HeaderServiceService} from '../../header-service.service';
import {DeleteConfirmDialogComponent} from 'src/app/share/delete-confirm-dialog/delete-confirm-dialog.component';
import {AuthService} from 'src/app/pages/auth/auth.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {User} from 'src/app/share/types/user.model.type';
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    public headerService: HeaderServiceService,
    private authService: AuthService,
    public router: Router,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.headerService.setBackground('#0f212f');
  }

  user: User | null = null;
  loading = true;
  isAdmin = false;

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.user = this.authService.getLoggedInUser();
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout() {
    this.dialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          title: 'Logout',
          message: 'Are you sure you want to logout?',
        },
      })
      .afterClosed()
      .subscribe((dialogResult: boolean) => {
        if (dialogResult) {
          localStorage.removeItem('access_token');
          this.user = null;
          this.document.location.href = '/';
        }
      });
  }

  login() {
    if (this.user) this.logout();
    else {
      this.authService.goToLogin();
    }
  }
}
