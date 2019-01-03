import { SkillModel } from 'common/db/models/skill';
import { RoleSkillModel } from 'common/db/models/role-skill';

export default interface ISkill {
  id: string;
  name: string;
  isDraft: boolean;
  isDeleted: boolean;
  deleteReason?: string;
}

export interface ISkillMessage extends ISkill {
  roleId: string;
  isOptional: boolean;
}

export class Skill implements ISkill {
  public id: string;
  public name: string;
  public isDraft: boolean;
  public isDeleted: boolean;
  public deleteReason?: string;

  constructor(skill: SkillModel) {
    this.id = skill.id;
    this.name = skill.name;
    this.isDraft = skill.isDraft;
    this.isDeleted = skill.isDeleted;
    if (skill.deleteReason) {
      this.deleteReason = skill.deleteReason;
    }
  }
}

export class SkillMessage implements ISkillMessage {
  public id: string;
  public name: string;
  public isDraft: boolean;
  public roleId: string;
  public isOptional: boolean;
  public isDeleted: boolean;

  constructor(skill: SkillModel, roleSkill: RoleSkillModel) {
    this.id = skill.id;
    this.name = skill.name;
    this.isDraft = skill.isDraft;
    this.roleId = roleSkill.roleId;
    this.isOptional = roleSkill.isOptional;
    this.isDeleted = skill.isDeleted;
  }
}

export class SkillResponse {
  public id: string;
  public name: string;
  public isDraft: boolean;
  public isOptional: boolean;
  public roleId: string;
  public updatedAt: Date;
  public createdAt: Date;

  constructor(skill: SkillModel, roleSkill: RoleSkillModel) {
    this.id = skill.id;
    this.name = skill.name;
    this.isDraft = skill.isDraft;
    this.isOptional = roleSkill.isOptional;
    this.roleId = roleSkill.roleId;
    this.updatedAt = skill.updatedAt;
    this.createdAt = skill.createdAt;
  }
}