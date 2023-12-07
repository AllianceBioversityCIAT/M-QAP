import { AfterViewInit, Component, ElementRef, Renderer2 } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { fadeIn, fadeOut } from '../../animation';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [fadeIn, fadeOut],
})
export class LoaderComponent implements AfterViewInit {
  constructor(
    private elem: ElementRef,
    private render: Renderer2,
    public loaderService: LoaderService
  ) {}

  ngAfterViewInit() {
    const element = this.elem.nativeElement;
    const circle = element.querySelector('circle');
    console.log(circle);
    this.render.setProperty(circle, 'stroke', '#ffffff');
  }
}
