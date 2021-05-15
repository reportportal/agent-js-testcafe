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
import { StartLaunchRQ } from '../../models';
import { getStartLaunchObj } from '../../utils';
import { config } from '../mocks/configMock';

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
