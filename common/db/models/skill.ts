import 'reflect-metadata';
import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn
} from 'typeorm';
import { RoleSkillModel } from './role-skill';
import { TerminalObjectiveModel } from './terminal-objective';

@Entity('skill', { schema: 'public' })
export class SkillModel {
  @PrimaryColumn('uuid', {
    name: 'id'
  })
  public id: string;

  @Column('text', {
    nullable: false,
    name: 'name'
  })
  public name: string;

  @Column('boolean', {
    nullable: false,
    name: 'is_draft'
  })
  public isDraft: boolean;

  @Column('text', {
    nullable: true,
    name: 'curriculum_lead_handle'
  })
  public curriculumLeadHandle: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true, name: 'updated_at' })
  public updatedAt: Date;

  @OneToOne(() => RoleSkillModel, roleSkill => roleSkill.skillId)
  public roleSkill: RoleSkillModel | null;

  @OneToMany(
    () => TerminalObjectiveModel,
    terminalObjective => terminalObjective.skillId
  )
  public terminalObjectives: TerminalObjectiveModel[];

  @Column('boolean', {
    nullable: false,
    name: 'is_deleted',
    default: false
  })
  public isDeleted: boolean;

  @Column('text', {
    nullable: true,
    name: 'delete_reason'
  })
  public deleteReason: string | null;

  @Column('text', {
    nullable: true,
    name: 'customer_facing_description'
  })
  public customerFacingDescription: string | null;

  @Column('text', {
    nullable: true,
    name: 'background'
  })
  public background: string | null;

  @Column('jsonb', {
    nullable: true,
    name: 'related_skills',
    default: []
  })
  public relatedSkills: string[];

  @Column('jsonb', {
    nullable: true,
    name: 'related_topics',
    default: []
  })
  public relatedTopics: string[];

  @Column('jsonb', {
    nullable: true,
    name: 'prerequired_knowledge',
    default: []
  })
  public prerequiredKnowledge: string[];

  @Column('jsonb', {
    nullable: true,
    name: 'optional_knowledge',
    default: []
  })
  public optionalKnowledge: string[];

  @Column('text', {
    nullable: true,
    name: 'scope'
  })
  public scope: string | null;

  @Column('text', {
    nullable: true,
    name: 'exclusions'
  })
  public exclusions: string | null;

  @Column('text', {
    nullable: true,
    name: 'research_summary'
  })
  public researchSummary: string | null;

  @Column('jsonb', {
    nullable: true,
    name: 'links',
    default: []
  })
  public links: string[];

  @Column('text', {
    nullable: true,
    name: 'other_notes'
  })
  public otherNotes: string | null;

  @Column('jsonb', {
    nullable: true,
    name: 'curriculum_leads',
    default: []
  })
  public curriculumLeads: string[];

  @Column('jsonb', {
    nullable: true,
    name: 'asms',
    default: []
  })
  public asms: string[];
}
