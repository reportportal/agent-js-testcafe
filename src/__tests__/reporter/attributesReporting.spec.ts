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
 */

import { Reporter } from '../../reporter';
import { config } from '../mocks/configMock';

describe('attributes reporting', function () {
    let reporter;
    beforeAll(function () {
        reporter = new Reporter(config);
    });

    afterEach(function () {
        reporter.testItems = [];
        reporter.suites = [];
        jest.clearAllMocks();
    });

    it('onAddAttributes: should add attributes for current test in attributes map', function () {
        const currentTest = {
            name: 'test',
            id: 'testItemId',
        };
        reporter.testItems.push(currentTest);
        const attributes = [
            {
                key: 'key1',
                value: 'value1',
            },
        ];
        const expectedAttributes = [{ id: "testItemId", name: "test", attributes }];

        reporter.addAttributes({ attributes });

        expect(reporter.testItems).toEqual(expectedAttributes);
    });

    it('onAddAttributes: should append attributes for current test in attributes map', function () {
        const currentTest = {
            name: 'test',
            id: 'testItemId',
        };
        reporter.testItems.push(currentTest);
        currentTest.attributes = [
            {
                key: 'key1',
                value: 'value1',
            },
        ];
        const attributes = [
            {
                key: 'key2',
                value: 'value2',
            },
            {
                key: 'key3',
                value: 'value3',
            },
        ];

        const expectedAttributes =
            [{
                id: "testItemId", name: "test",

                attributes: [
                    {
                        key: 'key1',
                        value: 'value1',
                    },
                    {
                        key: 'key2',
                        value: 'value2',
                    },
                    {
                        key: 'key3',
                        value: 'value3',
                    },
                ],
            }];

        reporter.addAttributes({ attributes });

        expect(reporter.testItems).toEqual(expectedAttributes);
    });

    it('onAddAttributes: should add attributes for current suite in attributes map', function () {
        const currentSuite = {
            name: 'suite',
            id: 'suiteItemId',
        };

        reporter.suites.push(currentSuite);

        const attributes = [
            {
                key: 'key1',
                value: 'value1',
            },
            {
                key: 'key2',
                value: 'value2',
            },
        ];

        const expectedAttributes =
            [{
                name: 'suite',
                id: 'suiteItemId',
                attributes: [
                    {
                        key: 'key1',
                        value: 'value1',
                    },
                    {
                        key: 'key2',
                        value: 'value2',
                    },
                ],
            }];

        reporter.addAttributes({ attributes });

        expect(reporter.suites).toEqual(expectedAttributes);
    });

    it('onAddAttributes without attributes: should not add attributes for current suite in attributes map', function () {
        const currentSuite = {
            name: 'suite',
            id: 'suiteItemId',
        };

        reporter.suites.push(currentSuite);
        const expectedAttributes = [{
            name: 'suite',
            id: 'suiteItemId'
        }];

        reporter.addAttributes({});

        expect(reporter.suites).toEqual(expectedAttributes);
    });
});
