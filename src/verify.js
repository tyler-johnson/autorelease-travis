import {has,isRegExp} from "lodash";
import travisAfterAll from "travis-after-all";

export default async function(r, {branch}) {
	if (process.env.TRAVIS !== "true") {
		throw new Error("This is not running on Travis CI and therefore a new version won't be published.");
	}

	if (has(process.env, "TRAVIS_PULL_REQUEST") && process.env.TRAVIS_PULL_REQUEST !== "false") {
		throw new Error("This test run was triggered by a pull request and therefore a new version won't be published.");
	}

	if (process.env.TRAVIS_TAG) {
		throw new Error("This test run was triggered by a git tag and therefore a new version won't be published.");
	}

	let pass = true;
	let current = process.env.TRAVIS_BRANCH;

	if (isRegExp(branch)) {
		pass = branch.test(current);
	} else if (typeof branch === "string") {
		pass = current === branch;
	} else if (typeof branch === "function") {
		pass = await branch(current);
	}

	if (!pass) {
		throw new Error(`This autorelease was triggered on branch ${current}, which is not a branch autorelease is configured to publish from.`);
	}

	await new Promise((resolve, reject) => {
		travisAfterAll((code, err) => {
			if (err) return reject(err);

			if (code === 0) return resolve();
			else if (code === 1) {
				return reject(new Error("In this run not all jobs passed and therefore a new version won't be published."));
			}
			else if (code === 2) {
				return reject(new Error("This test run is not the build leader and therefore a new version won't be published."));
			}
			else {
				return reject(new Error("Unkown travis-after-all error"));
			}
		});
	});
}
