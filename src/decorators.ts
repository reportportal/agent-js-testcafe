import { randomUUID } from 'crypto';
import * as nunjucks from 'nunjucks';
import { t } from 'testcafe';
import { STATUSES } from './constants';
import { TestCafeStepDefinition } from './models/reporting';

// Symbol for storing display names on object instances
const DISPLAY_NAME_SYMBOL = Symbol('displayName');

// Step tracking for parent-child relationships
interface StepContext {
  id: string;
  parentId: string | null;
  description: string;
  startTime: number;
}

// Stack to track the current step hierarchy
const stepStack: StepContext[] = [];

async function logStepRP(stepReportPortal: TestCafeStepDefinition): Promise<void> {
  await t.report({ stepReportPortal });
}

/**
 * Generate a new UUID for step identification
 */
function generateStepId(): string {
  return randomUUID();
}

/**
 * Get the current parent step ID from the step stack
 */
function getCurrentParentId(): string | null {
  return stepStack.length > 0 ? stepStack[stepStack.length - 1].id : null;
}

/**
 * Push a new step context onto the stack
 */
function pushStepContext(id: string, description: string, startTime: number): void {
  const parentId = getCurrentParentId();
  stepStack.push({
    id,
    parentId,
    description,
    startTime,
  });
}

/**
 * Pop the current step context from the stack
 */
function popStepContext(): StepContext | undefined {
  return stepStack.pop();
}

// Lazy singleton for Nunjucks environment
let nunjucksEnv: nunjucks.Environment | null = null;

/**
 * Get or create the Nunjucks environment instance with custom functions
 */
function getNunjucksEnvironment(): nunjucks.Environment {
  if (nunjucksEnv === null) {
    // Create the environment once
    nunjucksEnv = new nunjucks.Environment(null, { autoescape: false });

    // Add custom function for handling default values in step logging
    nunjucksEnv.addGlobal(
      'handleDefault',
      function (
        templateArgs: any[],
        defaultValue: any,
        trueValue: any,
        falseValue: any,
        index = 0,
      ) {
        let actualValue: any;

        // Get the actual value or use default
        if (templateArgs == null || templateArgs.length <= index) {
          actualValue = defaultValue;
        } else {
          actualValue = templateArgs[index];
        }

        // Return trueValue if actualValue is truthy, otherwise falseValue
        return actualValue != null &&
          actualValue !== false &&
          actualValue !== 0 &&
          actualValue !== ''
          ? trueValue
          : falseValue;
      },
    );
  }

  return nunjucksEnv;
}

/**
 * Process step description template with argument placeholders using Nunjucks
 * @param template The step description template with {{args[0]}}, {{args[1]}}, {{this}}, etc. placeholders
 * @param args The method arguments array
 * @param selfInfo The string representation of the object instance
 * @returns Processed step description with arguments substituted, or fallback with all args
 */
function processStepTemplate(template: string, args: any[], selfInfo?: string): string {
  // Check if template contains Nunjucks placeholders {{...}} or {%...%}
  const nunjucksPlaceholderRegex = /\{\{[^}]+\}\}|\{%[^%]+%\}/g;
  const hasPlaceholders = nunjucksPlaceholderRegex.test(template);

  if (!hasPlaceholders && args.length === 0) {
    // No placeholders and no arguments, return template as-is
    return template;
  }

  if (!hasPlaceholders) {
    // No placeholders found, return original template with all arguments appended
    const filteredArgs = args.filter((arg) => arg !== ''); // Remove empty string arguments
    if (filteredArgs.length === 0) {
      return template;
    }
    const argsDisplay = ` with args: ${JSON.stringify(filteredArgs).slice(1, -1)}`;
    return `${template}${argsDisplay}`;
  }

  // Create context object with indexed arguments and object info
  const context: Record<string, any> = {
    args,
  };

  // Add 'this' context for object information
  if (selfInfo != null && selfInfo.length > 0) {
    context.this = selfInfo;
  }

  try {
    // Get the singleton Nunjucks environment
    const env = getNunjucksEnvironment();

    // Use Nunjucks for templating
    return env.renderString(template, context);
  } catch (error) {
    // If template rendering fails, fallback to original template with args
    const argsDisplay = args.length > 0 ? ` with args: ${JSON.stringify(args).slice(1, -1)}` : '';
    return `${template}${argsDisplay}`;
  }
}

/**
 * A decorator that assigns a display name to a class property for use in step logging
 * @param displayName The name to use when displaying this object in step logs
 * @returns A property decorator that stores the display name
 */
