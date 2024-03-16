import {Component, Input} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {BehaviorSubject} from 'rxjs';
import {HeaderServiceService} from 'src/app/header-service.service';
import {ApiKeysService} from 'src/app/services/api-keys.service';
import {LoaderService} from 'src/app/services/loader.service';
import {SnackBarService} from 'src/app/share/snack-bar/snack-bar.service';

@Component({
  selector: 'app-api-usage',
  templateUrl: './api-usage.component.html',
  styleUrls: ['./api-usage.component.scss']
})
export class ApiUsageComponent {
  apiYear: number = (new Date()).getFullYear();
  @Input() apiYearSubject = new BehaviorSubject<number>((new Date()).getFullYear());
  apiCounters: any = [];
  wosUsageOverTimeChart!: Chart;
  apiUsageOverTimeChart!: Chart;

  ngOnInit() {
    this.headerService
      .setBackground('linear-gradient(to right, #04030F, #04030F)')
      .setBackgroundNavMain('linear-gradient(to right, #2A2E45, #212537)')
      .setBackgroundUserNavButton('linear-gradient(to right, #2A2E45, #212537)')
      .setBackgroundFooter('linear-gradient(to top right, #2A2E45, #212537)')
      .setBackgroundDeleteYes('#5569dd')
      .setBackgroundDeleteClose('#808080')
      .setBackgroundDeleteLr('#5569dd')
      .setTitle('API usage')
      .setDescription('API usage');
    this.getApiStatistics();
  }

  constructor(
    public headerService: HeaderServiceService,
    private apiKeysService: ApiKeysService,
    private loaderService: LoaderService,
    private snackBarService: SnackBarService,
  ) {
  }

  getApiStatistics(year: number = this.apiYear) {
    this.loaderService.open();
    this.apiYear = year;
    this.apiYearSubject.next(year);
    this.apiKeysService.getStatistics(year)
      .subscribe({
        next: (response) => {
          this.apiYear = response.year;

          this.apiCounters = [
            {
              title: 'API-keys',
              toolTip: 'Total number of API-keys',
              icon: 'api',
              count: response.apiKeys,
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

          this.loaderService.close();
        },
        error: (error) => {
          this.loaderService.close();
          this.snackBarService.error(error.error.message);
        },
      });
  }
}
