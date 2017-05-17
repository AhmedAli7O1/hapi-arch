'use strict';

function msg (options) {
  const arch = 'Hapi Arch';
  const typeError = 'ERROR';
  const typeInfo = 'INFO';
  let text = '';

  switch (options.type) {
    case 'error':
      text = `[${arch}] (${typeError}) ${options.text}`;
      break;
    case 'info':
      text = `[${arch}] (${typeInfo}) ${options.text}`;
      break;
    default:
      text = `[${arch}] ${options.text}`;
  }

}

module.exports = {msg};

