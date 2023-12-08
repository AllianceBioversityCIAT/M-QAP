import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HeaderServiceService } from './header-service.service';
import { LoaderService } from './services/loader.service';
import { state } from '@angular/animations';
import { delay } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  overFlowHidden = false;
  constructor(
    public headerService: HeaderServiceService,
    public loaderService: LoaderService
  ) {
    const faviconTag = document.getElementById('faviconTag') as unknown as {
      href: string;
    };

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      faviconTag.href = '/assets/shared-image/mask-group.svg';
    } else {
      faviconTag.href = '/assets/shared-image/cgiar-logo.png';
    }
  }
  ngAfterViewInit(): void {
    this.loaderService.state$
      .pipe(delay(0))
      .subscribe((state) => (this.overFlowHidden = state));
  }

  ngOnInit() {
    this.headerService
      .setBackground('linear-gradient(to right, #04030F, #04030F)')
      .setBackgroundNavMain('linear-gradient(to right, #2A2E45, #212537)')
      .setBackgroundUserNavButton('linear-gradient(to right, #2A2E45, #212537)')
      .setBackgroundFooter('linear-gradient(to top right, #2A2E45, #212537)')
      .setBackgroundDeleteYes('#5569dd')
      .setBackgroundDeleteClose('#808080')
      .setBackgroundDeleteLr('#5569dd')
      .setTitle('Home')
      .setDescription('Home');
  }
}
