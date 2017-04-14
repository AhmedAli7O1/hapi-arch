const gen = require('./index');

gen(
  process.cwd(),
  [
    {
      type: 'folder',
      name: 'ff',
      sub: [
        {
          type: 'folder',
          name: 'tt'
        },
        {
          type: 'folder',
          name: 'nn',
          sub: [
            {
              type: 'folder',
              name: 'qq'
            }
          ]
        }
      ]
    },
    {
      type: 'folder',
      name: 'kk',
      sub: [
        {
          type: 'json',
          name: 'package',
          data: {
            test: 'val1',
            test2: 'val2',
            test3: {
              test4: 'val3',
              test5: 'val4'
            }
          }
        }
      ]
    },
    {
      type: 'json',
      name: 'package',
      data: {
        test: 'val1',
        test2: 'val2',
        test3: {
          test4: 'val3',
          test5: 'val4'
        }
      }
    }
  ]
);