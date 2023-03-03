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

import { Reporter, TestItem } from '../../reporter';
import { config } from '../mocks/configMock';

describe('attributes reporting', function () {
  let reporter: Reporter;
  beforeAll(function () {
    reporter = new Reporter(config);
  });

  afterEach(function () {
    // @ts-ignore access to the class private property
    reporter.testItems = [];
    // @ts-ignore access to the class private property
    reporter.suites = [];
    jest.clearAllMocks();
  });

  it('onAddAttributes: should add attributes for current test in attributes map', function () {
    const currentTest = {
      name: 'test',
      id: 'testItemId',
    };
    // @ts-ignore access to the class private property
    reporter.testItems.push(currentTest);
    const attributes = [
      {
        key: 'key1',
        value: 'value1',
      },
    ];
    const expectedSuites = [{ id: 'testItemId', name: 'test', attributes }];

    reporter.addAttributes({ attributes });

    // @ts-ignore access to the class private property
    expect(reporter.testItems).toEqual(expectedSuites);
  });

  it('onAddAttributes: should append attributes for current test in attributes map', function () {
    const currentTest: TestItem = {
      name: 'test',
      id: 'testItemId',
    };
    // @ts-ignore access to the class private property
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

    const expectedSuites = [
      {
        id: 'testItemId',
        name: 'test',

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
      },
    ];

    reporter.addAttributes({ attributes });

    // @ts-ignore access to the class private property
    expect(reporter.testItems).toEqual(expectedSuites);
  });

  it('onAddAttributes: should add attributes for current suite in attributes map', function () {
    const currentSuite = {
      name: 'suite',
      id: 'suiteItemId',
    };

    // @ts-ignore access to the class private property
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

    const expectedSuites = [
      {
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
      },
    ];

    reporter.addAttributes({ attributes });

    // @ts-ignore access to the class private property
    expect(reporter.suites).toEqual(expectedSuites);
  });
});
