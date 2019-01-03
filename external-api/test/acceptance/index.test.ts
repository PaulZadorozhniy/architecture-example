import path from 'path';
import { requireRecursive } from 'common/utils/require-recursive';
import { authenticate } from '../helpers/http-client';

const currentPath = path.dirname(__filename);

describe('External API acceptance tests', () => {
  before(() => authenticate());

  describe('System', () => {
    requireRecursive(path.join(currentPath, 'system'));
  });
  describe('Role', () => {
    requireRecursive(path.join(currentPath, 'role'));
  });
  describe('Skill', () => {
    requireRecursive(path.join(currentPath, 'skill'));
  });
  describe('Terminal Objective', () => {
    requireRecursive(path.join(currentPath, 'terminal-objective'));
  });
  describe('Enabling Objective', () => {
    requireRecursive(path.join(currentPath, 'enabling-objective'));
  });
});
