import config from 'config/web';
import Router from 'koa-router';
import { getRoleHandler } from './get-handler';
import { createRoleHandler } from './create-handler';
import authenticateRequest from '../../middleware/authenticate-request';
import validateEmployeeClaimsForRequest from '../../middleware/validate-by-claims';

const router = new Router({ prefix: config.routes.role });

router.use(authenticateRequest).use(validateEmployeeClaimsForRequest);

router.get('/', getRoleHandler);
router.post('/', createRoleHandler);

export default router;
