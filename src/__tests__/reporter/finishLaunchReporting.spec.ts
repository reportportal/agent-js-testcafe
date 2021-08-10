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
import { Reporter } from '../../reporter';

describe('finish report launch', () => {
  let reporter: Reporter;
  const endTime = Date.now();

  beforeEach(() => {
    reporter = setupReporter(['launchId', 'suites']);
  });

  test('client.finishLaunch should be called with corresponding params', () => {
    reporter.reportTaskDone(endTime);

    expect(reporter['client'].finishLaunch).toHaveBeenCalledTimes(1);
    expect(reporter['client'].finishLaunch).toHaveBeenCalledWith('tempLaunchId', {
      endTime,
    });
  });

  test('client.finishLaunch with custom launch status', () => {
    reporter['customLaunchStatus'] = 'info';

    reporter.reportTaskDone(endTime);

    expect(reporter['client'].finishLaunch).toHaveBeenCalledTimes(1);
    expect(reporter['client'].finishLaunch).toHaveBeenCalledWith('tempLaunchId', {
      endTime,
      status: 'info',
    });
  });

  test('launchId, customLaunchStatus should be reset', () => {
    reporter.reportTaskDone(endTime);

    expect(reporter['launchId']).toBeNull();
    expect(reporter['customLaunchStatus']).toBe('');
  });
});
