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
 */

import { Reporter } from '../reporter';
import { getDefaultMockConfig } from './reporter/RPClientMock';

describe('test case id reporting', function () {
  let reporter;
  beforeAll(function () {
    const config = getDefaultMockConfig();
    reporter = new Reporter(config);
    reporter.suiteIds = ['tempRootSuiteId', 'tempSuiteId'];
  });

  afterEach(function () {
    reporter.testItems = [];
    jest.clearAllMocks();
  });

  it('onSetTestCaseId: should set test case id for current test in the testCaseIds map', function () {
    const currentTest = {
      name: 'test',
      id: 'testItemId',
    };
    reporter.testItems.push(currentTest);
    const testCaseId = 'test_case_id';
    const expectedDescriptions = [{ id: "testItemId", name: "test", testCaseId: "test_case_id" }]

    reporter.setTestCaseId({ testCaseId });

    expect(reporter.testItems).toEqual(expectedDescriptions);
  });

  it('onSetTestCaseId: should overwrite test case id for current test in the testCaseIds map', function () {
    const currentTest = {
      name: 'test',
      id: 'testItemId',
    };
    reporter.testItems.push(currentTest);
    currentTest.testCaseId = 'old_test_case_id';
    const newTestCaseId = 'new_test_case_id';

    const expectedDescriptions = [{
      name: 'test',
      id: 'testItemId', testCaseId: "new_test_case_id"
    }]

    reporter.setTestCaseId({ testCaseId: newTestCaseId });
    expect(reporter.testItems).toEqual(expectedDescriptions);
  });

  it('onSetTestCaseId: should set test case id for current suite in testCaseIds map', function () {
    const testCaseId = 'suite_test_case_id';

    const expectedDescriptions = { "tempSuiteId": "suite_test_case_id" }

    reporter.setTestCaseId({ testCaseId });

    expect(reporter.testData).toEqual(expectedDescriptions);
  });
});
