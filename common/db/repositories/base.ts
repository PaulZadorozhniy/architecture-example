import getRepositoryByModel from '../connection';
import { Repository, DeepPartial, In } from 'typeorm';
import { isUndefined } from 'util';
import { get } from 'lodash/fp';

interface IEntity {
  id: string;
}

interface IRetireableEntity extends IEntity {
  isDeleted: boolean;
  deleteReason?: string;
}

abstract class BaseRepository<Entity extends object, EntityModel> {
  protected entity: EntityModel;

  constructor(entity) {
    this.entity = entity;
  }

  protected getPrimaryColumnName(repository: Repository<EntityModel>): string {
    return get('metadata.primaryColumns[0].propertyName', repository);
  }

  protected async getRepository(): Promise<Repository<EntityModel>> {
    return getRepositoryByModel<EntityModel>(this.entity);
  }

  public async get(
    primaryColumnValue: string
  ): Promise<EntityModel | undefined> {
    const repository = await this.getRepository();

    return repository.findOne({
      [this.getPrimaryColumnName(repository)]: primaryColumnValue
    });
  }

  public async getArray(primaryColumnValues: string[]): Promise<EntityModel[]> {
    const repository = await this.getRepository();

    return repository.find({
      [this.getPrimaryColumnName(repository)]: In(primaryColumnValues)
    });
  }

  public async getAll(): Promise<EntityModel[]> {
    const repository = await this.getRepository();

    return repository.find();
  }

  public async create(obj: Entity): Promise<EntityModel> {
    const repository = await this.getRepository();
    const primaryColumnName = this.getPrimaryColumnName(repository);

    const result = await repository.insert({ ...(obj as object) });
    const primaryColumnValue: string = result.identifiers[0][primaryColumnName];

    return repository.findOneOrFail({
      [primaryColumnName]: primaryColumnValue
    });
  }

  public async update(
    primaryColumnValue: string,
    partialData: DeepPartial<Entity>
  ): Promise<EntityModel | undefined> {
    const repository = await this.getRepository();
    const primaryColumnName = this.getPrimaryColumnName(repository);

    const recordToUpdate = await repository.findOne({
      [primaryColumnName]: primaryColumnValue
    });

    if (!recordToUpdate) {
      return undefined;
    }

    await repository.update(primaryColumnValue, { ...(partialData as object) });

    return repository.findOneOrFail({
      [primaryColumnName]: primaryColumnValue
    });
  }

  public async remove(primaryColumnValue: string): Promise<boolean> {
    const repository = await this.getRepository();
    // EntityODO: remove the next line after this issue is resolved: https://github.com/typeorm/typeorm/issues/2415
    const record = await this.get(primaryColumnValue);

    if (!record) {
      return false;
    }

    await repository.remove(record);
    return true;
  }

  public async removeArray(primaryColumnValues: string[]): Promise<boolean[]> {
    const result: any[] = [...primaryColumnValues];

    const repository = await this.getRepository();
    const primaryColumnName = this.getPrimaryColumnName(repository);

    const records = await this.getArray(primaryColumnValues);
    const existingPrimaryColumnValues = records.map(
      record => record[primaryColumnName]
    );

    await repository.remove(records);

    records.forEach((record, index) => {
      if (isUndefined(record[primaryColumnName])) {
        const currentPrimaryColumnValue = existingPrimaryColumnValues[index];
        const primaryColumnValueIndex = primaryColumnValues.findIndex(
          primaryColumnValue => primaryColumnValue === currentPrimaryColumnValue
        );
        result[primaryColumnValueIndex] = true;
      }
    });

    return result.map(
      primaryColumnValue => (primaryColumnValue === true ? true : false)
    );
  }
}

async function retire<Entity extends IRetireableEntity>(
  primaryColumnValue: string,
  deleteReason?: string
): Promise<Entity> {
  const repository: Repository<Entity> = await this.getRepository();
  const primaryColumnName = this.getPrimaryColumnName(repository);

  // TODO: remove the next line after this issue is resolved: https://github.com/typeorm/typeorm/issues/2415
  await repository.findOneOrFail(primaryColumnValue);

  const partialData = { isDeleted: true, deleteReason };

  await this.update(primaryColumnValue, partialData as object);
  return repository.findOneOrFail({
    [primaryColumnName]: primaryColumnValue
  });
}

export function retireRepository(constructor: any) {
  Object.assign(constructor.prototype, { retire });
}

export default BaseRepository;
