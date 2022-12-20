import NodeCache from 'node-cache';

export const jsonFileCache = new NodeCache({ useClones: false });

export const dictCache = new NodeCache({ useClones: false });

export const TTL_IN_SECOND = 60 * 60 * 24; // day
