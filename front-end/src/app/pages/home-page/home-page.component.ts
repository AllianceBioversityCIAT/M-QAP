import {Component, Input} from '@angular/core';
import {HeaderServiceService} from '../../header-service.service';
import {Chart} from 'angular-highcharts';
import {StatisticsService} from 'src/app/services/statistics.service';
import {Statistics} from 'src/app/share/types/statistics.model.type';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject} from 'rxjs';
import {LoaderService} from 'src/app/services/loader.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  isAdmin = false;
  averageChart!: Chart;
  countChart!: Chart;
  statistics!: Statistics;

  apiYear: number = (new Date()).getFullYear();
  @Input() apiYearSubject = new BehaviorSubject<number>((new Date()).getFullYear());
  apiCounters: any = [];
  wosUsageOverTimeChart!: Chart;
  apiUsageOverTimeChart!: Chart;
  private loaders: string[] = [];

  constructor(
    public headerService: HeaderServiceService,
    public router: Router,
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private apiKeysService: ApiKeysService,
    private loaderService: LoaderService,
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

    this.router.events.subscribe(() => {
      this.isAdmin = this.authService.isAdmin();
      this.getApiStatistics();
    });
    this.getAiStatistics();
  }

  getAiStatistics() {
    this.openLoader('getAiStatistics');
    this.statisticsService.find().subscribe((response) => {
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

      this.closeLoader('getAiStatistics');
    });
  }

  getApiStatistics(year: number = this.apiYear) {
    this.openLoader('getApiStatistics');
    this.apiYear = year;
    this.apiYearSubject.next(year);
    this.apiKeysService.getStatistics(year).subscribe((response) => {

      this.apiYear = response.year;

      this.apiCounters = [
        {
          title: 'API-keys',
          toolTip: 'Total number of API-keys',
          icon: 'api',
          count: response.apiKeys.length,
        }, {
          title: 'Active API-keys',
          toolTip: 'Total number of active API-keys',
          icon: 'webhook',
          count: response.activeApiKeys,
          percentage: response.activeApiKeysPercentage,
        }, {
          title: 'API requests',
          toolTip: 'Total number of API requests',
          icon: 'data_usage',
          count: response.apiRequests,
        }, {
          title: 'DOIs',
          toolTip: 'Total number of unique processed DOIs',
          icon: 'link',
          count: response.dois,
        }, {
          title: 'Available WoS quota',
          toolTip: 'Total available WoS quota',
          icon: 'electric_meter',
          count: response.remainingWosQuota,
        }, {
          title: 'Assigned WoS quota',
          toolTip: 'Total assigned WoS quota',
          icon: 'assignment_add',
          count: response.wosQuota,
        }, {
          title: 'Assigned available WoS quota',
          toolTip: 'Total assigned available WoS quota',
          icon: 'event_available',
          count: response.wosAvailable,
          percentage: response.wosAvailablePercentage,
        }, {
          title: 'Used WoS quota',
          toolTip: 'Total used WoS quota',
          icon: 'event_busy',
          count: response.wosRequests,
          percentage: response.wosUsedPercentage,
        }
      ];

      this.wosUsageOverTimeChart = new Chart({
        tooltip: {
          pointFormat: '<span style="color:{series.color}">- {series.name} ({point.y})</span><br/>',
          valueDecimals: 0,
          split: false,
          shared: true
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
            text: 'Month',
          },
          categories: response.chartsData.categories
        },
        series: response.chartsData.wosUsageOverTime,
        legend: {
          labelFormatter: function() {
            const sum = (this as any).yData.reduce(function(pv: any, cv: any) { return pv + cv; }, 0);
            return `<span style="color: ${this.color}">- ${this.name} (${sum})</span>`
          }
        },
      });

      this.apiUsageOverTimeChart = new Chart({
        tooltip: {
          pointFormat: '<span style="color:{series.color}">- {series.name} ({point.y})</span><br/>',
          valueDecimals: 0,
          split: false,
          shared: true
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
            text: 'Month',
          },
          categories: response.chartsData.categories
        },
        series: response.chartsData.apiUsageOverTime,
        legend: {
          labelFormatter: function() {
            const sum = (this as any).yData.reduce(function(pv: any, cv: any) { return pv + cv; }, 0);
            return `<span style="color: ${this.color}">- ${this.name} (${sum})</span>`
          }
        },
      });

      this.closeLoader('getApiStatistics');
    });
  }

  openLoader(loader: string) {
    if(this.loaders.length === 0) {
      this.loaderService.open();
    }
    this.loaders.push(loader);
  }

  closeLoader(loader: string) {
    this.loaders.splice(this.loaders.indexOf(loader), 1);
    if (this.loaders.length === 0) {
      this.loaderService.close();
    }
  }
}
