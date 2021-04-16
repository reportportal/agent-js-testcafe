/*
 *  Copyright 2020 EPAM Systems
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

// @ts-ignore
import packageJson from '../../package.json';
import { getAgentInfo, getSystemAttributes, getStartLaunchObj } from '../utils';

describe('getAgentInfo', function() {
  test('should return the name and version of application from package.json file', function() {
    const agentInfo = getAgentInfo();

    expect(agentInfo.name).toBe(packageJson.name);
    expect(agentInfo.version).toBe(packageJson.version);
  });
});

describe('getSystemAttributes', function() {
  test('should return the list of system attributes', function() {
    const systemAttributes = getSystemAttributes();

    expect(systemAttributes).toEqual([
      {
        key: 'agent',
        value: `${packageJson.name}|${packageJson.version}`,
        system: true,
      },
    ]);
  });
});
