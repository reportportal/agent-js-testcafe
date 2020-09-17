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

import { TEST_ITEM_TYPES, FILE_TYPES, LAUNCH_MODES, LOG_LEVELS } from '../constants';
import { RPItemStartRQ, RPItemFinishRQ, Parameter, Issue } from './common';

export interface StartTestItemRQ extends RPItemStartRQ {
  name: string;
  type: TEST_ITEM_TYPES;

  parameters?: Array<Parameter>;
  codeRef?: string;
  hasStats?: boolean,
  retry?: boolean,
  launchUuid?: string;
  testCaseHash?: number;
  testCaseId?: string;
  uniqueId?: string;
  parentName?: string;
}

export interface FinishTestItemRQ extends RPItemFinishRQ {
  launchUuid?: string;
  testCaseId?: string;
  retry?: boolean,
  issue?: Issue,
}

export interface StartLaunchRQ extends RPItemStartRQ {
  rerun?: boolean,
  rerunOf?: string,
  mode?: LAUNCH_MODES;
}

export interface FinishLaunchRQ extends RPItemFinishRQ {}

export interface Attachment {
  name: string,
  type: FILE_TYPES | string,
  content: string | Buffer,
}

export interface LogRQ {
  level?: LOG_LEVELS;
  message?: string;
  time?: number;
  file?: Attachment;
}
