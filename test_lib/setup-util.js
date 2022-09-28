module.exports.setupDefaultData = async function (client) {
  const retArray = [];
  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        },
      },
      'sess:hoge',
      { expireIn: 86400 }
    )
  );

  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'foo', param2: 3000 },
          other: 'other',
        },
      },
      'sess:foo'
    )
  );

  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'barbar', param2: 5500 },
          num: 111,
        },
      },
      'sess:bar',
      { expireIn: 86400 }
    )
  );

  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        },
      },
      'another:hoge',
      { expireIn: 86400 }
    )
  );

  Promise.all(retArray);
};

module.exports.setupDefaultSessions = async function (store) {
  const retArray = [];
  retArray.push(
    store.set('hoge', {
      cookie: { param1: 'hoge', param2: 100 },
      message: 'this is message',
    })
  );

  retArray.push(
    store.set('foo', {
      cookie: { param1: 'foo', param2: 3000 },
      other: 'other',
    })
  );

  retArray.push(
    store.set('bar', { cookie: { param1: 'barbar', param2: 5500 }, num: 111 })
  );

  Promise.all(retArray);
};
