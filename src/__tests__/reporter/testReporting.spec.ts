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

import { filePath, setupReporter, suiteName, testName } from '../mocks/ReporterMock';
import { StartTestItemRQ } from '../../models';
import { TEST_ITEM_TYPES } from '../../constants';

describe('start report test item', () => {
  const reporter = setupReporter(['launchId', 'suites']);
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
      'tempSuiteItemId',
    );
  });

  test('reporter.testItems should be updated', () => {
    expect(reporter['testItems']).toEqual([
      { name: testName, id: 'tempTestItemId', description: 'test_description' },
    ]);
  });
});
