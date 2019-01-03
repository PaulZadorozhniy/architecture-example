import * as Joi from 'joi';
import _ from 'lodash';
import { get } from 'lodash/fp';
import { rowSchema } from './schemas';
import { InvalidCsvDataError } from './errors';
import * as accountCache from 'web/src/caches/account-cache';

export interface IValidationError {
  rowIndex: number;
  message: string;
}

export interface IRow {
  learningObjectiveId: number;
  parentObjectiveId: number | null;
  bloomsLevel: string;
  objectiveType: string;
  objective: string;
  skillNames: string[];
  roleNames: string[];
  skillCurriculumLeadEmail: string;
}

export class CsvValidator {
  public async validate(rows: any) {
    await this.runValidation(this.validateBySchema, rows);
    await this.runValidation(this.checkHierarchy, rows);
    await this.runValidation(this.checkForDuplicates, rows);
    await this.runValidation(this.checkEmails, rows);
  }

  public async runValidation(validator, rows: any[]) {
    const validationErrors: IValidationError[] = await validator(rows);

    if (!_.isEmpty(validationErrors)) {
      throw new InvalidCsvDataError(validationErrors);
    }
  }

  public validateBySchema(rows: any[]): IValidationError[] {
    const errors: IValidationError[] = [];

    rows.forEach((row, index) => {
      const validationResult: Joi.ValidationResult<any> = Joi.validate(
        row,
        rowSchema,
        {
          abortEarly: false
        }
      );

      if (validationResult.error) {
        validationResult.error.details.forEach(({ message }) => {
          errors.push({
            rowIndex: index + 1,
            message
          });
        });
        return;
      }
    });

    return errors;
  }

  public checkHierarchy(rows: IRow[]): IValidationError[] {
    const errors: IValidationError[] = [];
    const rowsWithIndexes = rows.map((row: any, index) => ({ ...row, index }));

    rowsWithIndexes.forEach(row => {
      const { index } = row;

      if (!row.parentObjectiveId) {
        return;
      }

      const parentRow = rowsWithIndexes.find(
        item => item.learningObjectiveId === row.parentObjectiveId
      );

      if (!parentRow) {
        errors.push({
          rowIndex: index + 1,
          message: `row with id ${
            row.learningObjectiveId
          } has an invalid parent id ${row.parentObjectiveId}`
        });

        return;
      }

      if (
        JSON.stringify(row.skillNames) !== JSON.stringify(parentRow.skillNames)
      ) {
        errors.push({
          message: `enabling objective with id ${
            row.learningObjectiveId
          } and terminal objective with id ${
            parentRow.learningObjectiveId
          } have different skills`,
          rowIndex: index + 1
        });
      }

      if (
        JSON.stringify(row.roleNames) !== JSON.stringify(parentRow.roleNames)
      ) {
        errors.push({
          message: `enabling objective with id ${
            row.learningObjectiveId
          } and terminal objective with id ${
            parentRow.learningObjectiveId
          } have different roles`,
          rowIndex: index + 1
        });
      }
    });

    return errors;
  }

  public checkForDuplicates(rows: IRow[]): IValidationError[] {
    const errors: IValidationError[] = [];
    const rowsWithIndexes = rows.map((row: any, index) => ({ ...row, index }));
    const groupedByObjectiveTitle = _.groupBy(rowsWithIndexes, 'objective');

    const sameTitleObjectives = _.filter(
      groupedByObjectiveTitle,
      arr => arr.length > 1
    );

    sameTitleObjectives.forEach((arr: any[]) => {
      for (let i = 0; i < arr.length - 1; i++) {
        const current = arr[i];

        for (let j = i + 1; j < arr.length; j++) {
          const target = arr[j];

          if (current.parentObjectiveId !== target.parentObjectiveId) {
            continue;
          }
          if (
            _.intersection(current.skillNames, target.skillNames).length < 1
          ) {
            continue;
          }
          if (_.intersection(current.roleNames, target.roleNames).length < 1) {
            continue;
          }

          errors.push({
            message: `objective with id ${
              target.learningObjectiveId
            } is a duplicate of objective with id ${
              current.learningObjectiveId
            }`,
            rowIndex: target.index + 1
          });
        }
      }
    });

    return errors;
  }

  public async checkEmails(rows: IRow[]) {
    const errors: IValidationError[] = [];

    const emails = rows
      .filter(row => row.skillCurriculumLeadEmail.length > 0)
      .map(get('skillCurriculumLeadEmail'));

    await Promise.all(
      emails.map(async (email, index) => {
        try {
          await accountCache.getAccountByEmail(email);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            errors.push({
              message: `Account with the email ${email} was not found`,
              rowIndex: index + 1
            });
          } else {
            throw error;
          }
        }
      })
    );

    return errors;
  }
}

export default new CsvValidator();
