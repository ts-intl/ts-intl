const NodeCache = require('node-cache');

const jsonFileCache = new NodeCache({ useClones: false });

const dictCache = new NodeCache({ useClones: false });

const TTL_IN_SECOND = 60 * 60 * 24; // day

module.exports = {
  jsonFileCache,
  dictCache,
  TTL_IN_SECOND,
};
