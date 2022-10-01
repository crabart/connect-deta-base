import { describe, expect, test } from '@jest/globals';
import session from 'express-session';
import DetaBaseStore from 'connect-deta-base';
import { Deta } from 'deta';
const deta = Deta('dummy');
const db = deta.Base('dummy');

describe('constructor', () => {
  test('default', () => {
    const detaBaseStore = DetaBaseStore(session);
    const dbs = new detaBaseStore({ client: db });
    expect(dbs.client).toEqual(db);
    expect(dbs.prefix).toBe('sess:');
    expect(dbs.ttl).toBe(86400);
    expect(dbs.enableTTL).toBe(true);
    expect(dbs.enableTouch).toBe(true);
  });

  test('set all', () => {
    const detaBaseStore = DetaBaseStore(session);
    const prefix = 'prefix:';
    const ttl = 600;
    const enableTouch = false;
    const enableTTL = false;
    const dbs = new detaBaseStore({
      client: db,
      prefix: prefix,
      ttl: ttl,
      enableTouch: enableTouch,
      enableTTL: enableTTL,
    });
    expect(dbs.client).toEqual(db);
    expect(dbs.prefix).toBe(prefix);
    expect(dbs.ttl).toBe(ttl);
    expect(dbs.enableTTL).toBe(enableTouch);
    expect(dbs.enableTouch).toBe(enableTTL);
  });
});
