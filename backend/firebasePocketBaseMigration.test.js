const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPayloadForRecord,
  createPocketBaseClient,
  getDefaultPocketBaseMigrationConfig,
  normalizePocketBaseMigrationConfig,
  runFirebaseToPocketBaseMigration,
  validatePocketBaseMigrationConfig
} = require('./firebasePocketBaseMigration');

function createFirebaseDatabase(source) {
  return {
    ref(path) {
      return {
        async once() {
          const value = source[path];
          return {
            exists: () => value !== undefined && value !== null,
            val: () => value
          };
        }
      };
    }
  };
}

function createPocketBaseMock(existingRecordsByCollection = {}) {
  const state = structuredClone(existingRecordsByCollection);
  const created = [];
  const updated = [];
  const auth = [];

  return {
    state,
    created,
    updated,
    auth,
    filter(_expr, params) {
      return JSON.stringify(params);
    },
    collection(name) {
      return {
        authWithPassword: async (email, password) => {
          auth.push({ name, email, password });
          return { token: 'token' };
        },
        getList: async (_page, _perPage, options = {}) => {
          const params = JSON.parse(options.filter || '{}');
          const firebaseKey = params.firebaseKey;
          const record = state[name]?.[firebaseKey] || null;
          return { items: record ? [record] : [] };
        },
        create: async (payload) => {
          created.push({ name, payload });
          state[name] = state[name] || {};
          state[name][payload.firebaseKey] = {
            id: `${name}-${payload.firebaseKey}`,
            ...payload
          };
          return state[name][payload.firebaseKey];
        },
        update: async (id, payload) => {
          updated.push({ name, id, payload });
          return { id, ...payload };
        }
      };
    }
  };
}

test('default PocketBase migration config includes expected Firebase roots', () => {
  const config = getDefaultPocketBaseMigrationConfig();

  assert.equal(config.url, '');
  assert.equal(config.adminEmail, '');
  assert.equal(config.adminPassword, '');
  assert.deepEqual(
    config.mappings.map((mapping) => mapping.firebasePath),
    ['people', 'users', 'donations', 'expenses', 'requests', 'settings', 'system']
  );
});

test('normalizePocketBaseMigrationConfig trims credentials and restores default mappings', () => {
  const config = normalizePocketBaseMigrationConfig({
    url: ' https://pb.example.com ',
    adminEmail: ' admin@example.com ',
    adminPassword: 'secret',
    mappings: []
  });

  assert.equal(config.url, 'https://pb.example.com');
  assert.equal(config.adminEmail, 'admin@example.com');
  assert.equal(config.adminPassword, 'secret');
  assert.equal(config.mappings.length, 7);
});

test('validatePocketBaseMigrationConfig reports missing fields', () => {
  const validation = validatePocketBaseMigrationConfig({
    url: '',
    adminEmail: '',
    adminPassword: '',
    mappings: []
  });

  assert.equal(validation.isValid, false);
  assert.deepEqual(validation.missingFields, ['url', 'adminEmail', 'adminPassword', 'mappings']);
});

test('buildPayloadForRecord supports wrapped and raw payload modes', () => {
  assert.deepEqual(
    buildPayloadForRecord('abc', { name: 'Alice' }, {
      firebaseKeyField: 'firebaseKey',
      payloadMode: 'wrapped',
      payloadField: 'data'
    }),
    {
      firebaseKey: 'abc',
      data: { name: 'Alice' }
    }
  );

  assert.deepEqual(
    buildPayloadForRecord('xyz', { name: 'Bob' }, {
      firebaseKeyField: 'firebaseKey',
      payloadMode: 'raw',
      payloadField: 'ignored'
    }),
    {
      firebaseKey: 'xyz',
      name: 'Bob'
    }
  );
});

test('createPocketBaseClient authenticates against the _superusers collection', async () => {
  const pocketBaseMock = createPocketBaseMock();
  const client = await createPocketBaseClient({
    url: 'https://pb.example.com',
    adminEmail: 'admin@example.com',
    adminPassword: 'secret'
  }, () => pocketBaseMock);

  assert.equal(client, pocketBaseMock);
  assert.deepEqual(pocketBaseMock.auth, [{
    name: '_superusers',
    email: 'admin@example.com',
    password: 'secret'
  }]);
});

test('runFirebaseToPocketBaseMigration performs dry-run counts without writes', async () => {
  const firebaseDatabase = createFirebaseDatabase({
    people: {
      a1: { name: 'Alice' },
      b2: { name: 'Bob' }
    },
    settings: { contribution: 10 }
  });
  const pocketBaseMock = createPocketBaseMock({
    people: {
      a1: { id: 'people-a1', firebaseKey: 'a1', data: { name: 'Alice' } }
    }
  });

  const summary = await runFirebaseToPocketBaseMigration({
    firebaseDatabase,
    pocketBaseClient: pocketBaseMock,
    pocketBaseConfig: {
      mappings: [
        { firebasePath: 'people', collection: 'people', sourceType: 'recordMap' },
        { firebasePath: 'settings', collection: 'settings', sourceType: 'singleRecord', recordKey: 'settings' }
      ]
    },
    dryRun: true
  });

  assert.equal(summary.dryRun, true);
  assert.deepEqual(summary.totals, {
    recordsRead: 3,
    created: 2,
    updated: 1,
    skipped: 0
  });
  assert.equal(pocketBaseMock.created.length, 0);
  assert.equal(pocketBaseMock.updated.length, 0);
});

test('runFirebaseToPocketBaseMigration creates and updates PocketBase records', async () => {
  const firebaseDatabase = createFirebaseDatabase({
    people: {
      a1: { name: 'Alice' },
      b2: { name: 'Bob' }
    }
  });
  const pocketBaseMock = createPocketBaseMock({
    people: {
      a1: { id: 'people-a1', firebaseKey: 'a1', data: { name: 'Old Alice' } }
    }
  });

  const summary = await runFirebaseToPocketBaseMigration({
    firebaseDatabase,
    pocketBaseClient: pocketBaseMock,
    pocketBaseConfig: {
      mappings: [
        { firebasePath: 'people', collection: 'people', sourceType: 'recordMap' }
      ]
    }
  });

  assert.deepEqual(summary.totals, {
    recordsRead: 2,
    created: 1,
    updated: 1,
    skipped: 0
  });
  assert.equal(pocketBaseMock.created.length, 1);
  assert.equal(pocketBaseMock.updated.length, 1);
  assert.deepEqual(pocketBaseMock.created[0], {
    name: 'people',
    payload: {
      firebaseKey: 'b2',
      data: { name: 'Bob' }
    }
  });
  assert.deepEqual(pocketBaseMock.updated[0], {
    name: 'people',
    id: 'people-a1',
    payload: {
      firebaseKey: 'a1',
      data: { name: 'Alice' }
    }
  });
});
