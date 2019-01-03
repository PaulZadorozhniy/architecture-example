import { assert } from 'chai';
import * as faker from 'faker';
import repo from 'common/db/repositories/skill';
import terminalObjectiveRepo from 'common/db/repositories/terminal-objective';
import enablingObjectiveRepo from 'common/db/repositories/enabling-objective';
import generateSkill from '../../fixtures/skill';
import ISkill from 'common/entities/skill';
import { getConnection } from 'typeorm';
import { times, sortBy, map, omit, set } from 'lodash';
import sls from 'single-line-string';
import generateTerminalObjective from '../../fixtures/terminal-objective';
import generateEnablingObjective from '../../fixtures/enabling-objective';
import ITerminalObjective, {
  TerminalObjective
} from '../../../entities/terminal-objective';
import IEnablingObjective from '../../../entities/enabling-objective';
import { SkillModel } from '../../../db/models/skill';

describe('Skill repository', () => {
  describe('#create', () => {
    let skill: ISkill;
    let id: string;

    beforeEach(() => {
      skill = generateSkill();
      id = skill.id;
    });

    it('should add a new record in DB', async () => {
      const createdRecord = await repo.create(skill);

      assert.exists(createdRecord);

      const foundRecords = await getConnection().query(
        sls`SELECT id, name, created_at AS "createdAt", 
        updated_at AS "updatedAt", is_draft AS "isDraft",
        is_deleted AS "isDeleted"
        FROM skill 
        WHERE id='${id}'`
      );

      assert.isNotEmpty(foundRecords);
      assert.deepEqual(
        skill,
        omit(foundRecords[0], ['updatedAt', 'createdAt'])
      );
    });

    afterEach(async () => {
      await repo.remove(id);
    });
  });

  describe('#update', () => {
    let skill: ISkill;
    let id: string;
    let updatedData: ISkill;

    before(async () => {
      skill = generateSkill();
      id = skill.id;
    });

    context('entity exists in the DB', () => {
      const newName = faker.random.words();
      let record: SkillModel | undefined;

      before(async () => {
        await repo.create(skill);
        updatedData = set(skill, 'name', newName);
        record = await repo.update(id, updatedData);
      });

      it('should update the record in the DB', async () => {
        assert.strictEqual(record!.name, newName);
      });

      after(async () => {
        await repo.remove(id);
      });
    });

    context('entity does not exist in the DB', () => {
      let record: SkillModel | undefined;

      beforeEach(async () => {
        record = await repo.update(id, updatedData);
      });

      it('should return false', () => {
        assert.isUndefined(record);
      });
    });
  });

  describe('#remove', () => {
    let skill: ISkill;
    let id: string;

    before(async () => {
      skill = generateSkill();
      id = skill.id;
      await repo.create(skill);
    });

    it('should remove skill record by id', async () => {
      const hasDeleted = await repo.remove(id);
      assert(hasDeleted);
    });

    it('should remove nothing with not existing handle', async () => {
      const hasDeleted = await repo.remove(faker.random.uuid());

      assert.isNotOk(hasDeleted);
    });
  });

  describe('#removeArray', () => {
    let skills: ISkill[];
    let skillIds: string[];

    beforeEach(async () => {
      skills = times(5, () => generateSkill());
      skillIds = skills.map(skill => skill.id);

      await Promise.all(skills.map(skill => repo.create(skill)));
    });

    it('should remove array of skills record by ids', async () => {
      const results: boolean[] = await repo.removeArray(skillIds);
      results.forEach(result => assert.isTrue(result));
    });

    context('the input array contains invalid ids', () => {
      let results: boolean[];

      beforeEach(async () => {
        results = await repo.removeArray([faker.random.uuid(), ...skillIds]);
      });

      it('should remove all records by valid ids', () => {
        results.slice(1).forEach(result => assert.isTrue(result));
      });

      it('should return an array of results with false for non-existing records', () => {
        assert.isFalse(results[0]);
      });
    });
  });

  describe('#getArray', () => {
    let skills: ISkill[];
    let skillIds: string[];
    let terminalObjectives: ITerminalObjective[];
    let enablingObjectives: IEnablingObjective[];
    let enablingObjectiveIds: string[];

    beforeEach(async () => {
      skills = times(3, () => generateSkill());
      skillIds = skills.map(skill => skill.id).sort();
      terminalObjectives = skillIds.map(generateTerminalObjective);
      enablingObjectives = terminalObjectives.map(({ id }) =>
        generateEnablingObjective(id)
      );
      enablingObjectiveIds = enablingObjectives.map(
        enablingObjective => enablingObjective.id
      );

      await Promise.all(skills.map(skill => repo.create(skill)));
      await Promise.all(
        terminalObjectives.map(terminalObjective =>
          terminalObjectiveRepo.create(terminalObjective)
        )
      );
      await Promise.all(
        enablingObjectives.map(enablingObjective =>
          enablingObjectiveRepo.create(enablingObjective)
        )
      );
    });

    it('should return an array of skill records', async () => {
      const connection = await getConnection();
      const skillsFromRepo = await repo.getArray(skillIds);

      const skillIdsJoined = skillIds.map(s => `'${s}'`).join(', ');
      const skillsFromQuery = await connection.query(
        sls`SELECT id, name, created_at AS "createdAt", 
        updated_at AS "updatedAt", is_draft AS "isDraft",
        is_deleted AS "isDeleted", delete_reason AS "deleteReason",
        curriculum_lead_handle AS "curriculumLeadHandle", asms, background,
        curriculum_leads AS "curriculumLeads", customer_facing_description AS "customerFacingDescription",
        exclusions, links, optional_knowledge AS "optionalKnowledge",
        other_notes AS "otherNotes", prerequired_knowledge AS "prerequiredKnowledge",
        related_skills AS "relatedSkills", related_topics AS "relatedTopics",
        research_summary AS "researchSummary", scope
        FROM skill
        WHERE id IN (${skillIdsJoined})`
      );

      assert.deepEqual(
        map(sortBy(skillsFromRepo, 'id'), skill =>
          omit(skill, ['terminalObjectives'])
        ),
        sortBy(skillsFromQuery, 'id')
      );
    });

    it('should return objectives of the skill', async () => {
      const unsortedSkillsFromRepo = await repo.getArray(skillIds);

      const skillsFromRepo = sortBy(unsortedSkillsFromRepo, ['id']);

      skillsFromRepo.forEach((skill, index) => {
        assert.isArray(skill.terminalObjectives);
        assert.isNotEmpty(skill.terminalObjectives);
        skill.terminalObjectives.forEach(terminalObj => {
          assert.deepEqual(
            new TerminalObjective(terminalObj),
            terminalObjectives[index]
          );
          assert.isNotEmpty(terminalObj.enablingObjectives);

          terminalObj.enablingObjectives.forEach(enablingObj => {
            assert.deepNestedInclude(enablingObj, enablingObjectives[index]);
            assert.strictEqual(enablingObj.id, enablingObjectiveIds[index]);
          });
        });
      });
    });
  });

  describe('#retire', () => {
    let skillId: string;

    beforeEach(async () => {
      const skill = await repo.create(generateSkill());

      skillId = skill.id;
    });

    it('should throw an error on non-existing id', async () => {
      try {
        await repo.retire(faker.random.uuid());

        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        assert.ok(error);
      }
    });

    it('should retire the entity, set the delete reason and return it', async () => {
      const reason = faker.random.word();
      const retiredEntity = await repo.retire(skillId, reason);

      assert.instanceOf(retiredEntity, SkillModel);
      assert.isTrue(retiredEntity.isDeleted);
      assert.strictEqual(retiredEntity.deleteReason, reason);
    });
  });
});
