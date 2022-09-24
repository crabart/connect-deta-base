module.exports = async function (client) {
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
