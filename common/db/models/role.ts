import 'reflect-metadata';
import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { RoleSkillModel } from './role-skill';

@Entity('role', { schema: 'public' })
export class RoleModel {
  @Column('uuid', {
    nullable: false,
    primary: true,
    name: 'id'
  })
  public id: string;

  @Column('text', {
    nullable: false,
    name: 'name',
    unique: true
  })
  public name: string;

  @ManyToOne(() => RoleModel, role => role.roles)
  @JoinColumn({ name: 'base_role' })
  @Column('uuid', {
    nullable: true,
    name: 'base_role'
  })
  public baseRole: string | null;

  @CreateDateColumn({ type: 'timestamptz', readonly: true, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true, name: 'updated_at' })
  public updatedAt: Date;

  @OneToMany(() => RoleModel, role => role.baseRole)
  public roles: RoleModel[];

  @OneToOne(() => RoleSkillModel, roleSkill => roleSkill.roleId)
  public roleSkill: RoleSkillModel | null;
}
