import {Component, OnInit} from '@angular/core';
import { HeaderServiceService } from '../../header-service.service';
import io from 'socket.io-client';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-training-cycle-page',
  templateUrl: './training-cycle-page.component.html',
  styleUrls: ['./training-cycle-page.component.scss'],
})
export class TrainingCyclePageComponent implements OnInit{
  constructor(public headerService: HeaderServiceService) {}
  trainingProgressSocket: any;
  ngOnInit() {
    this.headerService
      .setBackground('linear-gradient(to right, #04030F, #04030F)')
      .setBackgroundNavMain('linear-gradient(to right, #2A2E45, #212537)')
      .setBackgroundUserNavButton('linear-gradient(to right, #2A2E45, #212537)')
      .setBackgroundFooter('linear-gradient(to top right, #2A2E45, #212537)')
      .setBackgroundDeleteYes('#5569dd')
      .setBackgroundDeleteClose('#808080')
      .setBackgroundDeleteLr('#5569dd')
      .setTitle('Training cycle')
      .setDescription('Training cycle');

    this.initializeSockets();
  }
  initializeSockets() {
    try {
      this.trainingProgressSocket = io(environment.api_url, {
        query: {
          type: 'training_progress',
        },
        transports: ['websocket'],
      });
      this.trainingProgressSocket.on('connect_error', (err: any) => {
        console.log(`Failed to connect: ${environment.api_url}/socket.io`);
        console.log(err);
      });
    } catch (e) {
      console.log('e => ', e);
    }
  }
}
