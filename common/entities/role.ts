export default interface IRole {
  id: string;
  name: string;
  baseRole: string | null;
}

export const roleDvsSchema = [
  { name: 'id', type: 'string' },
  { name: 'name', type: 'string' },
  { name: 'baseRole', type: ['null', 'string'] }
];
