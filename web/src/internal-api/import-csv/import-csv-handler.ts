import * as parser from './parse-csv';
import csvValidator from './csv-validator';
import {
  WrongMimetypeError,
  NoFileError,
  InvalidCsvDataError,
  WrongHeadersError,
  InsertDataError
} from './errors';
import logger from 'common/logger';
import { matchesTypes } from 'web/src/helpers/match-types';
import { InsertData } from './insert-data';
import * as formatter from './formatter';

const insertData = new InsertData();

export default async function importCsvHandler(ctx: any) {
  const { req } = ctx.request;

  try {
    const file = await parser.getFileStream(req);

    if (!file) {
      throw new NoFileError();
    }

    const rows = await parser.parseCsv(file);
    const formattedRows: any[] = formatter.formatRows(rows);

    await csvValidator.validate(formattedRows);
    await insertData.importRowsIntoDb(formattedRows, ctx.email);

    ctx.status = 200;
    ctx.body = { validationErrors: [] };
  } catch (error) {
    logger.error('Error when importing data from csv', error);

    if (
      matchesTypes(error, NoFileError, WrongMimetypeError, WrongHeadersError)
    ) {
      ctx.status = 400;
      ctx.body = error.message;
      return;
    }

    if (matchesTypes(error, InvalidCsvDataError)) {
      ctx.status = 422;
      ctx.body = { validationErrors: error.messages };
      return;
    }

    if (matchesTypes(error, InsertDataError)) {
      // TODO: ctx.throw - test error handling in Koa

      ctx.status = 500;
      ctx.body = '';
      return;
    }

    throw error;
  }
}
