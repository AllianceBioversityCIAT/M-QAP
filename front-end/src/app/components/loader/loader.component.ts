import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { fadeIn, fadeOut } from '../../animation';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [fadeIn, fadeOut],
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}
