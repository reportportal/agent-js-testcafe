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
import {
  Attribute,
  LogRQ,
  ObjUniversal,
  ReportPortalConfig,
  RPItem,
  StartLaunchRQ,
  StartTestItemRQ,
} from './models';
import { getAgentInfo, getCodeRef, getLastItem, getStartLaunchObj } from './utils';
import { LOG_LEVELS, STATUSES, TEST_ITEM_TYPES } from './constants';

interface TestItem {
  id: string;
  name: string;
  status?: string;
  testCaseId?: string;
  attributes?: Attribute[];
  description?: string;
}

interface Suite {
  id: string;
  name: string;
  path?: string;
  status?: string;
  testCaseId?: string;
  attributes?: Attribute[];
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
    process.on(EVENTS.SET_TEST_CASE_ID, this.setTestCaseId.bind(this));
    process.on(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
    process.on(EVENTS.ADD_LOG, this.sendTestItemLog.bind(this));
    process.on(EVENTS.ADD_LAUNCH_LOG, this.sendLaunchLog.bind(this));
  }

  unregisterRPListeners(): void {
    process.off(EVENTS.SET_LAUNCH_STATUS, this.setLaunchStatus.bind(this));
    process.off(EVENTS.SET_STATUS, this.setStatus.bind(this));
    process.off(EVENTS.SET_TEST_CASE_ID, this.setTestCaseId.bind(this));
    process.off(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
    process.off(EVENTS.ADD_LOG, this.sendTestItemLog.bind(this));
    process.off(EVENTS.ADD_LAUNCH_LOG, this.sendLaunchLog.bind(this));
  }

  getCurrentSuiteId(): string {
    return getLastItem(this.suites).id;
  }

  getCurrentTestItemId(): string {
    const lastTest = getLastItem(this.testItems);
    return lastTest ? lastTest.id : this.getCurrentSuiteId();
  }

  setTestCaseId({ testCaseId }: { testCaseId: string }): void {
    const testItemId = this.getCurrentTestItemId();
    const suite = this.suites.find(({ id }) => id === testItemId);
    if (suite) {
      suite.testCaseId = testCaseId;
    } else {
      this.testItems[
        this.testItems.findIndex((item) => item.id === testItemId)
      ].testCaseId = testCaseId;
    }
  }

  addAttributes({ attributes }: { attributes: Attribute[] }): void {
    if (!attributes || !(attributes instanceof Array)) {
      console.error('Attributes should be instance of Array');
      return;
    }
    const testItemId = this.getCurrentTestItemId();
    const suite = this.suites.find(({ id }) => id === testItemId);
    if (suite) {
      suite.attributes = (suite.attributes || []).concat(attributes);
    } else {
      const currentTest = this.testItems[
        this.testItems.findIndex((item) => item.id === testItemId)
      ];
      currentTest.attributes = (currentTest.attributes || []).concat(attributes);
    }
  }

  reportTaskStart(startTime: number): void {
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
    this.testItems.push({ name, id: stepId, description: testMeta.description });
  }

  reportTestDone(name: string, testRunInfo: any): void {
    const hasError = !!testRunInfo.errs.length;
    const {
      status: customTestItemStatus,
      id: testItemId,
      testCaseId,
      attributes,
      description,
    } = this.testItems.find((item) => item.name === name);
    let status: STATUSES | string = STATUSES.PASSED;
    let withoutIssue;
    let descriptionWithError;
    if (testRunInfo.skipped) {
      status = STATUSES.SKIPPED;
      withoutIssue = this.config.skippedIssue === false;
    } else if (hasError) {
      status = STATUSES.FAILED;
      // @ts-ignore
      const errorMsg = stripAnsi(this.formatError(testRunInfo.errs[testRunInfo.errs.length - 1]));
      this.sendLogsOnFail(testRunInfo.errs, testItemId);
      descriptionWithError =
        errorMsg && (description || '').concat(`\n\`\`\`error\n${errorMsg}\n\`\`\``);
    }
    const finishTestItemObj = {
      status: customTestItemStatus || status,
      ...(withoutIssue && { issue: { issueType: 'NOT_ISSUE' } }),
      ...(testCaseId && { testCaseId }),
      ...(attributes && { attributes }),
      ...(descriptionWithError && { description: descriptionWithError }),
    };
    this.client.finishTestItem(testItemId, finishTestItemObj);
    this.testItems = this.testItems.filter((item) => item.id !== testItemId);
  }

  reportTaskDone(endTime: number): void {
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
    this.suites.forEach(({ id, status, testCaseId, attributes }) => {
      const finishSuiteObj = {
        ...(status && { status }),
        ...(testCaseId && { testCaseId }),
        ...(attributes && { attributes }),
      };
      this.client.finishTestItem(id, finishSuiteObj);
    });
    this.suites = [];
  }

  sendLogsOnFail(errors: object[], testItemId: string): void {
    errors.forEach((error: object) => {
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

  setStatus({ status }: ObjUniversal): void {
    const testItemId = this.getCurrentTestItemId();
    const suite = this.suites.find(({ id }) => id === testItemId);
    if (suite) {
      suite.status = status;
    } else {
      this.testItems[this.testItems.findIndex((item) => item.id === testItemId)].status = status;
    }
  }

  sendTestItemLog({ log }: { log: LogRQ }): void {
    this.sendCustomLog(this.getCurrentTestItemId(), log);
  }

  sendLaunchLog(log: LogRQ): void {
    this.sendCustomLog(this.launchId, log);
  }

  sendCustomLog(tempId: string, { level, message = '', file }: LogRQ): void {
    this.client.sendLog(
      tempId,
      {
        message,
        level,
        time: this.client.helpers.now(),
      },
      file,
    );
  }
}
