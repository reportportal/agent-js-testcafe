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
import { ReportPortalConfig, StartLaunchRQ } from './models';
import { getAgentInfo, getStartLaunchObj } from './utils';

export class Reporter {
  private noColors: boolean;
  private config: ReportPortalConfig;
  private client: RPClient;
  private startTime: number;
  private launchId: string;

  constructor(config: ReportPortalConfig) {
    this.noColors = true;

    const agentInfo = getAgentInfo();

    this.config = config;
    this.client = new RPClient(config, agentInfo);
  };

  reportTaskStart(startTime: number, userAgents: any, testCount: number) {
    this.startTime = startTime;
    const launchObj = {
      attributes: this.config.attributes,
      description: this.config.description,
      startTime: new Date(startTime).valueOf(),
    };
    const startLaunchObj: StartLaunchRQ = getStartLaunchObj(launchObj);

    this.launchId = this.client.startLaunch(startLaunchObj).tempId;
  }

  reportFixtureStart(name: string, path: string): void {
  }

  reportTestStart(name: string, testMeta: any): void {
  }

  reportTestDone(name: string, testRunInfo: any): void {
  }

  reportTaskDone(endTime: number, passed: any, warnings: any): void {
    this.client.finishLaunch(this.launchId, {})
  }

  private indentString(str: any, number: number): void {
    return undefined;
  }
}
