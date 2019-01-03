import path from 'path';
import { requireRecursive } from 'common/utils/require-recursive';

const currentPath = path.dirname(__filename);

describe('External API unit tests', () => {
  describe('Middleware', () => {
    requireRecursive(path.join(currentPath, 'middleware'));
  });

  describe('API', () => {
    describe('Role', () => {
      requireRecursive(path.join(currentPath, 'api', 'role'));
    });
    describe('Skill', () => {
      requireRecursive(path.join(currentPath, 'api', 'skill'));
    });
    describe('Terminal objective', () => {
      requireRecursive(path.join(currentPath, 'api', 'terminal-objective'));
    });
    describe('Enabling objective', () => {
      requireRecursive(path.join(currentPath, 'api', 'enabling-objective'));
    });
    describe('API token', () => {
      requireRecursive(path.join(currentPath, 'api', 'api-token'));
    });
  });
});
