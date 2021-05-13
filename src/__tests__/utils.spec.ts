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

import path from 'path';
import packageJson from '../../package.json';
import {
  getAgentInfo,
  getSystemAttributes,
  getStartLaunchObj,
  getCodeRef,
  getLastItem,
} from '../utils';
import { StartLaunchRQ } from '../models';
import { config } from './mocks/configMock';

describe('getAgentInfo', function() {
  test('should return the name and version of application from package.json file', function() {
    const agentInfo = getAgentInfo();

    expect(agentInfo.name).toBe(packageJson.name);
    expect(agentInfo.version).toBe(packageJson.version);
  });
});

describe('getSystemAttributes', function() {
  const expectedRes = [
    {
      key: 'agent',
      value: `${packageJson.name}|${packageJson.version}`,
      system: true,
    },
  ];
  test('should return the list of system attributes', function() {
    const systemAttributes = getSystemAttributes();

    expect(systemAttributes).toEqual(expectedRes);
  });

  test('should return expected list of system attributes in case skippedIssue=false', () => {
    const systemAttributes = getSystemAttributes(false);
    const skippedIssueAttribute = {
      key: 'skippedIssue',
      value: 'false',
      system: true,
    };

    expect(systemAttributes).toEqual([...expectedRes, skippedIssueAttribute]);
  });
});

describe('getCodeRef', () => {
  jest.spyOn(process, 'cwd').mockReturnValue(`C:${path.sep}project`);
  const testPath = `C:${path.sep}project${path.sep}__test__${path.sep}example.js`;
  const suiteTitle = 'suiteTitle';
  const testTitle = 'testTitle';

  test('pass string to getCodeRef ', () => {
    const codeRef = getCodeRef(testPath, suiteTitle);
    const expectedRes = '__test__/example.js/suiteTitle';
    expect(codeRef).toBe(expectedRes);
  });

  test('pass array of strings to getCodeRef', () => {
    const codeRef = getCodeRef(testPath, [suiteTitle, testTitle]);
    const expectedRes = '__test__/example.js/suiteTitle/testTitle';
    expect(codeRef).toBe(expectedRes);
  });
});

describe('getLastItem', () => {
  test('should return last item', () => {
    const items = [1, 2, 3];
    expect(getLastItem(items)).toBe(3);
  });

  test('call without arguments', () => {
    expect(getLastItem()).toBe(undefined);
  });
});

describe('getStartLaunchObj', () => {
  const launchObj: StartLaunchRQ = {};
  const systemAttributes = getSystemAttributes(config.skippedIssue);

  test('pass config without attributes to getStartLaunchObj', () => {
    const expectedRes = {
      ...launchObj,
      attributes: systemAttributes,
      description: config.description,
      rerun: config.rerun,
      rerunOf: config.rerunOf,
      mode: config.mode,
    };

    expect(getStartLaunchObj(launchObj, config)).toEqual(expectedRes);
  });

  test('pass config with attributes to getStartLaunchObj', () => {
    config.attributes = [{ key: 'key', value: 'value' }];
    const expectedRes = {
      ...launchObj,
      attributes: [...config.attributes, ...systemAttributes],
      description: config.description,
      rerun: config.rerun,
      rerunOf: config.rerunOf,
      mode: config.mode,
    };

    expect(getStartLaunchObj(launchObj, config)).toEqual(expectedRes);
  });
});
