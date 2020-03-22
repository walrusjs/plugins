import stdin from 'get-stdin';
import load from '@commitlint/load';
import lint from '@commitlint/lint';
import read from '@commitlint/read';
import { lodash } from '@birman/utils';
import {
  checkFromStdin,
  normalizeFlags,
  checkFromRepository,
  getSeed,
  loadFormatter,
  selectParserOpts
} from './utils';

const pkg = require('../package');
const { pick, isFunction } = lodash;

export default async function main(raw, options) {
	const flags = normalizeFlags(options);
	const fromStdin = checkFromStdin(raw, flags);

	const range = pick(flags, 'edit', 'from', 'to');

	const input = await (fromStdin ? stdin() : read(range, {cwd: flags.cwd}));

	const messages = (Array.isArray(input) ? input : [input])
		.filter(message => typeof message === 'string')
		.filter(message => message.trim() !== '')
		.filter(Boolean);

	if (messages.length === 0 && !checkFromRepository(flags)) {
		const err = new Error(
			'[input] is required: supply via stdin, or --env or --edit or --from and --to'
		);
		err['type'] = pkg.name;
		console.log(err.message);
		throw err;
	}

	const loadOpts = {cwd: flags.cwd, file: flags.config};
	const loaded = await load(getSeed(flags), loadOpts);
	const parserOpts = selectParserOpts(loaded.parserPreset);
	const opts = {
		parserOpts: {},
		plugins: {},
		ignores: [],
		defaultIgnores: true
	};
	if (parserOpts) {
		opts.parserOpts = parserOpts;
	}
	if (loaded.plugins) {
		opts.plugins = loaded.plugins;
	}
	if (loaded.ignores) {
		opts.ignores = loaded.ignores;
	}
	if (loaded.defaultIgnores === false) {
		opts.defaultIgnores = false;
	}
	const format = loadFormatter(loaded, flags);

	// Strip comments if reading from `.git/COMMIT_EDIT_MSG`
	if (range.edit) {
		opts.parserOpts['commentChar'] = '#';
	}

	const results = await Promise.all(
		messages.map(message => lint(message, loaded.rules, opts))
	);

	if (Object.keys(loaded.rules).length === 0) {
		let input = '';

		if (results.length !== 0) {
			const originalInput = results[0].input;
			input = originalInput;
		}

		results.splice(0, results.length, {
			valid: false,
			errors: [
				{
					level: 2,
					valid: false,
					name: 'empty-rules',
					message: [
						'Please add rules to your `commitlint.config.js`',
						'    - Getting started guide: https://git.io/fhHij',
						'    - Example config: https://git.io/fhHip'
					].join('\n')
				}
			],
			warnings: [],
			input
		});
	}

	const report = results.reduce(
		(info, result) => {
			info.valid = result.valid ? info.valid : false;
			info.errorCount += result.errors.length;
			info.warningCount += result.warnings.length;
			info.results.push(result);

			return info;
		},
		{
			valid: true,
			errorCount: 0,
			warningCount: 0,
			results: []
		}
	);

	const output = format(report, {
		color: flags.color,
		verbose: flags.verbose,
		helpUrl: flags.helpUrl
			? flags.helpUrl.trim()
			: 'https://github.com/walrusjs/plugins/tree/master/packages/plugin-commitlint'
	});

	if (!flags.quiet && output !== '') {
		console.log(output);
	}

	if (!report.valid) {
		const err = new Error(output);
		err['type'] = pkg.name;
		throw err;
	}
}

// Catch unhandled rejections globally
process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at: Promise ', promise, ' reason: ', reason);
	throw reason;
});
