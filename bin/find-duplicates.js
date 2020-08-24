#!/usr/bin/env node

import program from 'commander';
import findDuplicates from '../index.js';

program
  .version('0.0.3')
  .arguments('<dirpath>')
  .description('Looking for duplicates css classes')
  .action(async (dirPath) => {
    const result = await findDuplicates(dirPath);

    result.forEach(({ filePath, collisions }) => {
      collisions.forEach((item) => {
        console.log(filePath);
        console.log(item.filePath);
        console.log(item.intersectedClasses.join(', '));
        console.log('-------------------');
      });
    });
  })
  .parse(process.argv);
