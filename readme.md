[![Unit test](https://github.com/crabart/connect-deta-base/actions/workflows/unit_test.yml/badge.svg)](https://github.com/crabart/connect-deta-base/actions/workflows/unit_test.yml)
[![Coverage Status](https://coveralls.io/repos/github/crabart/connect-deta-base/badge.svg)](https://coveralls.io/github/crabart/connect-deta-base)

**connect-deta-base** provides Deta Base session storage for Express.

TypeScript is supported limitedly.

## Installation

```
npm install express deta express-session connect-deta-base
```

<!-- ```
yarn add express deta express-session connect-deta-base
``` -->

To develop with TypeScript, install below too.

```
npm install --save-dev @types/express @types/express-session
```

## API

For initialize Deta Base, see also Deta Base official docs.

Ref: https://docs.deta.sh/docs/base/sdk#instantiating

### Use JavaScript

```
const express = require("express");
const session = require("express-session");
const DetaBaseStore = require("connect-deta-base")(session);

const { Deta } = require("deta");
const deta = Deta("project key");
const detaBaseClient = deta.Base("sessions");

const app = express();

app.use(
  session({
    store: new DetaBaseStore({ client: detaBaseClient }),
    saveUninitialized: false,
    secret: "keyboard cat",
    resave: false,
  })
);
```

### Use TypeScript

```
import express from "express";
import session from "express-session";
import DetaBaseStore from "connect-deta-base";

import { Deta } from "deta";
const deta = Deta("project key");
const detaBaseClient = deta.Base("sessions");

const detaBaseStore = DetaBaseStore(session);

const app = express();

app.use(
  session({
    store: new detaBaseStore({ client: detaBaseClient }),
    saveUninitialized: false,
    secret: "keyboard cat",
    resave: false,
  })
);
```

### DetaBaseStore(options)

The DetaBaseStore requires a Deta Base client.

#### Options

##### client

An instance of Deta Base client (required).

##### prefix

Key prefix in Deta Base (default: sess:).

**Note**: You may need unique prefixes for different applications sharing the same database. This limits bulk commands exposed in `express-session` (like `length`, `all`, `keys`, and `clear`) to a single application's data.

##### ttl

If the session cookie has a `expires` date, `connect-deta-base` will use it as the TTL.

Otherwise, the session will expire using the `ttl` option (default: `86400` seconds or one day).

**Note**: The TTL is reset every time a user interacts with the server. You can sometimes disable this behavior by setting false to `enableTouch`.

##### enableTouch

Enables re-saving and resetting the TTL when using `touch` (default: `true`).

The `express-session` package uses `touch` to signal to the store that the user has interacted with the session but hasn't changed anything in its data. Typically, this helps keep the users' session alive if session changes are infrequent but you may want to disable it to cut down the extra calls or to prevent users from keeping sessions open too long. Also, consider disabling if you store a lot of data on the session.

Ref: https://github.com/expressjs/session#storetouchsid-session-callback

##### enableTTL

Enables key expiration (default: `true`).

This option enables key expiration requiring the user to manually manage key cleanup outside of `connect-deta-base`. Only set false if you know what you are doing and have an exceptional case where you need to manage your own expiration in Deta Base.

**Note**: This has no effect on `express-session` setting cookie expiration.

### Limited support for TypeScript

These methods are not supported yet. Only JavaScript.

- all
- clear
- destroy
- get
- set
- length
- touch
