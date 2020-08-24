import { test, expect } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';

import findDuplicates from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

test('findDuplicates', async () => {
  const dirPath = getFixturePath('project/components');
  const result = await findDuplicates(dirPath);

  const expected = [
    {
      filePath: '/Users/roman/code/classnames-duplicates/__fixtures__/project/components/Link/button/button.scss',
      fileClasses: ['btn', 'link-btn', 'main'],
      collisions: [
        {
          filePath:
            '/Users/roman/code/classnames-duplicates/__fixtures__/project/components/Button/default/default.scss',
          intersectedClasses: ['btn'],
        },
      ],
    },
  ];

  expect(result).toEqual(expected);
});
