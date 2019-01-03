## Internal API

### Create a Role

Method: POST

Route: `/curriculum/api/v1/role`

Request body params:

- required:

  1.  "name": string

- optional:
  1.  "baseRole": string

Response status:

1.  Successful creation: 201
1.  Invalid params: 400

Response body params:

1.  "id": string;

### Create a Skill

Method: POST

Route: `/curriculum/api/v1/role/:roleId/skill`

Request body params:

- required:
  1.  "name": string
  1.  "isDraft": boolean
  1.  "isOptional": boolean

Response status:

1.  Successful creation: 201
1.  Role with `roleId` not found: 404
1.  Invalid params: 400

Response body params:

1.  "id": string;
1.  "roleId": string;
1.  "name": string;
1.  "isDraft": boolean;
1.  "createdAt": timestamp;
1.  "updatedAt": Date;

### Update a Skill

Method: PUT

Route: `/curriculum/api/v1/role/:roleId/skill/:skillId`

Request body params:

- required:
  1.  "name": string
  1.  "isDraft": boolean
  1.  "isOptional": boolean
  1.  "roleId": string

Response status:

1.  Successful update: 200
1.  Role with `roleId` or skill by `skillId` not found: 404
1.  Invalid params: 400

Response body params:

1.  "id": string;
1.  "roleId": string;
1.  "name": string;
1.  "isDraft": boolean;
1.  "createdAt": timestamp;
1.  "updatedAt": Date;

### Get all Roles

Method: GET

Route: `/curriculum/api/v1/role`

Response status:

1.  Success: 200

Response body params:

1.  array of Roles\*

\* Role:

1.  "id": string, uuid
1.  "name": string
1.  "baseRole": string, uuid

### Get all Skills of a Role

Method: GET

Route: `/curriculum/api/v1/role/:roleId/skill`

Response status:

1.  Found: 200
1.  Not found: 404

Response body params:

1.  "id": string, uuid
1.  "name": string
1.  "isOptional": boolean,
1.  "updatedAt": timestamp