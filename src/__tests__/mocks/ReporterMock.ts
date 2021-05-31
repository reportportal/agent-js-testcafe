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

import path from 'path';
import { RPClientMock } from './RPClientMock';
import { Reporter } from '../../reporter';
import { config } from './configMock';

jest.spyOn(process, 'cwd').mockReturnValue(`C:${path.sep}project`);

export const suiteName = 'suite_name';
export const testName = 'test_name';
export const filePath = `C:${path.sep}project${path.sep}__test__${path.sep}test.spec.js`;

export const setupReporter = (fields: Array<string> = []): Reporter => {
  const client = new RPClientMock(config);
  const reporter = new Reporter(config);
  // @ts-ignore
  reporter.formatError = jest.fn((object) => JSON.stringify(object));
  reporter['client'] = client;
  const dict = {
    launchId: 'tempLaunchId',
    suites: [{ id: 'tempSuiteItemId', path: filePath, name: suiteName }],
    testItems: [{ name: testName, id: 'tempTestItemId' }],
  };
  fields.forEach((field) => {
    // @ts-ignore
    reporter[field] = dict[field];
  });

  return reporter;
};
