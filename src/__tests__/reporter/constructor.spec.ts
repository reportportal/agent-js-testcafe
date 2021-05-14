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

import { RPClientMock } from '../mocks/RPClientMock';
import { setupReporter } from '../mocks/ReporterMock';
import { config } from '../mocks/configMock';

describe('setup reporter', () => {
  const reporter = setupReporter();

  test('client instance should exist', () => {
    expect(reporter['client']).toBeDefined();
    expect(reporter['client']).toBeInstanceOf(RPClientMock);
  });

  test('config should be setup', () => {
    expect(reporter['config']).toBeDefined();
    expect(reporter['config']).toEqual(config);
  });
});
