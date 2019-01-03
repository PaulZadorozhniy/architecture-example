import * as faker from 'faker';
import ISkill from '../../entities/skill';
import { SkillModel } from '../../db/models/skill';
import { ISkillSummary } from 'common/entities/skill-summary';

export default function generateSkill(
  id = faker.random.uuid(),
  isDraft = faker.random.boolean()
): ISkill {
  return {
    id,
    name: faker.random.word(),
    isDraft,
    isDeleted: false
  };
}

export function generateSkillWithSummary({
  id = faker.random.uuid(),
  relatedSkills = [faker.random.uuid(), faker.random.uuid()],
  curriculumLeads = [faker.random.uuid(), faker.random.uuid()],
  asms = [faker.random.uuid(), faker.random.uuid()]
} = {}): ISkill | ISkillSummary {
  return {
    id,
    name: faker.random.word(),
    isDraft: faker.random.boolean(),
    isDeleted: false,
    customerFacingDescription: faker.random.words(),
    background: faker.random.words(),
    relatedSkills,
    relatedTopics: [faker.random.word(), faker.random.word()],
    prerequiredKnowledge: [faker.random.word(), faker.random.word()],
    optionalKnowledge: [faker.random.word(), faker.random.word()],
    scope: faker.random.words(),
    exclusions: faker.random.words(),
    researchSummary: faker.random.words(),
    links: [faker.internet.url(), faker.internet.url()],
    otherNotes: faker.random.words(),
    curriculumLeads,
    asms
  };
}

export function generateSkillRecord({
  id = faker.random.uuid(),
  relatedSkills = [faker.random.uuid(), faker.random.uuid()],
  curriculumLeads = [faker.random.uuid(), faker.random.uuid()],
  asms = [faker.random.uuid(), faker.random.uuid()]
} = {}): SkillModel {
  return {
    id,
    name: faker.random.words(),
    isDraft: false,
    curriculumLeadHandle: faker.random.word(),
    createdAt: new Date(),
    roleSkill: null,
    terminalObjectives: [],
    updatedAt: new Date(),
    isDeleted: false,
    deleteReason: null,
    customerFacingDescription: faker.random.words(),
    background: faker.random.words(),
    relatedSkills,
    relatedTopics: [faker.random.word(), faker.random.word()],
    prerequiredKnowledge: [faker.random.word(), faker.random.word()],
    optionalKnowledge: [faker.random.word(), faker.random.word()],
    scope: faker.random.words(),
    exclusions: faker.random.words(),
    researchSummary: faker.random.words(),
    links: [faker.internet.url(), faker.internet.url()],
    otherNotes: faker.random.words(),
    curriculumLeads,
    asms
  };
}
