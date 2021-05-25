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

import { setupReporter, testName } from '../mocks/ReporterMock';

describe('finish report test item', () => {
    const testRunInfo: any = {
        errs: [],
        skipped: false,
    };

    describe('test with FAILED status', () => {
        const reporter = setupReporter(['launchId', 'suites', 'testItems']);
        testRunInfo.skipped = false;
        testRunInfo.errs = [{ errMsg: '401 unauthorized' }];
        jest.spyOn(reporter, 'sendLogsOnFail').mockImplementation((errors, testItemId) => ({
            errors,
            testItemId,
        }));


        reporter.reportTestDone(testName, testRunInfo);

        test('test description should have error message', () => {
            expect(reporter['client'].finishTestItem).toHaveBeenCalledWith('tempTestItemId', {
                description: "\n```error\n401 unauthorized\n```",
                status: "failed",
            });
        });
    });
});