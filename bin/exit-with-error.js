// @ts-check
import chalk from "chalk";

const logError = chalk.bold.red;

/**
 * function to exit the program with optional error message
 * @param {string} err
 * @param {number} [exitCode]
 * @returns void
 */
export function exitWithError(err, exitCode) {
	if (err) {
		console.error(logError(err));
	}
	process.exit(exitCode);
}
