import { groupBy } from 'lodash';
import { RoleModel } from 'common/db/models/role';
import { SkillModel } from 'common/db/models/skill';
import { IRow } from './csv-validator';
import { RoleSkillEntityMapper } from './entity-mappers/role-skill';
import { RoleEntityMapper } from './entity-mappers/role';
import { SkillEntityMapper } from './entity-mappers/skill';
import { SomeFancyEntityMapper } from './entity-mappers/some-fansy-maper';
import { AnotherFancyEntityMapper } from './entity-mappers/another-fansy-maper';
import { RoleSkillModel } from 'common/db/models/role-skill';
import promiseSerial from 'common/utils/promise-serial';
import { SomeFancyEntity } from 'common/entities/some-entity';

const roleSkillEntityMapper = new RoleSkillEntityMapper();
const roleEntityMapper = new RoleEntityMapper();
const skillEntityMapper = new SkillEntityMapper();
const someFancyEntityMapper = new SomeFancyEntityMapper();
const anotherFancyEntityMapper = new AnotherFancyEntityMapper();

export interface IEntities {
  roles: RoleModel[];
  skills: SkillModel[];
  roleSkills: RoleSkillModel[];
  someFancyEntities: SomeFancyEntity[];
}

export class InsertData {
  public async importRowsIntoDb(rows: IRow[], currentUserEmail: string) {
    const {
      someFancyRows,
      anotherFancyRows
    } = this.groupRowsByObjectiveType(rows);

    const someFancyIdMap = await this.getOrCreateEntities(
      someFancyRows,
      currentUserEmail
    );

    await anotherFancyEntityMapper.getOrCreateRecords(
      anotherFancyRows,
      someFancyIdMap
    );
  }

  public groupRowsByObjectiveType(rows: IRow[]) {
    return groupBy(
      rows,
      (item: IRow) =>
        item.parentObjectiveId === null
          ? 'someFancyRows'
          : 'anotherFancyRows'
    );
  }

  public async getOrCreateEntities(
    rows: IRow[],
    currentUserEmail: string
  ): Promise<any> {
    const idMappings: any[] = await promiseSerial(
      rows.map(row => () =>
        this.getOrCreateEntitiesFromRow(currentUserEmail, row)
      )
    );

    const someFancyIdMap: any = {};

    idMappings.forEach((mappings: [number, string[]]) => {
      const [objectiveIdFromRow, entityIds] = mappings;

      someFancyIdMap[objectiveIdFromRow] = entityIds;
    });

    return someFancyIdMap;
  }

  public async getOrCreateEntitiesFromRow(
    currentUserEmail: string,
    row: IRow
  ): Promise<[number, string[]]> {
    const roles: RoleModel[] = await roleEntityMapper.getOrCreateRecords(row);
    const skills: SkillModel[] = await skillEntityMapper.getOrCreateRecords(
      row,
      currentUserEmail
    );

    await roleSkillEntityMapper.getOrCreateRecords(roles, skills);

    const SomeFancyEntities: SomeFancyEntity[] = await someFancyEntityMapper.getOrCreateRecords(
      row,
      skills
    );

    return [row.someFancyId, SomeFancyEntities.map(obj => obj.id)];
  }
}
