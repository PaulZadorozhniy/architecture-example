import path from 'path';
import { requireRecursive } from 'common/utils/require-recursive';

const currentPath = path.dirname(__filename);

describe('Common unit tests', () => {
  describe('Interactors', () => {
    requireRecursive(path.join(currentPath, 'interactors'));
  });
});
