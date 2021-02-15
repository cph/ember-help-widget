'use strict';

module.exports = {
  name: require('./package').name,
  contentFor: function(type) {
    if (type === 'head') {
      return '<script src="https://dev.zopim.com/web-sdk/latest/web-sdk.js"></script>';
    }

    return '';
  }
};
