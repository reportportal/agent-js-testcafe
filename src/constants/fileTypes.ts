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

export enum FILE_TYPES {
  XML = 'application/xml',
  HTML = 'application/html',
  JAVASCRIPT = 'application/javascript',
  JSON = 'application/json',
  PHP = 'application/php',
  CSS = 'application/css',
  TEXT = 'text/plain',
  PNG = 'image/png',
  JPG = 'image/jpg',
}

export const DEFAULT_FILE_TYPE = FILE_TYPES.PNG;
