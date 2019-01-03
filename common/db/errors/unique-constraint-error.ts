export default class UniqueConstraintError extends Error {
  constructor(originalError: any) {
    super(
      originalError.detail || originalError.message || 'Unique Constraint Error'
    );
  }
}
