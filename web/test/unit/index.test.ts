import path from 'path';
import { requireRecursive } from 'common/utils/require-recursive';

const currentPath = path.dirname(__filename);

describe('Web App unit tests', () => {
  describe('Caches', () => {
    requireRecursive(path.join(currentPath, 'caches'));
  });
  describe('Middleware', () => {
    requireRecursive(path.join(currentPath, 'middleware'));
  });
  describe('Internal API', () => {
    describe('Role', () => {
      requireRecursive(path.join(currentPath, 'internal-api', 'role'));
    });
    describe('Skill', () => {
      requireRecursive(path.join(currentPath, 'internal-api', 'skill'));
    });
    describe('Skill', () => {
      requireRecursive(path.join(currentPath, 'internal-api', 'skill-summary'));
    });
    describe('Terminal objective', () => {
      requireRecursive(
        path.join(currentPath, 'internal-api', 'terminal-objective')
      );
    });
    describe('Enabling objective', () => {
      requireRecursive(
        path.join(currentPath, 'internal-api', 'enabling-objective')
      );
    });
    describe('Import from CSV', () => {
      requireRecursive(path.join(currentPath, 'internal-api', 'import-csv'));
    });
    describe('Alignment', () => {
      requireRecursive(path.join(currentPath, 'internal-api', 'import-csv'));
    });
    describe('Account', () => {
      requireRecursive(path.join(currentPath, 'internal-api', 'account'));
    });
  });
});
