import IRoleSkill from '../../entities/role-skill';
import { RoleSkillModel } from 'common/db/models/role-skill';

export default function generateRoleSkill({
  roleId,
  skillId,
  isOptional = false
}): IRoleSkill {
  return {
    roleId,
    skillId,
    isOptional
  };
}

export function generateRoleSkillRecord({
  roleId,
  skillId,
  isOptional = false
}): RoleSkillModel {
  return {
    roleId,
    skillId,
    isOptional,
    updatedAt: new Date()
  };
}
