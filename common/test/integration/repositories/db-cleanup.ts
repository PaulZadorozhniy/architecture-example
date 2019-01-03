import models from 'common/db/models';
import { MoreThan, getManager } from 'typeorm';

let testsStartDate: Date;

before(() => {
  testsStartDate = new Date();
});

after(async () => {
  const cachedDataModels: string[] = [
    'AccountModel',
  ];

  try {
    const entityManager = getManager();

    for (const model of models) {
      const createdDateField: string = cachedDataModels.includes(model.name)
        ? 'cachedDate'
        : 'createdDate';
      // find and delete all records created after testsStartDate
      const recordsToDelete = await entityManager.find(model, {
        [createdDateField]: MoreThan(testsStartDate)
      });

      // console.log(`removing ${model.name}`);
      await entityManager.remove(recordsToDelete);
    }
  } catch (error) {
    if (error.name.includes('ConnectionNotFoundError')) {
      console.log('ConnectionNotFoundError! No db connection, no cleanup!');
      return;
    }
    throw error;
  }
});
