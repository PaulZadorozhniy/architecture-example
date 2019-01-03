import config from 'config/web';
import Router from 'koa-router';
import { handleGet } from './get-handler';
import { handleGetBySkillId } from './get-by-skill-id-handler';
import { handleCreate } from './create-handler';
import { duplicateSkillHandler } from './duplicate-handler';
import handleUpdate from './update-handler';
import authenticateRequest from '../../middleware/authenticate-request';
import validateEmployeeClaimsForRequest from '../../middleware/validate-by-claims';
import { retireSkillHandler } from './retire-handler';

const router = new Router({ prefix: config.routes.skill });

router.use(authenticateRequest).use(validateEmployeeClaimsForRequest);

router.get('/', handleGet);
router.get('/:id', handleGetBySkillId);

router.post('/', handleCreate);
router.put('/:id', handleUpdate);
router.post('/:skillId/duplicate', duplicateSkillHandler);

router.delete('/:id', retireSkillHandler);

export default router;
