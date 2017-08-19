/**
 * @fileoverview Rule to disallow unnecessary semicolons
 * @author Nicholas C. Zakas
 */

'use strict';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'disallow unnecessary semicolons',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: 'code',
    schema: [] // no options
  },
  // param context
  create: function () {
    return {}; // callback functions
  }
};