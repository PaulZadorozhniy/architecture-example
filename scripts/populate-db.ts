import * as faker from 'faker';
import { times } from 'lodash';
import generateSkill from 'common/test/fixtures/skill';
import generateRoleSkill from 'common/test/fixtures/role-skill';
import skillRepository from 'common/db/repositories/skill';
import roleRepository from 'common/db/repositories/role';
import roleSkillRepository from 'common/db/repositories/role-skill';

async function populateRoles(count) {
  return Promise.all(
    times(count, () =>
      roleRepository.create({
        id: faker.random.uuid(),
        name: faker.name.jobTitle(),
        baseRole: null
      })
    )
  );
}

async function populateSkills(skillCount) {
  const allRoles = await roleRepository.getAll();
  return Promise.all(
    allRoles.map(role =>
      Promise.all(
        times(skillCount, async () => {
          const skill = generateSkill();
          const skillId = await skillRepository.create(skill);
          const roleSkill = generateRoleSkill({
            roleId: role.id,
            skillId
          });
          await roleSkillRepository.create(roleSkill);
        })
      )
    )
  );
}


async function main() {
  try {
    await populateRoles(5);
    await populateSkills(5);

  } catch (error) {
    console.error(error); // tslint:disable-line
  }
  console.log('Done populating tables'); // tslint:disable-line
  process.exit(0);
}

main();
