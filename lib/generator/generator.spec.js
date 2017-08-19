const Generator = require('./index');

const generator = new Generator();

generator.generate({
  location: process.cwd(),
  type: 'folder',
  name: 'test-dir',
  sub: [
    {
      type: 'file',
      name: 'Test',
      template: 'model'
    }
  ]
});