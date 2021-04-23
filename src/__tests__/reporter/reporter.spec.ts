/*
 *  Copyright 2021 EPAM Systems
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

// @ts-ignore
import RPClient from '@reportportal/client-javascript';
import { Reporter } from '../../reporter';
import { getDefaultMockConfig, RPClientMock } from './RPClientMock';
import { StartLaunchRQ, StartTestItemRQ } from '../../models';
import { STATUSES, TEST_ITEM_TYPES } from '../../constants';
import { getStartLaunchObj } from '../../utils';

const setupReporter = (fields: Array<string> = []): Reporter => {
  const config = getDefaultMockConfig();
  const client = new RPClientMock();
  const reporter = new Reporter(config);
  reporter['client'] = client;
  const dict = {
    launchId: 'tempLaunchId',
    suiteIds: ['tempTestItemId'],
    testItems: [{ name: 'test_name', id: 'tempTestItemId' }],
  };
  fields.forEach((field) => {
    // @ts-ignore
    reporter[field] = dict[field];
  });

  return reporter;
};
const config = getDefaultMockConfig();

describe('setup reporter', () => {
  const reporter = setupReporter();
  test('client instance should exist', () => {
    expect(reporter['client']).toBeDefined();
    expect(reporter['client']).toBeInstanceOf(RPClientMock);
  });

  test('config should be setup', () => {
    expect(reporter['config']).toBeDefined();
    expect(reporter['config']).toEqual(config);
  });
});

describe('reporting', () => {
  const suiteName = 'suite_name';
  const testName = 'test_name';

  describe('start report launch', () => {
    const reporter = setupReporter();
    const startTime = Date.now();
    const startLaunchObj: StartLaunchRQ = getStartLaunchObj({ startTime }, config);
    reporter.reportTaskStart(startTime, undefined, undefined);
    test('client.startLaunch should be called with corresponding params', () => {
      expect(reporter['client'].startLaunch).toHaveBeenCalledTimes(1);
      expect(reporter['client'].startLaunch).toHaveBeenCalledWith(startLaunchObj);
    });
    test('reporter.launchId should be set', () => {
      expect(reporter['launchId']).toEqual('tempLaunchId');
    });
  });

  describe('start report suite', () => {
    const reporter = setupReporter(['launchId']);
    const meta = {
      description: 'suite_description',
    };
    const startSuiteObj: StartTestItemRQ = {
      name: suiteName,
      type: TEST_ITEM_TYPES.SUITE,
      description: meta.description,
    };
    reporter.reportFixtureStart(suiteName, undefined, meta);
    test('client.startTestItem should be called with corresponding params', () => {
      expect(reporter['client'].startTestItem).toHaveBeenCalledTimes(1);
      expect(reporter['client'].startTestItem).toHaveBeenCalledWith(startSuiteObj, 'tempLaunchId');
    });
    test('reporter.suiteIds should be updated ', () => {
      expect(reporter['suiteIds']).toEqual(['tempTestItemId']);
    });
  });

  describe('start report test item', () => {
    const reporter = setupReporter(['launchId', 'suiteIds']);
    const testMeta = {
      description: 'test_description',
    };
    const startTestObj: StartTestItemRQ = {
      name: testName,
      type: TEST_ITEM_TYPES.STEP,
      description: testMeta.description,
    };
    reporter.reportTestStart(testName, testMeta);
    test('client.startTestItem should be called with corresponding params', () => {
      expect(reporter['client'].startTestItem).toHaveBeenCalledTimes(1);
      expect(reporter['client'].startTestItem).toHaveBeenCalledWith(
        startTestObj,
        'tempLaunchId',
        'tempTestItemId',
      );
    });
    test('reporter.testItems should be updated', () => {
      expect(reporter['testItems']).toEqual([{ name: testName, id: 'tempTestItemId' }]);
    });
  });

  describe('finish report test item', () => {
    const testRunInfo: any = {
      errs: [],
      skipped: false,
    };

    describe('test with PASSED status', () => {
      const reporter = setupReporter(['launchId', 'suiteIds', 'testItems']);
      reporter.reportTestDone(testName, testRunInfo);
      test('client.finishTestItem should be called with corresponding params', () => {
        expect(reporter['client'].finishTestItem).toHaveBeenCalledTimes(1);
        expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
          status: STATUSES.PASSED,
        });
      });
      test('reporter.testItems should be []', () => {
        expect(reporter['testItems']).toEqual([]);
      });
    });
    describe('test with SKIPPED status', () => {
      const reporter = setupReporter(['launchId', 'suiteIds', 'testItems']);
      testRunInfo.skipped = true;
      reporter.reportTestDone(testName, testRunInfo);
      test('client.finishTestItem should be called with corresponding params', () => {
        expect(reporter['client'].finishTestItem).toHaveBeenCalledTimes(1);
        expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
          status: STATUSES.SKIPPED,
        });
      });
      test('reporter.testItems should be []', () => {
        expect(reporter['testItems']).toEqual([]);
      });
    });
    describe('test with FAILED status', () => {
      const reporter = setupReporter(['launchId', 'suiteIds', 'testItems']);
      testRunInfo.skipped = false;
      testRunInfo.errs = ['401 unauthorized'];
      reporter.sendLogsOnFail = jest.fn((errors, testItemId) => ({ errors, testItemId }));
      reporter.reportTestDone(testName, testRunInfo);
      test('client.finishTestItem should be called with corresponding params', () => {
        expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
          status: STATUSES.FAILED,
        });
      });
      test('reporter.sendLogsOnFail should be called with error & testItemId', () => {
        expect(reporter.sendLogsOnFail).toHaveBeenCalledTimes(1);
        expect((reporter.sendLogsOnFail as jest.Mock).mock.calls[0][0]).toEqual([
          '401 unauthorized',
        ]);
        expect((reporter.sendLogsOnFail as jest.Mock).mock.calls[0][1]).toEqual('tempTestItemId');
      });
      test('reporter.testItems should be []', () => {
        expect(reporter['testItems']).toEqual([]);
      });
    });
  });

  describe('finish report launch', () => {
    const reporter = setupReporter(['launchId', 'suiteIds']);
    const endTime = Date.now();
    reporter.reportTaskDone(endTime, undefined, undefined);

    test('client.finishTestItem should be called', () => {
      expect(reporter['client'].finishTestItem).toHaveBeenCalledTimes(1);
      expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {});
    });
    test('client.finishLaunch should be called with corresponding params', () => {
      expect(reporter['client'].finishLaunch).toHaveBeenCalledTimes(1);
      expect(reporter['client'].finishLaunch).toHaveBeenCalledWith('tempLaunchId', {
        endTime,
      });
    });
    test('launchId should be null', () => {
      expect(reporter['launchId']).toBeNull();
    });
  });
});
