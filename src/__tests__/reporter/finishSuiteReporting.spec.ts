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

import { setupReporter } from '../mocks/ReporterMock';

describe('finish report suite', () => {
  const reporter = setupReporter(['launchId', 'suiteIds']);
  const endTime = Date.now();

  reporter.reportTaskDone(endTime, undefined, undefined);

  test('client.finishTestItem should be called', () => {
    expect(reporter['client'].finishTestItem).toHaveBeenCalledTimes(1);
    expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {});
  });

  test('testData should be reset', () => {
    expect(reporter['testData']).toEqual({});
    expect(reporter['testItemStatuses']).toEqual({});
  });
});