export function name(displayName: string) {
  return function (target: any, propertyKey: string): void {
    // Store the display name using a getter that returns the name
    Object.defineProperty(target, propertyKey, {
      get: function () {
        return this[`_${propertyKey}`];
      },
      set: function (value: any) {
        this[`_${propertyKey}`] = value;
        // Store the display name on the object instance
        if (value != null && typeof value === 'object') {
          value[DISPLAY_NAME_SYMBOL] = displayName;

          // Also assign the same display name to the verify member if it exists
          if (value.verify != null && typeof value.verify === 'object') {
            value.verify[DISPLAY_NAME_SYMBOL] = displayName;
          }
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Get the display name for an object, falling back to toString() if no name is set
 * This function can be used in assertion messages to get the same name used in step logging
 * @param obj The object to get the display name for
 * @returns The display name or toString() result
 */
export async function getObjectDisplayName(obj: any): Promise<string> {
  // Check if object has a display name set by @name decorator
  if (obj != null && typeof obj === 'object' && DISPLAY_NAME_SYMBOL in obj) {
    const displayName = obj[DISPLAY_NAME_SYMBOL];
    if (typeof displayName === 'string' && displayName.length > 0) {
      return displayName;
    }
  }

  // Fall back to toString() method
  if (obj != null && typeof obj.toString === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const toStringResult = await obj.toString();
    return toStringResult.length > 0 && toStringResult !== '[object Object]' ? toStringResult : '';
  }

  return '';
}

/**
 * A decorator function for logging step descriptions with method arguments, supporting advanced templating via Nunjucks.
 *
 * This decorator is designed for troubleshooting and reporting in test automation scenarios. It logs a formatted step message
 * each time the decorated method is called, including argument values, object display names, step numbering, hierarchy, and timestamps.
 * The step description supports Nunjucks templating, allowing dynamic insertion of arguments and object information.
 *
 * ### Usage
 *
 * ```typescript
 * import { step } from './utils/decorators';
 *
 * class LoginPage {
 *   @step('Enter username: {{args[0]}} into {{this}}')
 *   async enterUsername(username: string) {
 *     // ... implementation ...
 *   }
 *
 *   @step('Verify login with {{handleDefault(args, "guest", "User logged in", "Guest login", 0)}}')
 *   async verifyLogin(user?: string) {
 *     // ... implementation ...
 *   }
 * }
 * ```
 *
 * - `{{args[0]}}`, `{{args[1]}}`, etc.: Inserts method arguments by index.
 * - `{{this}}`: Inserts the display name of the object instance, set via the `@name` decorator or `toString()`.
 * - `{{handleDefault(args, defaultValue, trueValue, falseValue, index)}}`: Custom Nunjucks global function to handle default values and conditional output.
 *   - If `args[index]` is truthy, returns `trueValue`; otherwise, returns `falseValue`.
 *
 * ### Options
 *
 * - `logIfNested` (default: `true`): If `false`, suppresses logging for nested steps.
 *
 * ### Step Output Formatting
 *
 * Output formatting is controlled by the centralized `config.stepLogging` settings:
 * - `numbered`: Enables step numbering (e.g., "1", "2.1").
 * - `tree`: Enables hierarchical indentation using Unicode box-drawing characters.
 * - `timestamps`: Prepends a timestamp to each step.
 * - `symbol`: Custom symbol for step markers.
 * - `timeFormat`: Moment.js format string for timestamps.
 *
 * ### Example Output
 *
 * ```
 * [⏱ 1] Enter username: "admin" into LoginPage
 * │  ├── [⏱ 1.1] Verify login with User logged in
 * ```
 *
 * @param stepDescription The Nunjucks template string describing the step. Supports placeholders for arguments and object info.
 * @param options Optional configuration for step logging behavior.
 * @returns A method decorator that logs the step with arguments and context.
 */
export function step(stepDescription: string, options?: { logIfNested?: boolean }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      // Check if we should log this step based on nesting configuration

      // Get display name for the object instance (using @name decorator or fallback to toString)
      const selfInfo = await getObjectDisplayName(this);
      const processedDescription = processStepTemplate(stepDescription, args, selfInfo);

      // Generate unique step ID and track parent relationship
      const stepId = generateStepId();
      const parentId = getCurrentParentId();

      // Push current step context onto the stack
      pushStepContext(stepId, processedDescription, startTime);

      // Execute the original method (could be sync or async)
      const result = originalMethod?.apply(this, args);
      let status: STATUSES = STATUSES.PASSED;

      try {
        return await (result as Promise<any>);
      } catch (e) {
        status = STATUSES.FAILED;
        throw e;
      } finally {
        // Pop the current step context from the stack
        popStepContext();

        // Log step to Report Portal with proper parent ID
        await logStepRP({
          id: stepId,
          startTime,
          finishTime: Date.now(),
          title: processedDescription,
          status,
          parentId,
        });
      }
    };

    return descriptor;
  };
}
