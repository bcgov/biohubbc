'use strict';

/**
 * Parses the npm cli command options and the git action context.
 *
 * @param {*} options
 * @return {{
 *   git: {
 *     dir: '<string>',
 *     branch: {
 *       name: '<string>',
 *       remote: '<string>',
 *       merge: '<string>'
 *     },
 *     url: 'https://github.com/bcgov/biohubbc.git',
 *     uri: 'https://github.com/bcgov/biohubbc',
 *     http_url: 'https://github.com/bcgov/biohubbc.git',
 *     owner: 'bcgov',
 *     repository: 'biohubbc',
 *     pull_request: '<pr_number>',
 *     ref: '<string>',
 *     branch_ref: '<string>'
 *   },
 *   env: 'pr' | 'dev' | 'test' | 'prod',
 *   phase: 'build' | 'deploy',
 *   pr?: '<pr_number>',
 *   branch?: '<branch_name>',
 *   config: {}, // JSON config map
 *   type?: 'static'
 * }}
 */
const processOptions = (options) => {
  const result = { ...options };

  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`;
  }

  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`;
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }

  return result;
};

module.exports = {
  processOptions
};
