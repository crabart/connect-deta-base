/// <reference types="express" />
/// <reference types="express-session" />
/// <reference types="deta" />

declare module 'connect-deta-base' {
  import * as express from 'express';
  import * as session from 'express-session';
  import Base from 'deta/dist/types/base';

  function s(
    options: (options?: session.SessionOptions) => express.RequestHandler
  ): s.DetaBaseStore;

  namespace s {
    interface DetaBaseStore extends session.Store {
      new (options: DetaBaseStoreOptions): DetaBaseStore;
      client: Client;
      prefix?: string | undefined;
      ttl?: number | undefined;
      enableTTL?: boolean | undefined;
      enableTouch?: boolean | undefined;
    }

    interface DetaBaseStoreOptions {
      client: Client;
      prefix?: string | undefined;
      ttl?: number | undefined;
      enableTTL?: boolean | undefined;
      enableTouch?: boolean | undefined;
    }

    interface Client extends Base {}
  }

  export = s;
}
