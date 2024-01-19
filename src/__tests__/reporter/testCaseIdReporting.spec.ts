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

import { Reporter, TestItem } from '../../reporter';
import { config } from '../mocks/configMock';

describe('test case id reporting', function () {
  let reporter: Reporter;
  beforeAll(function () {
    reporter = new Reporter(config);
  });

  afterEach(function () {
    // @ts-ignore access to the class private property
    reporter.testItems = [];
    // @ts-ignore access to the class private property
    reporter.suites = [];
    jest.clearAllMocks();
  });

  it('onSetTestCaseId: should set test case id for current test in the testCaseIds map', function () {
    const currentTest: TestItem = {
      name: 'test',
      id: 'testItemId',
    };
    // @ts-ignore access to the class private property
    reporter.testItems.push(currentTest);
    const testCaseId = 'test_case_id';
    const expectedDescriptions = [{ id: 'testItemId', name: 'test', testCaseId: 'test_case_id' }];

    reporter.setTestCaseId({ testCaseId });

    // @ts-ignore access to the class private property
    expect(reporter.testItems).toEqual(expectedDescriptions);
  });

  it('onSetTestCaseId: should overwrite test case id for current test in the testCaseIds map', function () {
    const currentTest: TestItem = {
      name: 'test',
      id: 'testItemId',
    };
    // @ts-ignore access to the class private property
    reporter.testItems.push(currentTest);
    currentTest.testCaseId = 'old_test_case_id';
    const newTestCaseId = 'new_test_case_id';

    const expectedDescriptions = [
      {
        name: 'test',
        id: 'testItemId',
        testCaseId: 'new_test_case_id',
      },
    ];

    reporter.setTestCaseId({ testCaseId: newTestCaseId });
    // @ts-ignore access to the class private property
    expect(reporter.testItems).toEqual(expectedDescriptions);
  });

  it('onSetTestCaseId: should set test case id for current suite in testCaseIds map', function () {
    const currentSuite = {
      name: 'suite',
      id: 'suiteItemId',
    };

    // @ts-ignore access to the class private property
    reporter.suites.push(currentSuite);
    const testCaseId = 'suite_test_case_id';

    const expectedDescriptions = [
      {
        name: 'suite',
        id: 'suiteItemId',
        testCaseId: 'suite_test_case_id',
      },
    ];

    reporter.setTestCaseId({ testCaseId });

    // @ts-ignore access to the class private property
    expect(reporter.suites).toEqual(expectedDescriptions);
  });
});
