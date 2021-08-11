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
import { filePath, setupReporter } from '../mocks/ReporterMock';
import { Reporter } from '../../reporter';

const file = {
  name: 'filename',
  type: 'image/png',
  content: Buffer.from([1, 2, 3, 4, 5, 6, 7]).toString('base64'),
};

describe('test listeners', () => {
  let reporter: Reporter;
  const startTime = Date.now();
  const { SET_LAUNCH_STATUS, SET_STATUS, ADD_LOG, ADD_LAUNCH_LOG } = EVENTS;
  const listeners = [SET_LAUNCH_STATUS, SET_STATUS, ADD_LOG, ADD_LAUNCH_LOG];

  beforeEach(() => {
    reporter = setupReporter(['launchId', 'suites']);
    reporter.reportTaskStart(startTime);
  });

  test('listeners should be added', () => {
    expect(process.eventNames()).toEqual(expect.arrayContaining(listeners));
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

        expect(reporter['suites']).toEqual([
          {
            id: 'tempSuiteItemId',
            name: 'suite_name',
            path: filePath,
            status: 'info',
          },
        ]);
      });

      test('emit EVENTS.SET_STATUS for test', () => {
        reporter['testItems'] = [{ name: 'test_name', id: 'testItemId' }];
        (process as NodeJS.EventEmitter).emit(EVENTS.SET_STATUS, { status: 'warn' });

        expect(reporter['testItems']).toEqual([
          {
            id: 'testItemId',
            name: 'test_name',
            status: 'warn',
          },
        ]);
      });
    });

    describe('EVENTS.ADD_LOG listener', () => {
      let spySendLog: jest.SpyInstance;
      beforeEach(() => {
        spySendLog = jest.spyOn(reporter['client'], 'sendLog');
      });

      test('should send log for suite with specified params', () => {
        const log = {
          level: 'ERROR',
          message: 'info log',
          file,
        };
        const expectedSendLogObj = {
          level: 'ERROR',
          message: 'info log',
          time: reporter['client'].helpers.now(),
        };

        (process as NodeJS.EventEmitter).emit(EVENTS.ADD_LOG, { log });

        expect(spySendLog).toHaveBeenCalledWith('tempSuiteItemId', expectedSendLogObj, file);
      });

      test('should send log current for test with specified params', () => {
        reporter['testItems'] = [{ name: 'testName', id: 'tempTestId' }];
        const log = {
          level: 'ERROR',
          message: 'info log',
          file,
        };
        const expectedSendLogObj = {
          time: reporter['client'].helpers.now(),
          level: 'ERROR',
          message: 'info log',
        };

        (process as NodeJS.EventEmitter).emit(EVENTS.ADD_LOG, { log });

        expect(spySendLog).toHaveBeenCalledWith('tempTestId', expectedSendLogObj, file);
      });
    });

    describe('EVENTS.ADD_LAUNCH_LOG listener', () => {
      test('should send log to launch with specified params', () => {
        const spySendLog = jest.spyOn(reporter['client'], 'sendLog');
        const log = {
          level: 'ERROR',
          message: 'info log',
          file,
        };
        const expectedSendLogObj = {
          time: reporter['client'].helpers.now(),
          level: 'ERROR',
          message: 'info log',
        };

        (process as NodeJS.EventEmitter).emit(EVENTS.ADD_LAUNCH_LOG, log);

        expect(spySendLog).toHaveBeenCalledWith('tempLaunchId', expectedSendLogObj, file);
      });
    });
  });
});
