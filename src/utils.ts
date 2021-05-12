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
import { version as pjsonVersion, name as pjsonName } from '../package.json';
import { Attribute, StartLaunchRQ, ReportPortalConfig } from './models';

export function getLastItem<T>(items: T[] = []): T {
  return items[items.length - 1];
}

export const getAgentInfo = (): { version: string; name: string } => ({
  version: pjsonVersion,
  name: pjsonName,
});

export const getSystemAttributes = (skippedIssue = true): Array<Attribute> => {
  const systemAttributes = [
    {
      key: 'agent',
      value: `${pjsonName}|${pjsonVersion}`,
      system: true,
    },
  ];

  if (skippedIssue === false) {
    const skippedIssueAttribute = {
      key: 'skippedIssue',
      value: 'false',
      system: true,
    };
    systemAttributes.push(skippedIssueAttribute);
  }

  return systemAttributes;
};

export const getStartLaunchObj = (
  launchObj: StartLaunchRQ,
  config: ReportPortalConfig,
): StartLaunchRQ => {
  const systemAttributes: Array<Attribute> = getSystemAttributes(config.skippedIssue);

  return {
    ...launchObj,
    attributes: config.attributes ? config.attributes.concat(systemAttributes) : systemAttributes,
    description: config.description,
    rerun: config.rerun,
    rerunOf: config.rerunOf,
    mode: config.mode,
  };
};

export const getCodeRef = (basePath: string, testName: string | Array<string>): string => {
  const relativePath = path.relative(process.cwd(), basePath).replace(/\\/g, '/');
  const name = Array.isArray(testName) ? testName.join('/') : testName;

  return [relativePath, name].join('/');
};
