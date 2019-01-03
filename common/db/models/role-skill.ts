import 'reflect-metadata';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { RoleModel } from './role';
import { SkillModel } from './skill';

@Entity('role_skill', { schema: 'public' })
export class RoleSkillModel {
  @OneToOne(() => RoleModel, role => role.roleSkill, {
    primary: true,
    nullable: false
  })
  @JoinColumn({ name: 'role_id' })
  @PrimaryColumn('uuid', {
    nullable: false,
    name: 'role_id'
  })
  public roleId: string;

  @OneToOne(() => SkillModel, skill => skill.roleSkill, {
    primary: true,
    nullable: false
  })
  @JoinColumn({ name: 'skill_id' })
  @PrimaryColumn('uuid', {
    nullable: false,
    name: 'skill_id'
  })
  public skillId: string;

  @Column('boolean', {
    nullable: false,
    default: 'false',
    name: 'is_optional'
  })
  public isOptional: boolean;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true, name: 'updated_at' })
  public updatedAt: Date;
}
