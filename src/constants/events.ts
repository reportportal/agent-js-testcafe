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

export enum EVENTS {
  START_TEST_ITEM = 'rp:startTestItem',
  FINISH_TEST_ITEM = 'rp:finishTestItem',
  ADD_LOG = 'rp:addLog',
  ADD_LAUNCH_LOG = 'rp:addLaunchLog',
  ADD_ATTRIBUTES = 'rp:addAttributes',
  ADD_DESCRIPTION = 'rp:addDescription',
  SET_TEST_CASE_ID = 'rp:setTestCaseId',
  SET_STATUS = 'rp:setStatus',
}
