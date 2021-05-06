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

export const publicReportingAPILaunchStatusMethods = [
  { method: 'setLaunchStatusPassed', status: 'passed' },
  { method: 'setLaunchStatusFailed', status: 'failed' },
  { method: 'setLaunchStatusSkipped', status: 'skipped' },
  { method: 'setLaunchStatusStopped', status: 'stopped' },
  { method: 'setLaunchStatusInterrupted', status: 'interrupted' },
  { method: 'setLaunchStatusCancelled', status: 'cancelled' },
  { method: 'setLaunchStatusInfo', status: 'info' },
  { method: 'setLaunchStatusWarn', status: 'warn' },
];

export const publicReportingAPIStatusMethods = [
  { method: 'setStatusPassed', status: 'passed' },
  { method: 'setStatusFailed', status: 'failed' },
  { method: 'setStatusSkipped', status: 'skipped' },
  { method: 'setStatusStopped', status: 'stopped' },
  { method: 'setStatusInterrupted', status: 'interrupted' },
  { method: 'setStatusCancelled', status: 'cancelled' },
  { method: 'setStatusInfo', status: 'info' },
  { method: 'setStatusWarn', status: 'warn' },
];
