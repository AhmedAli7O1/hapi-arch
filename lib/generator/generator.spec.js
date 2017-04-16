const Generator = require('./index');

let generator = new Generator();

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