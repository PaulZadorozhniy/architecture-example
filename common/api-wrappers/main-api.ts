import axios from 'axios';
import config from 'config/listener';
import { pick } from 'lodash';

const mainApi = axios.create({
  baseURL: `${config.mainApiUrl}/system`,
  headers: {
    Authorization: `Bearer ${config.mainApiToken}`
  }
});

export const getAuthor = async function(id: string): Promise<any> {
  const { data } = await mainApi.get(`/author/v1/${id}`);

  return pick(data, [
    'id',
    'fullName',
    'firstName',
    'lastName',
    'userHandle',
    'authorHandle',
    'email'
  ]);
};
