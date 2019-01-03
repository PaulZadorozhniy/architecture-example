import path from 'path';
import { requireRecursive } from 'common/utils/require-recursive';
import { authenticate } from '../helpers/http-client';

const currentPath = path.dirname(__filename);

describe('Web App acceptance tests', () => {
  before(() => authenticate());

  describe('Curriculum Index Page', () => {
    requireRecursive(path.join(currentPath, 'curriculum-index'));
  });
  describe('Internal API', () => {
    describe('Health Check', () => {
      requireRecursive(path.join(currentPath, 'health-check'));
    });
    describe('Alignment', () => {
      requireRecursive(path.join(currentPath, 'alignment'));
    });
    describe('Import', () => {
      requireRecursive(path.join(currentPath, 'import'));
    });
    describe('Role', () => {
      requireRecursive(path.join(currentPath, 'role'));
    });
    describe('Skill', () => {
      requireRecursive(path.join(currentPath, 'skill'));
    });
    describe('Skill Summary', () => {
      requireRecursive(path.join(currentPath, 'skill-summary'));
    });
    describe('Terminal Objective', () => {
      requireRecursive(path.join(currentPath, 'terminal-objective'));
    });
    describe('Enabling Objective', () => {
      requireRecursive(path.join(currentPath, 'enabling-objective'));
    });
    describe('Account', () => {
      requireRecursive(path.join(currentPath, 'account'));
    });
  });
});
