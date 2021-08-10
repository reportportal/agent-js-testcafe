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
import { RP_STATUSES } from '@reportportal/client-javascript/lib/constants/statuses';
import { LOG_LEVELS } from './constants';
import { Attachment } from './models';

export const ReportingApi = {
  setLaunchStatus: ClientPublicReportingAPI.setLaunchStatus,
  setLaunchStatusPassed: (): void => ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.PASSED),
  setLaunchStatusFailed: (): void => ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.FAILED),
  setLaunchStatusSkipped: (): void => ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.SKIPPED),
  setLaunchStatusStopped: (): void => ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.STOPPED),
  setLaunchStatusInterrupted: (): void =>
    ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.INTERRUPTED),
  setLaunchStatusCancelled: (): void =>
    ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.CANCELLED),
  setLaunchStatusInfo: (): void => ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.INFO),
  setLaunchStatusWarn: (): void => ClientPublicReportingAPI.setLaunchStatus(RP_STATUSES.WARN),
  setStatus: ClientPublicReportingAPI.setStatus,
  setStatusPassed: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.PASSED),
  setStatusFailed: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.FAILED),
  setStatusSkipped: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.SKIPPED),
  setStatusStopped: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.STOPPED),
  setStatusInterrupted: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.INTERRUPTED),
  setStatusCancelled: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.CANCELLED),
  setStatusInfo: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.INFO),
  setStatusWarn: (): void => ClientPublicReportingAPI.setStatus(RP_STATUSES.WARN),
  setTestCaseId: ClientPublicReportingAPI.setTestCaseId,
  addAttributes: ClientPublicReportingAPI.addAttributes,

  log: (level: LOG_LEVELS | string = LOG_LEVELS.INFO, message = '', file?: Attachment): void =>
    ClientPublicReportingAPI.addLog({ level, file, message }),
  launchLog: (
    level: LOG_LEVELS | string = LOG_LEVELS.INFO,
    message = '',
    file?: Attachment,
  ): void => ClientPublicReportingAPI.addLaunchLog({ level, message, file }),
  trace: (message: string, file?: Attachment): void =>
    ReportingApi.log(LOG_LEVELS.TRACE, message, file),
  debug: (message: string, file?: Attachment): void =>
    ReportingApi.log(LOG_LEVELS.DEBUG, message, file),
  info: (message: string, file?: Attachment): void =>
    ReportingApi.log(LOG_LEVELS.INFO, message, file),
  warn: (message: string, file?: Attachment): void =>
    ReportingApi.log(LOG_LEVELS.WARN, message, file),
  error: (message: string, file?: Attachment): void =>
    ReportingApi.log(LOG_LEVELS.ERROR, message, file),
  fatal: (message: string, file?: Attachment): void =>
    ReportingApi.log(LOG_LEVELS.FATAL, message, file),
  launchTrace: (message: string, file?: Attachment): void =>
    ReportingApi.launchLog(LOG_LEVELS.TRACE, message, file),
  launchDebug: (message: string, file?: Attachment): void =>
    ReportingApi.launchLog(LOG_LEVELS.DEBUG, message, file),
  launchInfo: (message: string, file?: Attachment): void =>
    ReportingApi.launchLog(LOG_LEVELS.INFO, message, file),
  launchWarn: (message: string, file?: Attachment): void =>
    ReportingApi.launchLog(LOG_LEVELS.WARN, message, file),
  launchError: (message: string, file?: Attachment): void =>
    ReportingApi.launchLog(LOG_LEVELS.ERROR, message, file),
  launchFatal: (message: string, file?: Attachment): void =>
    ReportingApi.launchLog(LOG_LEVELS.FATAL, message, file),
};
