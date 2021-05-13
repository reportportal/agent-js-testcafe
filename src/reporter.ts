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
import stripAnsi from 'strip-ansi';
import { EVENTS } from '@reportportal/client-javascript/lib/constants/events';
import { ReportPortalConfig, StartLaunchRQ, StartTestItemRQ, RPItem } from './models';
import { getAgentInfo, getLastItem, getStartLaunchObj, getCodeRef } from './utils';
import { LOG_LEVELS, STATUSES, TEST_ITEM_TYPES } from './constants';

interface TestItem {
  id: string;
  name: string;
  testCaseId?: string;
}

export class Reporter {
  private noColors: boolean;
  private config: ReportPortalConfig;
  private client: RPClient;
  private startTime: number;
  private launchId: string;
  private suiteIds: string[];
  private testItems: TestItem[];
  private testData: { [name: string]: string };

  constructor(config: ReportPortalConfig) {
    this.noColors = false;
    this.suiteIds = [];
    this.testItems = [];
    this.testData = {};

    const agentInfo = getAgentInfo();

    this.config = config;
    this.client = new RPClient(config, agentInfo);
  }

  registerRPListeners(): void {
    process.on(EVENTS.SET_TEST_CASE_ID, this.setTestCaseId.bind(this));
  }

  getCurrentSuiteId(): string {
    return getLastItem(this.suiteIds);
  }

  getCurrentTestItemId(): string {
    const lastTest = getLastItem(this.testItems);
    return lastTest ? lastTest.id : this.getCurrentSuiteId();
  }

  setTestCaseId({ testCaseId }: { testCaseId: string }): void {
    const testItemId = this.getCurrentTestItemId();
    const lastTest = getLastItem(this.testItems);
    this.suiteIds.includes(testItemId)
      ? (this.testData[testItemId] = testCaseId)
      : (lastTest.testCaseId = testCaseId);
  }

  reportTaskStart(startTime: number, userAgents: any, testCount: number): void {
    this.registerRPListeners();
    this.startTime = startTime;
    const startLaunchObj: StartLaunchRQ = getStartLaunchObj({ startTime }, this.config);

    this.launchId = this.client.startLaunch(startLaunchObj).tempId;
  }

  reportFixtureStart(name: string, path: string, meta: RPItem): void {
    this.testData = { ...this.testData, path, suiteName: name };
    const codeRef = getCodeRef(path, name);
    const startSuiteObj: StartTestItemRQ = {
      name,
      type: TEST_ITEM_TYPES.SUITE,
      description: meta.description,
      attributes: meta.attributes,
      codeRef,
    };
    const suiteId = this.client.startTestItem(startSuiteObj, this.launchId).tempId;
    this.suiteIds.push(suiteId);
  }

  reportTestStart(name: string, testMeta: RPItem): void {
    const { path, suiteName } = this.testData;
    const codeRef = getCodeRef(path, [suiteName, name]);
    const startTestObj: StartTestItemRQ = {
      name,
      type: TEST_ITEM_TYPES.STEP,
      description: testMeta.description,
      attributes: testMeta.attributes,
      codeRef,
    };
    const parentId = getLastItem(this.suiteIds);
    const stepId = this.client.startTestItem(startTestObj, this.launchId, parentId).tempId;

    this.testItems.push({ name, id: stepId });
  }

  reportTestDone(name: string, testRunInfo: any): void {
    const hasError = !!testRunInfo.errs.length;
    const testItemId = this.testItems.find((item) => item.name === name).id;
    const { testCaseId } = this.testItems.find((item) => item.id === testItemId);
    let status = STATUSES.PASSED;
    let withoutIssue;
    if (testRunInfo.skipped) {
      status = STATUSES.SKIPPED;
      withoutIssue = this.config.skippedIssue === false;
    } else if (hasError) {
      status = STATUSES.FAILED;
      this.sendLogsOnFail(testRunInfo.errs, testItemId);
    }
    const finishTestItemObj = {
      status,
      ...(withoutIssue && { issue: { issueType: 'NOT_ISSUE' } }),
      ...(testCaseId && { testCaseId }),
    };
    this.client.finishTestItem(testItemId, finishTestItemObj);
    this.testItems = this.testItems.filter((item) => item.id !== testItemId);
  }

  reportTaskDone(endTime: number, passed: any, warnings: any): void {
    this.finishSuites();
    this.client.finishLaunch(this.launchId, { endTime });
    this.launchId = null;
  }

  finishSuites(): void {
    this.suiteIds.forEach((suiteId) => {
      const suiteTestCaseId = this.testData[suiteId];
      this.client.finishTestItem(suiteId, {
        ...(suiteTestCaseId && { testCaseId: suiteTestCaseId }),
      });
    });
    this.testData = {};
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
}
