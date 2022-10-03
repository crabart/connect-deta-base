const session = require('express-session');
const FakeDetaBaseClient = require('../test_lib/fake-deta-base-client');
const ConnectDetaBase = require('../')(session);
const client = new FakeDetaBaseClient();
const SetupUtil = require('../test_lib/setup-util');

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;
  client.limit = 1000;
  const option = { client: client };
  await SetupUtil.setupDefaultSessions(new ConnectDetaBase(option));
});

describe('constructor', () => {
  test('no client', () => {
    expect(() => new ConnectDetaBase()).toThrow(
      'A client must be provided to the DetaBaseStore'
    );
  });
});
