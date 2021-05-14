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

import { setupReporter, testName } from '../mocks/ReporterMock';
import { STATUSES } from '../../constants';
import { config } from '../mocks/configMock';

describe('finish report test item', () => {
  const testRunInfo: any = {
    errs: [],
    skipped: false,
  };

  describe('test with PASSED status', () => {
    const reporter = setupReporter(['launchId', 'suites', 'testItems']);

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

    describe('with default skippedIssue(true)', () => {
      const reporter = setupReporter(['launchId', 'suites', 'testItems']);
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

    describe('with skippedIssue=false', () => {
      const reporter = setupReporter(['launchId', 'suites', 'testItems']);
      config.skippedIssue = false;
      testRunInfo.skipped = true;

      reporter.reportTestDone(testName, testRunInfo);

      test('client.finishTestItem should be called with corresponding params in case skippedIssue=false', () => {
        expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
          status: STATUSES.SKIPPED,
          issue: {
            issueType: 'NOT_ISSUE',
          },
        });
      });
    });
  });

  describe('test with FAILED status', () => {
    const reporter = setupReporter(['launchId', 'suites', 'testItems']);
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
      expect(reporter.sendLogsOnFail).toHaveBeenCalledWith(['401 unauthorized'], 'tempTestItemId');
    });

    test('reporter.testItems should be []', () => {
      expect(reporter['testItems']).toEqual([]);
    });
  });
});
