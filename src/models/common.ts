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

import { STATUSES } from '../constants';

export interface Attribute {
  value: string;
  key?: string;
  system?: boolean;
}

export interface Parameter {
  key: string;
  value: string;
}

interface ExternalSystemIssue {
  url: string;
  btsProject: string;
  btsUrl: string;
  ticketId: string;

  submitDate?: number;
}

export interface Issue {
  issueType: string;

  autoAnalyzed?: boolean;
  ignoreAnalyzer?: boolean;
  comment?: string;
  externalSystemIssues?: Array<ExternalSystemIssue>;
}

export interface RPItem {
  attributes?: Array<Attribute>;
  description?: string;
}

export interface RPItemStartRQ extends RPItem {
  startTime?: Date | number;
}

export interface RPItemFinishRQ extends RPItem {
  status?: STATUSES;
  endTime?: Date | number;
}

export interface ObjUniversal {
  [name: string]: string;
}
