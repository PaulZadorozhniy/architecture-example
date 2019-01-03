import Router from 'koa-router';
import webConfig from 'config/web';
import importCsvHandler from './import-csv-handler';
import authenticateRequest from '../../middleware/authenticate-request';
import validateEmployeeClaimsForRequest from '../../middleware/validate-by-claims';
import getAccountInfoByHandle from '../../middleware/get-account-info-by-handle';

const router = new Router({ prefix: webConfig.routes.importCsv });

router
  .use(authenticateRequest)
  .use(validateEmployeeClaimsForRequest)
  .use(getAccountInfoByHandle);

router.post('/', importCsvHandler);

export default router;
