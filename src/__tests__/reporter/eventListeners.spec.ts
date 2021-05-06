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

import { EVENTS } from '@reportportal/client-javascript/lib/constants/events';
import { setupReporter } from '../mocks/ReporterMock';
import { Reporter } from '../../reporter';

describe('test listeners', () => {
  let reporter: Reporter;
  const startTime = Date.now();
  const listeners = [EVENTS.SET_LAUNCH_STATUS, EVENTS.SET_STATUS];

  beforeEach(() => {
    reporter = setupReporter(['launchId', 'suiteIds']);
    reporter.reportTaskStart(startTime, undefined, undefined);
  });

  afterAll(() => {
    process.removeAllListeners();
  });

  test('listeners should be added', () => {
    expect(process.eventNames()).toEqual(listeners);
  });

  describe('check listeners', () => {
    describe('EVENTS.SET_LAUNCH_STATUS listener', () => {
      test('emit EVENTS.SET_LAUNCH_STATUS for launch', () => {
        (process as NodeJS.EventEmitter).emit(EVENTS.SET_LAUNCH_STATUS, 'info');

        expect(reporter['customLaunchStatus']).toBe('info');
      });
    });

    describe('EVENTS.SET_STATUS listener', () => {
      test('emit EVENTS.SET_STATUS for suite', () => {
        (process as NodeJS.EventEmitter).emit(EVENTS.SET_STATUS, { status: 'info' });

        expect(reporter['testItemStatuses']).toEqual({ tempTestItemId: 'info' });
      });

      test('emit EVENTS.SET_STATUS for test', () => {
        reporter['testItems'] = [{ name: 'test_name', id: 'tempTestItemId' }];
        (process as NodeJS.EventEmitter).emit(EVENTS.SET_STATUS, { status: 'warn' });

        expect(reporter['testItemStatuses']).toEqual({ tempTestItemId: 'warn' });
      });
    });
  });
});
