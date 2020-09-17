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
import { version as pjsonVersion, name as pjsonName } from '../package.json';
import { Attribute, StartLaunchRQ, ReportPortalConfig } from './models';

export const getAgentInfo = () => ({
  version: pjsonVersion,
  name: pjsonName,
});

export const getSystemAttributes = (): Array<Attribute> => ([{
  key: 'agent',
  value: `${pjsonName}|${pjsonVersion}`,
  system: true,
}]);

export const getStartLaunchObj = (launchObj: StartLaunchRQ, config: ReportPortalConfig): StartLaunchRQ => {
  const configLaunchParams = {
    description: config.description,
    attributes: config.attributes,
    rerun: config.rerun,
    rerunOf: config.rerunOf,
    mode: config.mode,
  };
  const systemAttributes: Array<Attribute> = getSystemAttributes();

  return {
    ...configLaunchParams,
    ...launchObj,
    attributes: launchObj.attributes
      ? launchObj.attributes.concat(systemAttributes)
      : systemAttributes,
  };
};
