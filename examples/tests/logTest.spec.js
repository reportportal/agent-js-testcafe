import path from 'path';
import fs from 'fs';
import { PublicReportingAPI } from '@reportportal/agent-js-testcafe/build/src/publicReportingAPI';

const attachments = [
  {
    filename: 'test.jpg',
    type: 'image/jpg',
  },
  {
    filename: 'test.png',
    type: 'image/png',
  },
  {
    filename: 'test.html',
    type: 'text/html',
  },
  {
    filename: 'test.json',
    type: 'application/json',
  },
  {
    filename: 'test.css',
    type: 'application/css',
  },
  {
    filename: 'test.mp4',
    type: 'video/mp4',
  },
];

fixture`launch, suite and test should contain logs`
  .page('http://devexpress.github.io/testcafe/example')
  .before(async () => {
    PublicReportingAPI.debug('debug suite log');
    PublicReportingAPI.trace('trace suite log');
    PublicReportingAPI.warn('warn suite log');
    PublicReportingAPI.error('error suite log');
    PublicReportingAPI.fatal('fatal suite log');
    PublicReportingAPI.info('info suite log');
  });

test('should contain simple logs of different levels', async (page) => {
  PublicReportingAPI.launchLog('INFO', 'launch log with manually specified info level');
  PublicReportingAPI.launchInfo('info launch log');
  PublicReportingAPI.launchDebug('debug launch log');
  PublicReportingAPI.launchTrace('trace launch log');
  PublicReportingAPI.launchWarn('warn launch log');
  PublicReportingAPI.launchError('error launch log');
  PublicReportingAPI.launchFatal('fatal launch log');
  PublicReportingAPI.debug('debug log');
  PublicReportingAPI.trace('trace log');
  PublicReportingAPI.warn('warning');
  PublicReportingAPI.error('error log');
  PublicReportingAPI.fatal('fatal log');
  PublicReportingAPI.info('info log');
  await page.expect(true).eql(true);
});

test('should contain logs with attachments', async (page) => {
  const readFilesPromises = attachments.map(
    ({ filename, type }) =>
      new Promise((resolve) =>
        fs.readFile(path.resolve(__dirname, './attachments', filename), (err, data) => {
          if (err) {
            throw err;
          }
          const attachment = {
            name: filename,
            type,
            content: data.toString('base64'),
          };
          PublicReportingAPI.info('info log with attachment', attachment);
          resolve();
        }),
      ),
  );
  await Promise.all(readFilesPromises);

  await page.expect(true).eql(true);
});
