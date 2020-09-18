/*
 *  Copyright 2020 EPAM Systems
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import RPClient from '@reportportal/client-javascript';
import {ReportPortalConfig, StartLaunchRQ, StartTestItemRQ} from './models';
import {getAgentInfo, getStartLaunchObj} from './utils';
import {TEST_ITEM_TYPES} from "./constants";

export class Reporter {
  private noColors: boolean;
  private config: ReportPortalConfig;
  private client: RPClient;
  private startTime: number;
  private launchId: string;
  private suiteIds: string[];

  constructor(config: ReportPortalConfig) {
    this.noColors = true;
    this.suiteIds = [];

    const agentInfo = getAgentInfo();

    this.config = config;
    this.client = new RPClient(config, agentInfo);
  };

  reportTaskStart(startTime: number, userAgents: any, testCount: number) {
    this.startTime = startTime;
    const startLaunchObj: StartLaunchRQ = getStartLaunchObj({ startTime }, this.config);
    console.log(testCount);

    this.launchId = this.client.startLaunch(startLaunchObj).tempId;
  }

  reportFixtureStart(name: string, path: string): void {
    const startSuiteObj: StartTestItemRQ = {
      name,
      type: TEST_ITEM_TYPES.SUITE,
    };
    const suiteId = this.client.startTestItem(startSuiteObj, this.launchId).tempId;
    this.suiteIds.push(suiteId);
  }

  reportTestStart(name: string, testMeta: any): void {
  }

  reportTestDone(name: string, testRunInfo: any): void {
  }

  reportTaskDone(endTime: number, passed: any, warnings: any): void {
    this.finishSuites();
    this.client.finishLaunch(this.launchId, { endTime })
  }

  finishSuites(): void {
    this.suiteIds.forEach((suiteId) => {
      this.client.finishTestItem(suiteId, {});
    });
  }
}
