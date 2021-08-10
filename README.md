# @reportportal/agent-js-testcafe

Agent for integration TestCafe with ReportPortal.
* More about [TestCafe](https://testcafe.io/)
* More about [ReportPortal](http://reportportal.io/)

## Installation

Install the agent in your project:
```cmd
npm install --save-dev @reportportal/agent-js-testcafe
```
## Configuration

**1.** Create `rp.json` file with reportportal configuration:
```json
{
    "token": "00000000-0000-0000-0000-000000000000",
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
    ],
    "description": "Your launch description",
    "rerun": true,
    "rerunOf": "launchUuid of already existed launch",
    "mode": "DEFAULT",
    "skippedIssue": true,
    "debug": false
}
```

| Parameter             | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| token                 | User's Report Portal token from which you want to send requests. It can be found on the profile page of this user.|
| endpoint              | URL of your server. For example 'https://server:8080/api/v1'.                                                     |
| launch                | Name of launch at creation.                                                                                       |
| project               | The name of the project in which the launches will be created.                                                    |
| rerun                 | *Default: false.* Enable [rerun](https://github.com/reportportal/documentation/blob/master/src/md/src/DevGuides/rerun.md)|
| rerunOf               | UUID of launch you want to rerun. If not specified, report portal will update the latest launch with the same name|
| mode                  | Launch mode. Allowable values *DEFAULT* (by default) or *DEBUG*.|
| skippedIssue          | *Default: true.* ReportPortal provides feature to mark skipped tests as not 'To Investigate' items on WS side.<br> Parameter could be equal boolean values:<br> *TRUE* - skipped tests considered as issues and will be marked as 'To Investigate' on Report Portal.<br> *FALSE* - skipped tests will not be marked as 'To Investigate' on application.|
| debug                 | This flag allows seeing the logs of the client-javascript. Useful for debugging.|


**2.** Create `testcafe.js` file and use the reporter with provided config:
```javascript
const createTestCafe = require('testcafe');
const { configureReporter } = require('@reportportal/agent-js-testcafe');
const rpConfig = require('./rp.json');

async function start() {
  const testcafe = await createTestCafe('localhost');
  const runner = testcafe.createRunner();

  await runner.reporter(configureReporter(rpConfig)).run();

  await testcafe.close();
}

start();
```

**3.** Run tests via `node testcafe.js`

**Note:** TestCafe options from `.testcaferc.json` can be overwritten programmatically in `testcafe.js`


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
const { ReportingApi } = require('@reportportal/agent-js-testcafe');
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
