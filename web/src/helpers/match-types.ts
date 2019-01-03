export function matchesTypes(error, ...types: any[]) {
  for (const t of types) {
    if (error instanceof t) {
      return true;
    }
  }

  return false;
}
