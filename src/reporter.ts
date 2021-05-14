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
import { EVENTS } from '@reportportal/client-javascript/lib/constants/events';
import stripAnsi from 'strip-ansi';
import { ObjUniversal, ReportPortalConfig, RPItem, StartLaunchRQ, StartTestItemRQ } from './models';
import { getAgentInfo, getCodeRef, getLastItem, getStartLaunchObj } from './utils';
import { LOG_LEVELS, STATUSES, TEST_ITEM_TYPES } from './constants';

interface TestItem {
  id: string;
  name: string;
  status?: string;
}

interface Suite {
  id: string;
  name: string;
  path?: string;
  status?: string;
}

export class Reporter {
  private noColors: boolean;
  private config: ReportPortalConfig;
  private client: RPClient;
  private startTime: number;
  private launchId: string;
  private suites: Suite[];
  private testItems: TestItem[];
  private customLaunchStatus: string;

  constructor(config: ReportPortalConfig) {
    this.noColors = false;
    this.suites = [];
    this.testItems = [];
    this.customLaunchStatus = '';

    const agentInfo = getAgentInfo();

    this.config = config;
    this.client = new RPClient(config, agentInfo);
  }

  registerRPListeners(): void {
    process.on(EVENTS.SET_LAUNCH_STATUS, this.setLaunchStatus.bind(this));
    process.on(EVENTS.SET_STATUS, this.setStatus.bind(this));
  }

  unregisterRPListeners(): void {
    process.off(EVENTS.SET_LAUNCH_STATUS, this.setLaunchStatus.bind(this));
    process.off(EVENTS.SET_STATUS, this.setStatus.bind(this));
  }

  reportTaskStart(startTime: number, userAgents: string[], testCount: number): void {
    this.registerRPListeners();
    this.startTime = startTime;
    const startLaunchObj: StartLaunchRQ = getStartLaunchObj({ startTime }, this.config);

    this.launchId = this.client.startLaunch(startLaunchObj).tempId;
  }

  reportFixtureStart(name: string, path: string, meta: RPItem): void {
    const codeRef = getCodeRef(path, name);
    const startSuiteObj: StartTestItemRQ = {
      name,
      type: TEST_ITEM_TYPES.SUITE,
      description: meta.description,
      attributes: meta.attributes,
      codeRef,
    };
    const suiteId = this.client.startTestItem(startSuiteObj, this.launchId).tempId;
    this.suites.push({ id: suiteId, path, name });
  }

  reportTestStart(name: string, testMeta: RPItem): void {
    const { path, name: suiteName, id: parentId } = getLastItem(this.suites);
    const codeRef = getCodeRef(path, [suiteName, name]);
    const startTestObj: StartTestItemRQ = {
      name,
      type: TEST_ITEM_TYPES.STEP,
      description: testMeta.description,
      attributes: testMeta.attributes,
      codeRef,
    };
    const stepId = this.client.startTestItem(startTestObj, this.launchId, parentId).tempId;

    this.testItems.push({ name, id: stepId });
  }

  reportTestDone(name: string, testRunInfo: any): void {
    const hasError = !!testRunInfo.errs.length;
    const { status: customTestItemStatus, id: testItemId } = this.testItems.find(
      (item) => item.name === name,
    );
    let status: STATUSES | string = STATUSES.PASSED;
    let withoutIssue;
    if (testRunInfo.skipped) {
      status = STATUSES.SKIPPED;
      withoutIssue = this.config.skippedIssue === false;
    } else if (hasError) {
      status = STATUSES.FAILED;
      this.sendLogsOnFail(testRunInfo.errs, testItemId);
    }

    const finishTestItemObj = {
      status: customTestItemStatus || status,
      ...(withoutIssue && { issue: { issueType: 'NOT_ISSUE' } }),
    };
    this.client.finishTestItem(testItemId, finishTestItemObj);
    this.testItems = this.testItems.filter((item) => item.id !== testItemId);
  }

  reportTaskDone(endTime: number, passed: number, warnings: string[]): void {
    this.finishSuites();
    this.client.finishLaunch(this.launchId, {
      endTime,
      ...(this.customLaunchStatus && { status: this.customLaunchStatus }),
    });
    this.launchId = null;
    this.customLaunchStatus = '';
    this.unregisterRPListeners();
  }

  finishSuites(): void {
    this.suites.forEach(({ id, status }) => {
      const finishSuiteObj = (status && { status }) || {};
      this.client.finishTestItem(id, finishSuiteObj);
    });
    this.suites = [];
  }

  sendLogsOnFail(errors: any, testItemId: string): void {
    errors.forEach((error: any) => {
      this.client.sendLog(testItemId, {
        level: LOG_LEVELS.ERROR,
        // @ts-ignore
        message: stripAnsi(this.formatError(error)),
      });
    });
  }

  setLaunchStatus(status: string): void {
    this.customLaunchStatus = status;
  }

  getCurrentSuiteId(): string {
    return getLastItem(this.suites).id;
  }

  getCurrentTestItemId(): string {
    const lastTest = getLastItem(this.testItems);
    return lastTest ? lastTest.id : this.getCurrentSuiteId();
  }

  setStatus({ status }: ObjUniversal): void {
    const testItemId = this.getCurrentTestItemId();
    const suite = this.suites.find(({ id }) => id === testItemId);
    if (suite) {
      suite.status = status;
    } else {
      this.testItems[this.testItems.findIndex((item) => item.id === testItemId)].status = status;
    }
  }
}
