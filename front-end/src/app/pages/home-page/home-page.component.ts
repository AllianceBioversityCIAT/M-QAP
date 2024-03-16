import {Component} from '@angular/core';
import {HeaderServiceService} from '../../header-service.service';
import {Chart} from 'angular-highcharts';
import {StatisticsService} from 'src/app/services/statistics.service';
import {Statistics} from 'src/app/share/types/statistics.model.type';
import {LoaderService} from 'src/app/services/loader.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  averageChart!: Chart;
  countChart!: Chart;
  statistics!: Statistics;

  constructor(
    public headerService: HeaderServiceService,
    private statisticsService: StatisticsService,
    private loaderService: LoaderService,
    private snackBarService: SnackBarService,
  ) {
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

    this.getAiStatistics();
  }

  getAiStatistics() {
    this.loaderService.open();
    this.statisticsService.find()
      .subscribe({
        next: (response) => {
          this.averageChart = new Chart({
            tooltip: {
              formatter: function () {
                return `
            <div>
              <p>The average confidence rate for </p>
              <br>
              <p><b> Cycle ${this.x} </b> is <b>${this.y?.toFixed(2)} %</b></p>
            </div>`;
              },
            },
            chart: {
              type: 'line',
            },
            title: {
              text: '',
            },
            credits: {
              enabled: false,
            },
            yAxis: {
              title: {
                text: 'Average',
              },
            },
            xAxis: {
              title: {
                text: 'Cycle',
              },
              tickPositioner: function () {
                return (this.series[0] as any)?.processedXData;
              },
            },
            series: [
              {
                name: 'Average confidence rate / Cycle',
                data: response.averagePredictionPerCycle.map((i) => ({
                  name: 'Average',
                  y: i.predictions_average,
                  x: i.cycle_id,
                })),
              } as any,
            ],
          });
          this.countChart = new Chart({
            tooltip: {
              formatter: function () {
                return `
            <div>
              <p >The count of predictions for </p>
              <br>
              <p><b> Cycle ${this.x} </b> is <b>${this.y}</b></p>
            </div>`;
              },
            },
            chart: {
              type: 'line',
            },
            title: {
              text: '',
            },
            credits: {
              enabled: false,
            },
            yAxis: {
              title: {
                text: 'Count',
              },
            },
            xAxis: {
              title: {
                text: 'Cycle',
              },
              tickPositioner: function () {
                return (this.series[0] as any)?.processedXData;
              },
            },
            series: [
              {
                name: 'Predictions count / Cycle',
                data: response.predictionCountPerCycle.map((i) => ({
                  y: i.predictions_count,
                  x: i.cycle_id,
                })),
              } as any,
            ],
          });
          this.statistics = response;

          this.loaderService.close();
        },
        error: (error) => {
          this.loaderService.close();
          this.snackBarService.error(error.error.message);
        },
      });
  }
}
