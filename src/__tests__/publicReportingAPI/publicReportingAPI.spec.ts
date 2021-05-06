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
import {
  publicReportingAPILaunchStatusMethods,
  publicReportingAPIStatusMethods,
} from '../mocks/publicReportingAPIMock';
import { PublicReportingAPI } from '../../publicReportingAPI';

describe('PublicReportingAPI', () => {
  describe('Item status reporting', function() {
    publicReportingAPIStatusMethods.forEach(({ method, status }) => {
      it(`${method}: should call ${method} method with "${status}" status`, function() {
        const spySetStatus = jest
          .spyOn(ClientPublicReportingAPI, 'setStatus')
          .mockImplementation(() => {});
        // @ts-ignore
        PublicReportingAPI[method]();

        expect(spySetStatus).toHaveBeenCalledWith(status);
      });
    });
  });

  describe('Launch status reporting', function() {
    publicReportingAPILaunchStatusMethods.forEach(({ method, status }) => {
      it(`${method}: should call ${method} method with "${status}" status`, function() {
        const spySetStatus = jest
          .spyOn(ClientPublicReportingAPI, 'setLaunchStatus')
          .mockImplementation(() => {});
        // @ts-ignore
        PublicReportingAPI[method]();

        expect(spySetStatus).toHaveBeenCalledWith(status);
      });
    });
  });
});
