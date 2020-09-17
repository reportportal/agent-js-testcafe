export class Reporter {
  private noColors: boolean;
  private chalk: any;

  constructor() {
    this.noColors = true;
  };

  // createErrorDecorator () {
  //   return {
  //     'span category':       () => '',
  //     'span step-name': (str: any) => `"${str}"`,
  //     'span user-agent': (str: any) => this.chalk.gray(str),
  //     'div screenshot-info': (str: any) => str,
  //     'a screenshot-path': (str: any) => this.chalk.underline(str),
  //     'code': (str: any) => this.chalk.yellow(str),
  //     'code step-source': (str: any) => this.chalk.magenta(this.indentString(str, 4)),
  //     'span code-line': (str: any) => `${str}\n`,
  //     'span last-code-line': (str: any) => str,
  //     'code api': (str: any) => this.chalk.yellow(str),
  //     'strong': (str: any) => this.chalk.cyan(str),
  //     'a': (str: any) => this.chalk.yellow(`"${str}"`)
  //   };
  // }

  reportTaskStart(...props: any[]/* startTime, userAgents, testCount */) {
    console.log(props);
    // throw new Error('Not implemented');
  }

  reportFixtureStart(/* name, path */) {
    // throw new Error('Not implemented');
  }

  reportTestStart(/* name, testMeta */) {
    // NOTE: This method is optional.
  }

  reportTestDone(/* name, testRunInfo */) {
    // throw new Error('Not implemented');
  }

  reportTaskDone(/* endTime, passed, warnings */) {
    // throw new Error('Not implemented');
  }

  private indentString(str: any, number: number): void {
    return undefined;
  }
}
