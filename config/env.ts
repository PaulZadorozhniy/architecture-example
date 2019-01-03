import * as dotenv from 'dotenv';
import { normalize } from 'path';
import 'process';

dotenv.load({ path: normalize(`${__dirname}/../.env`) });

export default process.env;
