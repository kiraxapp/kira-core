// @ts-check
/* eslint-disable */

const { Run } = require('../../../lib');

Run.development({
  hmr: true,
  parseWithBabel: true,
  root: process.cwd(),
  customEnv: 'test',
  loadConfigPathToFile: `${process.cwd()}/test.json`,
});