import { flatten } from 'lodash';
import { RoleModel } from 'common/db/models/role';
import { SkillModel } from 'common/db/models/skill';
import { RoleSkillModel } from 'common/db/models/role-skill';
import roleSkillRepository from 'common/db/repositories/role-skill';

export class RoleSkillEntityMapper {
  public async getOrCreateRecords(
    roles: RoleModel[],
    skills: SkillModel[]
  ): Promise<RoleSkillModel[]> {
    const roleSkills = await Promise.all(
      roles.map(role => this.getOrCreateRoleSkillsForEachRole(skills, role))
    );

    return flatten(roleSkills);
  }

  public getOrCreateRoleSkillsForEachRole(
    skills: SkillModel[],
    role: RoleModel
  ): Promise<RoleSkillModel[]> {
    return Promise.all(
      skills.map(skill => this.getOrCreateRoleSkill(role, skill))
    );
  }

  public async getOrCreateRoleSkill(
    role: RoleModel,
    skill: SkillModel
  ): Promise<RoleSkillModel> {
    const roleSkill = await roleSkillRepository.get(role.id, skill.id);

    if (roleSkill) {
      return roleSkill;
    }
    await roleSkillRepository.create({
      roleId: role.id,
      skillId: skill.id,
      isOptional: false
    });
    const created = await roleSkillRepository.get(role.id, skill.id);

    return created as RoleSkillModel;
  }
}
