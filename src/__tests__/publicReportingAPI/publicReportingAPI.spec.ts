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

import ClientPublicReportingAPI from '@reportportal/client-javascript/lib/publicReportingAPI';
import { PublicReportingAPI } from '../../publicReportingAPI';

describe('PublicReportingAPI', () => {
  describe('Item status reporting', () => {
    const publicReportingAPIStatusMethods = [
      { method: 'setStatusPassed', status: 'passed' },
      { method: 'setStatusFailed', status: 'failed' },
      { method: 'setStatusSkipped', status: 'skipped' },
      { method: 'setStatusStopped', status: 'stopped' },
      { method: 'setStatusInterrupted', status: 'interrupted' },
      { method: 'setStatusCancelled', status: 'cancelled' },
      { method: 'setStatusInfo', status: 'info' },
      { method: 'setStatusWarn', status: 'warn' },
    ];

    publicReportingAPIStatusMethods.forEach(({ method, status }) => {
      test(`${method}: should call ${method} method with "${status}" status`, () => {
        const spySetStatus = jest
          .spyOn(ClientPublicReportingAPI, 'setStatus')
          .mockImplementation(() => {});
        // @ts-ignore
        PublicReportingAPI[method]();

        expect(spySetStatus).toHaveBeenCalledWith(status);
      });
    });
  });

  describe('Launch status reporting', () => {
    const publicReportingAPILaunchStatusMethods = [
      { method: 'setLaunchStatusPassed', status: 'passed' },
      { method: 'setLaunchStatusFailed', status: 'failed' },
      { method: 'setLaunchStatusSkipped', status: 'skipped' },
      { method: 'setLaunchStatusStopped', status: 'stopped' },
      { method: 'setLaunchStatusInterrupted', status: 'interrupted' },
      { method: 'setLaunchStatusCancelled', status: 'cancelled' },
      { method: 'setLaunchStatusInfo', status: 'info' },
      { method: 'setLaunchStatusWarn', status: 'warn' },
    ];

    publicReportingAPILaunchStatusMethods.forEach(({ method, status }) => {
      test(`${method}: should call ${method} method with "${status}" status`, () => {
        const spySetStatus = jest
          .spyOn(ClientPublicReportingAPI, 'setLaunchStatus')
          .mockImplementation(() => {});
        // @ts-ignore
        PublicReportingAPI[method]();

        expect(spySetStatus).toHaveBeenCalledWith(status);
      });
    });
  });

  describe('Log reporting', () => {
    const file = {
      name: 'filename',
      type: 'image/png',
      content: Buffer.from([1, 2, 3, 4, 5, 6, 7]).toString('base64'),
    };

    test('log without parameters: should call addLog method with info level and empty message', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'INFO',
        message: '',
      };

      PublicReportingAPI.log();

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('log: should call addLog method with specified level and message', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'ERROR',
        message: 'message text',
      };

      PublicReportingAPI.log('ERROR', 'message text');

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('log: should call addLog method with specified level, message and attachment', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'ERROR',
        message: 'message text',
        file,
      };

      PublicReportingAPI.log('ERROR', 'message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('trace: should call addLog method with TRACE level and specified parameters', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'TRACE',
        message: 'message text',
        file,
      };

      PublicReportingAPI.trace('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('debug: should call addLog method with DEBUG level and specified parameters', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'DEBUG',
        message: 'message text',
        file,
      };

      PublicReportingAPI.debug('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('info: should call addLog method with INFO level and specified parameters', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'INFO',
        message: 'message text',
        file,
      };

      PublicReportingAPI.info('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('warn: should call addLog method with WARN level and specified parameters', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'WARN',
        message: 'message text',
        file,
      };

      PublicReportingAPI.warn('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('error: should call addLog method with ERROR level and specified parameters', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'ERROR',
        message: 'message text',
        file,
      };

      PublicReportingAPI.error('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('fatal: should call addLog method with FATAL level and specified parameters', () => {
      const spyAddLog = jest.spyOn(ClientPublicReportingAPI, 'addLog').mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'FATAL',
        message: 'message text',
        file,
      };

      PublicReportingAPI.fatal('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchLog without params: should call addLaunchLog method with info level and empty message', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'INFO',
        message: '',
      };

      PublicReportingAPI.launchLog();

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchLog: should call addLaunchLog method with parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'ERROR',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchLog('ERROR', 'message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchTrace: should call addLaunchLog with TRACE level and specified parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'TRACE',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchTrace('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchDebug: should call addLaunchLog with DEBUG level and specified parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'DEBUG',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchDebug('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchInfo: should call addLaunchLog with INFO level and specified parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'INFO',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchInfo('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchWarn: should call addLaunchLog with WARN level and specified parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'WARN',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchWarn('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchError: should call addLaunchLog with ERROR level and specified parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'ERROR',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchError('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });

    test('launchFatal: should call addLaunchLog with FATAL level and specified parameters', () => {
      const spyAddLog = jest
        .spyOn(ClientPublicReportingAPI, 'addLaunchLog')
        .mockImplementation(() => {});

      const expectedAddLogObj = {
        level: 'FATAL',
        message: 'message text',
        file,
      };

      PublicReportingAPI.launchFatal('message text', file);

      expect(spyAddLog).toHaveBeenCalledWith(expectedAddLogObj);
    });
  });
});
