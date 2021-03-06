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

const createTestCafe = require('testcafe');
const configureReporter = require('@reportportal/agent-js-testcafe');
const rpConfig = require('./rp.json');

async function start() {
    const testcafe = await createTestCafe('localhost', 1337, 1338);
    const runner = testcafe.createRunner();

    await runner
        .reporter(configureReporter(rpConfig))
        .run();

    await testcafe.close();
}

start();
