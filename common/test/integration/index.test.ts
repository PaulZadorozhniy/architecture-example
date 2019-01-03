import path from 'path';
import { requireRecursive } from 'common/utils/require-recursive';

const currentPath = path.dirname(__filename);

describe('Common integration tests', () => {
  describe('Repositories', () => {
    requireRecursive(path.join(currentPath, 'repositories'));
  });
});
