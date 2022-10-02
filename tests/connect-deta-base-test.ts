// import { describe, expect, test } from '@jest/globals';
// import session from 'express-session';
// import DetaBaseStore from 'connect-deta-base';
// import { Deta } from 'deta';
// import FakeDetaBaseClient from 'fake-deta-base-client';
// const deta = Deta('dummy');
// const db = deta.Base('dummy');

// describe('constructor', () => {
//   test('default', () => {
//     const detaBaseStore = DetaBaseStore(session);
//     const dbs = new detaBaseStore({ client: db });
//     expect(dbs.client).toEqual(db);
//     expect(dbs.prefix).toBe('sess:');
//     expect(dbs.ttl).toBe(86400);
//     expect(dbs.enableTTL).toBe(true);
//     expect(dbs.enableTouch).toBe(true);
//   });

//   test('set all', () => {
//     const detaBaseStore = DetaBaseStore(session);
//     const prefix = 'prefix:';
//     const ttl = 600;
//     const enableTouch = false;
//     const enableTTL = false;
//     const dbs = new detaBaseStore({
//       client: db,
//       prefix: prefix,
//       ttl: ttl,
//       enableTouch: enableTouch,
//       enableTTL: enableTTL,
//     });
//     expect(dbs.client).toEqual(db);
//     expect(dbs.prefix).toBe(prefix);
//     expect(dbs.ttl).toBe(ttl);
//     expect(dbs.enableTTL).toBe(enableTouch);
//     expect(dbs.enableTouch).toBe(enableTTL);
//   });
// });

import session from 'express-session';
import FakeDetaBaseClient from '../test_lib/client/fake-deta-base-client';
import ConnectDetaBase from 'connect-deta-base';
const cdb = ConnectDetaBase(session);
const client = new FakeDetaBaseClient();
const SetupUtil = require('../test_lib/setup-util');

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;
  client.limit = 1000;
  const option = { client: client };
  // await SetupUtil.setupDefaultSessions(new cdb(option));
});
describe('constructor', () => {
  test('hoge', () => {
    expect(1).toBe(1);
  });

  // test('no client', () => {
  //   expect(() => new cdb()).toThrow(
  //     'A client must be provided to the DetaBaseStore'
  //   );
  // });

  // test('default and client', () => {
  //   const option = { client: client };
  //   const store = new cdb(option);

  //   expect(store.prefix).toBe('sess:');
  //   expect(store.ttl).toBe(86400);
  //   expect(store.enableTTL).toBe(true);
  //   expect(store.enableTouch).toBe(true);
  // });

  // test('set options', () => {
  //   const option = {
  //     prefix: 'prefix',
  //     client: client,
  //     ttl: 1000,
  //     enableTTL: false,
  //     enableTouch: false,
  //   };
  //   const store = new cdb(option);

  //   expect(store.prefix).toBe('prefix');
  //   expect(store.ttl).toBe(1000);
  //   expect(store.enableTTL).toBe(false);
  //   expect(store.enableTouch).toBe(false);
  // });

  // test('set only enable TTL', () => {
  //   const option = {
  //     client: client,
  //     enableTTL: false,
  //   };
  //   const store = new cdb(option);

  //   expect(store.prefix).toBe('sess:');
  //   expect(store.ttl).toBe(86400);
  //   expect(store.enableTTL).toBe(false);
  //   expect(store.enableTouch).toBe(true);
  // });
});
