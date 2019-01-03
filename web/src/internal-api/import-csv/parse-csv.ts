import csv from 'csv-parser';
import { Stream } from 'stream';
import Busboy from 'busboy';
import { WrongMimetypeError, WrongHeadersError } from './errors';
import { uniq } from 'lodash';

export function parseCsv(source: Stream): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    source
      .on('error', err => reject(err))
      .pipe(
        csv({
          mapHeaders: ({ header, index }) => {
            if (header === 'role_name') {
              return `role_name_${index}`;
            }
            if (header === 'skill_name') {
              return `skill_name_${index}`;
            }
            return header;
          }
        })
      )
      .on('data', chunk => {
        const roleNames: any[] = [];
        const skillNames: any[] = [];

        Object.keys(chunk).forEach(key => {
          if (key.includes('role_name')) {
            if (chunk[key] !== '') {
              roleNames.push(chunk[key]);
            }

            delete chunk[key];
          }

          if (key.includes('skill_name')) {
            if (chunk[key] !== '') {
              skillNames.push(chunk[key]);
            }

            delete chunk[key];
          }
        });

        chunk.role_names = uniq(roleNames);
        chunk.skill_names = uniq(skillNames);
        chunk.learning_objective_id = parseInt(chunk.learning_objective_id);
        chunk.parent_objective_id =
          chunk.parent_objective_id === ''
            ? null
            : parseInt(chunk.parent_objective_id);

        results.push(chunk);
      })
      .on('end', () => resolve(results))
      .on('error', err => reject(err));
  });
}

export function getFileStream(req: any): Promise<Stream | null> {
  let busboy;

  try {
    busboy = new Busboy({ headers: req.headers });
  } catch (error) {
    return Promise.reject(new WrongHeadersError());
  }

  req.pipe(busboy);

  return new Promise((resolve, reject) => {
    let reqHasFiles: boolean = false;

    busboy.on('file', (...args) => {
      const file = args[1];
      const mimetype = args[4];

      if (mimetype !== 'text/csv') {
        return reject(new WrongMimetypeError());
      }

      reqHasFiles = true;

      resolve(file);
    });

    busboy.on('finish', () => {
      if (!reqHasFiles) {
        resolve(null);
      }
    });

    busboy.on('error', error => reject(error));
  });
}
