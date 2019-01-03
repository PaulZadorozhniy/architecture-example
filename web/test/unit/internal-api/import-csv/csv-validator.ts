import { set, pipe } from 'lodash/fp';
import { assert } from 'chai';
import * as faker from 'faker';
import * as Joi from 'joi';
import formattedRows from 'web/test/fixtures/import-formatted-rows.json';
import validatedRows from 'web/test/fixtures/validated-rows.json';
import { validationErrorsSchema } from 'web/src/internal-api/import-csv/schemas';
import csvValidator, {
  IRow
} from 'web/src/internal-api/import-csv/csv-validator';
import * as accountCache from 'web/src/caches/account-cache';
import sinon from 'sinon';
import generateAccount from 'common/test/fixtures/account';

describe('CSV Validator', () => {
  context('#validateBySchema', () => {
    context('valid input', () => {
      let errors;

      beforeEach(() => {
        errors = csvValidator.validateBySchema(formattedRows);
      });

      it('does not return any errors', () => {
        assert.isEmpty(errors, JSON.stringify(errors, null, 4));
      });
    });

    context('invalid input', () => {
      context('one error per row', () => {
        const rowsWithInvalidEmail = formattedRows.map(
          set('skillCurriculumLeadEmail', '66666')
        );

        it('returns an array of error messages', () => {
          const errors = csvValidator.validateBySchema(rowsWithInvalidEmail);

          assert.isNotEmpty(errors);
          Joi.assert(errors, validationErrorsSchema);
          assert.lengthOf(errors, rowsWithInvalidEmail.length);
        });
      });

      context('multiple errors per row', () => {
        const rowsWithMultipleErrors = formattedRows.map(
          pipe(
            set('skill_curriculum_lead_email', 'Not An Email'),
            set('learning_objective_id', 0)
          )
        );

        it('returns an array of error messages', () => {
          const errors = csvValidator.validateBySchema(rowsWithMultipleErrors);

          assert.isNotEmpty(errors);
          Joi.assert(errors, validationErrorsSchema);
          assert.lengthOf(errors, rowsWithMultipleErrors.length * 2);
        });
      });
    });
  });

  context('#checkForDuplicates', () => {
    context('valid input', () => {
      it('does not return any errors', () => {
        const errors = csvValidator.checkForDuplicates(validatedRows);

        assert.isEmpty(errors);
      });

      context('same title, parent objective but different skills', () => {
        const almostInvalidRows = [...validatedRows];
        const almostDuplicate = { ...validatedRows[0] };

        almostDuplicate.skillNames = ['random skill'];
        almostInvalidRows.push(almostDuplicate);

        it('does not return any errors', () => {
          const errors = csvValidator.checkForDuplicates(almostInvalidRows);

          assert.isEmpty(errors);
        });
      });

      context(
        'same title, parent objective and skills but different roles',
        () => {
          const almostInvalidRows = [...validatedRows];
          const almostDuplicate = { ...validatedRows[0] };

          almostDuplicate.roleNames = ['random role'];
          almostInvalidRows.push(almostDuplicate);

          it('does not return any errors', () => {
            const errors = csvValidator.checkForDuplicates(almostInvalidRows);

            assert.isEmpty(errors);
          });
        }
      );
    });

    context('invalid input', () => {
      const duplicates = [validatedRows[0], validatedRows[1]];
      const rowsWithDuplication = validatedRows.concat(duplicates);

      it('returns duplicates errors', () => {
        const errors = csvValidator.checkForDuplicates(rowsWithDuplication);

        assert.isNotEmpty(errors);
        Joi.assert(errors, validationErrorsSchema);
        assert.lengthOf(errors, duplicates.length);
      });
    });
  });

  context('#checkHierarchy', () => {
    context('valid', () => {
      it('does not return validated rows', () => {
        const result = csvValidator.checkHierarchy(validatedRows);

        assert.isEmpty(result);
      });
    });

    context('invalid', () => {
      const invalidRows = [...validatedRows].slice(0, 5) as IRow[];

      invalidRows[0] = { ...invalidRows[0], parentObjectiveId: 66666 };
      invalidRows[1] = { ...invalidRows[0], learningObjectiveId: 66666 };
      invalidRows[1] = { ...invalidRows[0], skillNames: [faker.random.uuid()] };
      invalidRows[1] = { ...invalidRows[0], roleNames: [faker.random.uuid()] };

      it('returns an array of error messages', () => {
        const errors = csvValidator.checkHierarchy(invalidRows);

        assert.isNotEmpty(errors);
        Joi.assert(errors, validationErrorsSchema);
      });
    });
  });

  context('#checkEmails', () => {
    let getAccountByEmailStub;
    let sandbox;

    before(() => {
      sandbox = sinon.createSandbox();
      getAccountByEmailStub = sandbox.stub();
      sandbox.replace(accountCache, 'getAccountByEmail', getAccountByEmailStub);
    });

    context('some rows have empty strings in skillCurriculumLeadEmail', () => {
      it('does not throw or return errors', async () => {
        const rows = [...validatedRows]
          .slice(0, 5)
          .map(set('skillCurriculumLeadEmail', '')) as IRow[];

        const errors = await csvValidator.checkEmails(rows);

        assert.isEmpty(errors);
      });
    });

    context('all rows have valid emails in skillCurriculumLeadEmail', () => {
      beforeEach(() => {
        getAccountByEmailStub.resolves(generateAccount());
      });

      context('all accounts exist', () => {
        it('does not throw or return errors', async () => {
          const rows = [...validatedRows]
            .slice(0, 5)
            .map(
              set('skillCurriculumLeadEmail', 'curruculum-test@example.com')
            ) as IRow[];

          const errors = await csvValidator.checkEmails(rows);

          assert.isEmpty(errors);
        });
      });

      context('some accounts do not exist', () => {
        beforeEach(() => {
          const err: any = new Error();

          err.response = { status: 404 };
          getAccountByEmailStub.rejects(err);
        });

        it('returns validation errors', async () => {
          const rows = [...validatedRows]
            .slice(0, 5)
            .map(
              set(
                'skillCurriculumLeadEmail',
                `${faker.random.uuid()}@fakemail.com`
              )
            ) as IRow[];

          const errors = await csvValidator.checkEmails(rows);

          assert.lengthOf(errors, 5);
          errors.forEach(error =>
            assert.hasAllKeys(error, ['message', 'rowIndex'])
          );
        });
      });
    });

    afterEach(() => sandbox.reset());
    after(() => sandbox.restore());
  });
});
