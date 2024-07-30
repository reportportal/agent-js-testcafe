# @reportportal/agent-js-testcafe

Agent to integrate TestCafe with ReportPortal.
* More about [TestCafe](https://testcafe.io/)
* More about [ReportPortal](http://reportportal.io/)

## Installation

Install the agent in your project:
```cmd
npm install --save-dev testcafe-reporter-agent-js-testcafe@npm:@reportportal/testcafe-reporter-agent-js-testcafe
```

> **Note:** This package is namespaced. Therefore the following command can be used to install the reporter in a way that TestCafe can detect it. ([Related issue in TestCafé repository](https://github.com/DevExpress/testcafe/issues/4692))

## Configuration

**1.** Create `rp.json` file with reportportal configuration:
```json
{
  "apiKey": "<API_KEY>",
  "endpoint": "https://your.reportportal.server/api/v1",
  "project": "YourReportPortalProjectName",
  "launch": "YourLauncherName",
  "attributes": [
    {
      "key": "YourKey",
      "value": "YourValue"
    },
    {
      "value": "YourValue"
    }
  ]
}
```

| Option                | Necessity  | Default   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-----------------------|------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| apiKey                | Required   |           | User's reportportal token from which you want to send requests. It can be found on the profile page of this user.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| endpoint              | Required   |           | URL of your server. For example 'https://server:8080/api/v1'.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| launch                | Required   |           | Name of launch at creation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| project               | Required   |           | The name of the project in which the launches will be created.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| attributes            | Optional   | []        | Launch attributes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| description           | Optional   | ''        | Launch description.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| rerun                 | Optional   | false     | Enable [rerun](https://reportportal.io/docs/dev-guides/RerunDevelopersGuide)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| rerunOf               | Optional   | Not set   | UUID of launch you want to rerun. If not specified, reportportal will update the latest launch with the same name                                                                                                                                                                                                                                                                                                                                                                                                                                |
| mode                  | Optional   | 'DEFAULT' | Results will be submitted to Launches page <br/> *'DEBUG'* - Results will be submitted to Debug page (values must be upper case).                                                                                                                                                                                                                                                                                                                                                                                                                |
| debug                 | Optional   | false     | This flag allows seeing the logs of the client-javascript. Useful for debugging.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| restClientConfig      | Optional   | Not set   | `axios` like http client [config](https://github.com/axios/axios#request-config). May contain `agent` property for configure [http(s)](https://nodejs.org/api/https.html#https_https_request_url_options_callback) client, and other client options e.g. `proxy`, [`timeout`](https://github.com/reportportal/client-javascript#timeout-30000ms-on-axios-requests). For debugging and displaying logs the `debug: true` option can be used. <br/> Visit [client-javascript](https://github.com/reportportal/client-javascript) for more details. |
| headers               | Optional   | {}        | The object with custom headers for internal http client.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| launchUuidPrint       | Optional   | false     | Whether to print the current launch UUID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| launchUuidPrintOutput | Optional   | 'STDOUT'  | Launch UUID printing output. Possible values: 'STDOUT', 'STDERR', 'FILE', 'ENVIRONMENT'. Works only if `launchUuidPrint` set to `true`. File format: `rp-launch-uuid-${launch_uuid}.tmp`. Env variable: `RP_LAUNCH_UUID`, note that the env variable is only available in the reporter process (it cannot be obtained from tests).                                                                                                                                                                                                               |
| skippedIssue          | Optional   | true      | reportportal provides feature to mark skipped tests as not 'To Investigate'. <br/> Option could be equal boolean values: <br/> *true* - skipped tests considered as issues and will be marked as 'To Investigate' on reportportal. <br/> *false* - skipped tests will not be marked as 'To Investigate' on application.                                                                                                                                                                                                                          |
| token                 | Deprecated | Not set   | Use `apiKey` instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

**2.1** Create `.testcaferc.json` TestCafe [configuration file](https://testcafe.io/documentation/402638/reference/configuration-file) and add `agent-js-testcafe` to the `reporter` property
```json
{
  "browsers": "chrome",
  "src": "./tests/**/*.js",
  "screenshots": {
    "path": "./screenshots/"
  },
  "reporter": [
    {
      "name": "list"
    },
    {
      "name": "agent-js-testcafe"
    }
  ],
  "takeScreenshotsOnFails": true
}
```

Run tests via `testcafe` command.

**2.2** As an alternative if you are using API you can create `testcafe.js` file and use the reporter with provided config manually:
```javascript
const createTestCafe = require('testcafe');
const { createReporter } = require('testcafe-reporter-agent-js-testcafe/build/createReporter');
const rpConfig = require('./rp.json');

async function start() {
  const testcafe = await createTestCafe('localhost');
  const runner = testcafe.createRunner();

  await runner.reporter(createReporter(rpConfig)).run(); // or just set 'agent-js-testcafe'

  await testcafe.close();
}

start();
```

Run tests via `node testcafe.js`.

> **Note:** TestCafe options from `.testcaferc.json` can be overwritten programmatically in `testcafe.js`

## Reporting

This reporter provides Reporting API to use it directly in tests to send some additional data to the report.

There are two ways to add additional data to the tests.

### Using TestCafe `meta` method:

**1.** For `fixture`:
```javascript
fixture`Getting Started`.page`http://devexpress.github.io/testcafe/example`
  .meta({
    description: 'Suite description',
    attributes: [{ key: 'page', value: 'testCafeExample' }, { value: 'sample' }],
  });
```

**2.** For `test`:
```javascript
test('My first test', async (page) => {
  await page
    .typeText('#developer-name', 'John Smith')
    .click('#submit-button')
    .expect(Selector('#article-header').innerText)
    .eql('Thank you, John Smith!');
}).meta({
  description: 'Test form behavior',
  attributes: [{ key: 'test', value: 'form' }],
});
```

Only `attributes` and `description` properties supported.

### Using `ReportingApi`:

To start using the `ReportingApi` in tests, just import it from `'@reportportal/agent-js-testcafe'`:
```javascript
const { ReportingApi } = require('testcafe-reporter-agent-js-testcafe/build/reportingApi');
```

#### Reporting API methods

The API provide methods for attaching data (logs, attributes, testCaseId, status).

##### addAttributes
Add attributes(tags) to the current test. Should be called inside of corresponding test or fixture.<br/>
`ReportingApi.addAttributes(attributes: Array<Attribute>);`<br/>
**required**: `attributes`<br/>
Example:
```javascript
test('should have the correct attributes', async (t) => {
  ReportingApi.addAttributes([
    {
      key: 'testKey',
      value: 'testValue',
    },
    {
      value: 'testValueTwo',
    },
  ]);
  await t.expect(true).eql(true);
});
```

##### setTestCaseId
Set test case id to the current test. Should be called inside of corresponding test or fixture.<br/>
`ReportingApi.setTestCaseId(id: string);`<br/>
**required**: `id`<br/>
If `testCaseId` not specified, it will be generated automatically.<br/>
Example:
```javascript
test('should have the correct testCaseId', async (t) => {
  ReportingApi.setTestCaseId('itemTestCaseId');
  await t.expect(true).eql(true);
});
```

##### log
Send logs to report portal for the current test. Should be called inside of corresponding test or fixture.<br/>
`ReportingApi.log(level: LOG_LEVELS, message: string, file?: Attachment);`<br/>
**required**: `level`, `message`<br/>
where `level` can be one of the following: *TRACE*, *DEBUG*, *WARN*, *INFO*, *ERROR*, *FATAL*<br/>
Example:
```javascript
test('should contain logs with attachments', async (page) => {
  const fileName = 'test.jpg';
  const fileContent = fs.readFileSync(path.resolve(__dirname, './attachments', fileName));
  const attachment = {
    name: fileName,
    type: 'image/jpg',
    content: fileContent.toString('base64'),
  };
  ReportingApi.log('INFO', 'info log with attachment', attachment);

  await page.expect(true).eql(true);
});
```

##### info, debug, warn, error, trace, fatal
Send logs with corresponding level to report portal for the current test or for provided by name. Should be called inside of corresponding test or fixture.<br/>
`ReportingApi.info(message: string, file?: Attachment);`<br/>
`ReportingApi.debug(message: string, file?: Attachment);`<br/>
`ReportingApi.warn(message: string, file?: Attachment);`<br/>
`ReportingApi.error(message: string, file?: Attachment);`<br/>
`ReportingApi.trace(message: string, file?: Attachment);`<br/>
`ReportingApi.fatal(message: string, file?: Attachment);`<br/>
**required**: `message`<br/>
Example:
```javascript
test('should contain logs with attachments', async (page) => {
    ReportingApi.info('Log message');
    ReportingApi.debug('Log message');
    ReportingApi.warn('Log message');
    ReportingApi.error('Log message');
    ReportingApi.trace('Log message');
    ReportingApi.fatal('Log message');
    
    await page.expect(true).eql(true);
});
```

##### launchLog
Send logs to report portal for the current launch. Should be called inside of the any test or fixture.<br/>
`ReportingApi.launchLog(level: LOG_LEVELS, message: string, file?: Attachment);`<br/>
**required**: `level`, `message`<br/>
where `level` can be one of the following: *TRACE*, *DEBUG*, *WARN*, *INFO*, *ERROR*, *FATAL*<br/>
Example:
```javascript
test('should contain logs with attachments', async (page) => {
  const fileName = 'test.jpg';
  const fileContent = fs.readFileSync(path.resolve(__dirname, './attachments', fileName));
  const attachment = {
    name: fileName,
    type: 'image/jpg',
    content: fileContent.toString('base64'),
  };
  ReportingApi.launchLog('INFO', 'info log with attachment', attachment);

  await page.expect(true).eql(true);
});
```

##### launchInfo, launchDebug, launchWarn, launchError, launchTrace, launchFatal
Send logs with corresponding level to report portal for the current launch. Should be called inside of the any test or fixture.<br/>
`ReportingApi.launchInfo(message: string, file?: Attachment);`<br/>
`ReportingApi.launchDebug(message: string, file?: Attachment);`<br/>
`ReportingApi.launchWarn(message: string, file?: Attachment);`<br/>
`ReportingApi.launchError(message: string, file?: Attachment);`<br/>
`ReportingApi.launchTrace(message: string, file?: Attachment);`<br/>
`ReportingApi.launchFatal(message: string, file?: Attachment);`<br/>
**required**: `message`<br/>
Example:
```javascript
test('should contain logs with attachments', async (page) => {
    ReportingApi.launchInfo('Log message');
    ReportingApi.launchDebug('Log message');
    ReportingApi.launchWarn('Log message');
    ReportingApi.launchError('Log message');
    ReportingApi.launchTrace('Log message');
    ReportingApi.launchFatal('Log message');
    
    await page.expect(true).eql(true);
});
```

##### setStatus
Assign corresponding status to the current test item.<br/>
`ReportingApi.setStatus(status: string);`<br/>
**required**: `status`<br/>
where `status` must be one of the following: *passed*, *failed*, *stopped*, *skipped*, *interrupted*, *cancelled*, *info*, *warn*<br/>
Example:
```javascript
test('should have status FAILED', async (page) => {
    ReportingApi.setStatus('failed');
    
    await page.expect(true).eql(true);
});
```

##### setStatusFailed, setStatusPassed, setStatusSkipped, setStatusStopped, setStatusInterrupted, setStatusCancelled, setStatusInfo, setStatusWarn
 Assign corresponding status to the current test item.<br/>
`ReportingApi.setStatusFailed();`<br/>
`ReportingApi.setStatusPassed();`<br/>
`ReportingApi.setStatusSkipped();`<br/>
`ReportingApi.setStatusStopped();`<br/>
`ReportingApi.setStatusInterrupted();`<br/>
`ReportingApi.setStatusCancelled();`<br/>
`ReportingApi.setStatusInfo();`<br/>
`ReportingApi.setStatusWarn();`<br/>
Example:
```javascript
test('should call ReportingApi to set statuses', async (page) => {
    ReportingAPI.setStatusFailed();
    ReportingAPI.setStatusPassed();
    ReportingAPI.setStatusSkipped();
    ReportingAPI.setStatusStopped();
    ReportingAPI.setStatusInterrupted();
    ReportingAPI.setStatusCancelled();
    ReportingAPI.setStatusInfo();
    ReportingAPI.setStatusWarn();
});
```

##### setLaunchStatus
Assign corresponding status to the current launch.<br/>
`ReportingApi.setLaunchStatus(status: string);`<br/>
**required**: `status`<br/>
where `status` must be one of the following: *passed*, *failed*, *stopped*, *skipped*, *interrupted*, *cancelled*, *info*, *warn*<br/>
Example:
```javascript
test('launch should have status FAILED', async (page) => {
    ReportingApi.setLaunchStatus('failed');
    
    await page.expect(true).eql(true);
});
```

##### setLaunchStatusFailed, setLaunchStatusPassed, setLaunchStatusSkipped, setLaunchStatusStopped, setLaunchStatusInterrupted, setLaunchStatusCancelled, setLaunchStatusInfo, setLaunchStatusWarn
 Assign corresponding status to the current test item.<br/>
`ReportingApi.setLaunchStatusFailed();`<br/>
`ReportingApi.setLaunchStatusPassed();`<br/>
`ReportingApi.setLaunchStatusSkipped();`<br/>
`ReportingApi.setLaunchStatusStopped();`<br/>
`ReportingApi.setLaunchStatusInterrupted();`<br/>
`ReportingApi.setLaunchStatusCancelled();`<br/>
`ReportingApi.setLaunchStatusInfo();`<br/>
`ReportingApi.setLaunchStatusWarn();`<br/>
Example:
```javascript
test('should call ReportingApi to set launch statuses', async (page) => {
    ReportingAPI.setLaunchStatusFailed();
    ReportingAPI.setLaunchStatusPassed();
    ReportingAPI.setLaunchStatusSkipped();
    ReportingAPI.setLaunchStatusStopped();
    ReportingAPI.setLaunchStatusInterrupted();
    ReportingAPI.setLaunchStatusCancelled();
    ReportingAPI.setLaunchStatusInfo();
    ReportingAPI.setLaunchStatusWarn();
});
```

#### Integration with Sauce Labs

To integrate with Sauce Labs just add attributes for the test case: 

```javascript
[{
 "key": "SLID",
 "value": "# of the job in Sauce Labs"
}, {
 "key": "SLDC",
 "value": "EU (your job region in Sauce Labs)"
}]
```
