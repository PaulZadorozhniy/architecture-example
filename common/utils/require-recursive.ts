import fs from 'fs';
import path from 'path';

export function requireRecursive(dirPathAbsolute: string) {
  const children = fs.readdirSync(path.resolve(dirPathAbsolute));

  children.forEach(child => {
    const childPathAbsolute = path.join(dirPathAbsolute, child);
    const stat = fs.statSync(childPathAbsolute);

    if (stat.isDirectory()) {
      requireRecursive(childPathAbsolute);
    } else {
      require(childPathAbsolute);
    }
  });
}
