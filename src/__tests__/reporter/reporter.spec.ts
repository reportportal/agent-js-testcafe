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

import path from 'path';
import { Reporter } from '../../reporter';
import { getDefaultMockConfig, RPClientMock } from './RPClientMock';
import { StartLaunchRQ, StartTestItemRQ } from '../../models';
import { STATUSES, TEST_ITEM_TYPES } from '../../constants';
import { getStartLaunchObj } from '../../utils';

const config = getDefaultMockConfig();
const setupReporter = (fields: Array<string> = []): Reporter => {
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
  jest.spyOn(process, 'cwd').mockReturnValue(`C:${path.sep}project`);
  const suiteName = 'suite_name';
  const testName = 'test_name';
  const filePath = `C:${path.sep}project${path.sep}__test__${path.sep}test.spec.js`;

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
      attributes: [{ key: 'key', value: 'value' }, { value: 'value' }],
    };
    const startSuiteObj: StartTestItemRQ = {
      name: suiteName,
      type: TEST_ITEM_TYPES.SUITE,
      description: meta.description,
      attributes: meta.attributes,
      codeRef: `__test__/test.spec.js/${suiteName}`,
    };

    reporter.reportFixtureStart(suiteName, filePath, meta);

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
    reporter['testData'] = { path: filePath, suiteName };
    const testMeta = {
      description: 'test_description',
      attributes: [{ key: 'key', value: 'value' }, { value: 'value' }],
    };
    const startTestObj: StartTestItemRQ = {
      name: testName,
      type: TEST_ITEM_TYPES.STEP,
      description: testMeta.description,
      attributes: testMeta.attributes,
      codeRef: `__test__/test.spec.js/${suiteName}/${testName}`,
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
      afterAll(() => {
        delete config.skippedIssue;
      });

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

      test('client.finishTestItem should be called with corresponding params in case skippedIssue=false', () => {
        config.skippedIssue = false;
        const reporter = setupReporter(['launchId', 'suiteIds', 'testItems']);
        testRunInfo.skipped = true;
        reporter.reportTestDone(testName, testRunInfo);

        expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
          status: STATUSES.SKIPPED,
          issue: {
            issueType: 'NOT_ISSUE',
          },
        });
      });
    });

    describe('test with FAILED status', () => {
      const reporter = setupReporter(['launchId', 'suiteIds', 'testItems']);
      testRunInfo.skipped = false;
      testRunInfo.errs = ['401 unauthorized'];
      jest.spyOn(reporter, 'sendLogsOnFail').mockImplementation((errors, testItemId) => ({
        errors,
        testItemId,
      }));

      reporter.reportTestDone(testName, testRunInfo);

      test('client.finishTestItem should be called with corresponding params', () => {
        expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
          status: STATUSES.FAILED,
        });
      });

      test('reporter.sendLogsOnFail should be called with error & testItemId', () => {
        expect(reporter.sendLogsOnFail).toHaveBeenCalledTimes(1);
        expect(reporter.sendLogsOnFail).toHaveBeenCalledWith(
          ['401 unauthorized'],
          'tempTestItemId',
        );
      });

      test('reporter.testItems should be []', () => {
        expect(reporter['testItems']).toEqual([]);
      });
    });
  });

  describe('finish report launch', () => {
    const reporter = setupReporter(['launchId', 'suiteIds']);
    reporter['testData'] = { path: filePath, suiteName, testName };
    const endTime = Date.now();

    reporter.reportTaskDone(endTime, undefined, undefined);

    test('client.finishTestItem should be called', () => {
      expect(reporter['client'].finishTestItem).toHaveBeenCalledTimes(1);
      expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {});
    });

    test('testData should be reset', () => {
      expect(reporter['testData']).toEqual({});
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
