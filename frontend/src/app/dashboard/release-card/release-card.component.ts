import { Component, OnInit, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CardConfig, UtilizationDonutChartConfig, DonutChartConfig, EmptyStateConfig } from 'patternfly-ng';
import { ReleaseSummary } from 'src/app/release/shared/release.model';
import { PlatformSummary } from 'src/app/shared/platform.model';

@Component({
    selector: 'app-release-card',
    templateUrl: './release-card.component.html',
    styleUrls: ['./release-card.component.less']
})
export class ReleaseCardComponent implements OnInit {

    @Input()
    item: ReleaseSummary;

    config: CardConfig;

    packageConfig: UtilizationDonutChartConfig;
    issueConfig: DonutChartConfig;
    issueData: any[] = [
        ['Release', 15],
        ['Patch', 5]
    ];

    qualificationConfig: DonutChartConfig;
    qualificationData: any[] = this.generateEmptyData();
    keyUserConfig: DonutChartConfig;
    keyUserData: any[] = this.generateEmptyData();
    pilotConfig: DonutChartConfig;
    pilotData: any[] = this.generateEmptyData();
    productionConfig: DonutChartConfig;
    productionData: any[] = this.generateEmptyData();

    emptyStateConfig: EmptyStateConfig;

    maxPatch: number;

    chartHeight = 100;
    
    patchThreshold = 50;

    constructor(private router: Router) { }

    ngOnInit() {
        this.config = {
            // noPadding: true,
            // topBorder: false
        } as CardConfig;

        // this.packageConfig.total = this.item.patchCount;
        // this.packageConfig.used = this.item.packagePatched;
        // this.packageConfig.thresholds = {'warning': this.packageConfig.total=this.item.patchCount-1,
        //  'error': this.packageConfig.total=this.item.patchCount-3};
        this.maxPatch = this.item.patchCount > this.patchThreshold ? this.item.patchCount : this.patchThreshold;
        this.packageConfig = {
            chartId: 'exampleUtilizationDonut' + this.item.id,
            //centerLabelFormat: 'txt-func',
            centerLabelFormat: 'none',
            centerLabel: ' ',
            data: {
                onclick: (data, element) => {
                    this.router.navigate(['/release', this.item.versionNumber, 'PATCHES']);
                }
            },
            legend: {
                show: false
            },

            outerLabelAlignment: 'right',
            thresholds: { 'warning': 40, 'error': 80 },
            total: this.maxPatch,
//            units: 'patch',
            used: this.item.patchCount
        } as UtilizationDonutChartConfig;
        // this.packageConfig.centerLabelFn = () => {
        //     return {
        //         title: this.packageConfig.used,
        //         subTitle: 'Patches'
        //     };
        // };

        this.issueConfig = {
            chartId: 'IssueDonut' + this.item.id,
            colors: {
                release: '#3f9c35', // green
                patch: '#ec7a08'     // orange
            },
            centerLabel: ' ',
            chartHeight: 100,
            data: {
                names: {
                    available: 'Available',
                    validated: 'Deployed and validated',
                    deployed: 'Deployed and need validation',
                    missing: 'Not yet deployed'
                }
            },
            legend: {
                show: false
            }
        } as DonutChartConfig;

        this.qualificationConfig = this.geratateConfig('qualification', this.item.qualification.deployed,
            this.item.qualification.undeployed);
        if (this.item.qualification.deployed && !this.item.qualification.undeployed) {
            this.qualificationData = this.generateData(this.item.qualification);
        }

        this.keyUserConfig = this.geratateConfig('keyUser', this.item.keyUser.deployed, this.item.keyUser.undeployed);
        if (this.item.keyUser.deployed && !this.item.keyUser.undeployed) {
            this.keyUserData = this.generateData(this.item.keyUser);
        }

        this.pilotConfig = this.geratateConfig('pilot', this.item.pilot.deployed, this.item.pilot.undeployed);
        if (this.item.pilot.deployed && !this.item.pilot.undeployed) {
            this.pilotData = this.generateData(this.item.pilot);
        }

        this.productionConfig = this.geratateConfig('production', this.item.production.deployed, this.item.production.undeployed);
        if (this.item.production.deployed && !this.item.production.undeployed) {
            this.productionData = this.generateData(this.item.production);
        }

        this.emptyStateConfig = {
            iconStyleClass: 'pficon-ok',
            info: 'This version has no patch... yet!',
            title: 'No Patch'
        } as EmptyStateConfig;
    }

    generateData(summary: PlatformSummary): any[] {
        return [
            ['missing', this.item.patchCount - summary.deployedPatchCount],
            ['deployed', summary.deployedPatchCount - summary.validedPatchCount],
            ['validated', summary.validedPatchCount]
        ];

    }

    generateEmptyData(): any[] {
        return [];

    }

    geratateConfig(platform: string, isDeployed: boolean, isUndeployed: boolean): DonutChartConfig {
        const chartId = platform + 'Donut' + this.item.id;
        return {
            chartId: chartId,
            colors: {
                available: '#bbbbbb',     // grey
                validated: '#3f9c35', // green
                deployed: '#ec7a08',     // orange
                missing: '#cc0000'      // red
            },
            centerLabel: ' ',
            chartHeight: this.chartHeight,
            data: {
                names: {
                    available: 'Available',
                    validated: 'Deployed and validated',
                    deployed: 'Deployed and need validation',
                    missing: 'Not yet deployed'
                },
                empty: {
                    label: {
                        text: !isDeployed ? 'Not deployed' : isUndeployed ? 'Undeployed' : 'No Patch'
                    }
                },
                onclick: (data, element) => {
                    const extra = {} as NavigationExtras;
                    let filterCriterium = '';
                    switch (data.id) {
                    case 'missing':
                        filterCriterium = 'missingOn_';
                        break;
                    case 'deployed':
                        filterCriterium = 'toTestOn_';
                        break;
                    case 'validated':
                        filterCriterium = 'deployedOn_';
                        break;
                    }
                    if ( filterCriterium !== '' ) {
                        extra.queryParams = {
                            'filter': [filterCriterium + platform, 'onlyDeployed_onlyDeployed']
                        };
                    }
                    this.router.navigate(['/release', this.item.versionNumber, 'PATCHES'], extra);
                }
            },
            legend: {
                show: false
            }
            ,
            tooltip: {
                position: function (data, width, height, element) {
                    const chartOffsetX = document.querySelector('#' + chartId).getBoundingClientRect().left;
                    const chartWidth = document.querySelector('#' + chartId).getBoundingClientRect().width;
                    const graphOffsetX = document.querySelector('#' + chartId + ' g.c3-axis-y')
                        .getBoundingClientRect().right;
                    const tooltipWidth = document.querySelector('#' + chartId + ' .c3-tooltip-container')
                        .getBoundingClientRect().width;
                    const cy = element.getAttribute('cy');
                    const x = Math.floor(chartWidth / 2) - Math.floor(tooltipWidth / 2);
                    const position = { top: 0 , left: 0 };
                    switch (platform) {
                        case 'qualification':
                        position.left = 0;
                        position.top = cy - height;
                        break;
                        case 'keyUser':
                        position.left = x;
                        position.top = cy - height;
                        break;
                        case 'pilot':
                        position.left =  graphOffsetX - chartOffsetX - Math.floor(tooltipWidth / 2);
                        position.top = cy - height;
                        break;
                        case 'production':
                        position.left =  graphOffsetX - chartOffsetX - Math.floor(tooltipWidth / 2);
                        position.top = cy;
                        break;
                    }
                    return position; 
                }
            }
        } as DonutChartConfig;
    }
}
