const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeDataPath,
  decodeTokenPayload,
  sanitizeSelfUserWrite,
  generatePocketBaseCredentials
} = require('./pocketbase');
const { unwrapFirebaseExportRoot } = require('./firebaseMigration');

test('normalizeDataPath trims duplicate separators', () => {
  assert.equal(normalizeDataPath('/people//123/'), 'people/123');
  assert.equal(normalizeDataPath(''), '');
});

test('decodeTokenPayload decodes base64url JWT payloads', () => {
  const payload = { id: 'abc123', type: 'auth' };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const decoded = decodeTokenPayload(`x.${encoded}.y`);
  assert.deepEqual(decoded, payload);
});

test('sanitizeSelfUserWrite strips admin flags but keeps editable profile fields', () => {
  const sanitized = sanitizeSelfUserWrite({
    firstName: 'Ada',
    lastName: 'Lovelace',
    emailNotifications: false,
    admin: true,
    superAdmin: true
  });

  assert.deepEqual(sanitized, {
    firstName: 'Ada',
    lastName: 'Lovelace',
    emailNotifications: false,
    name: 'Ada Lovelace'
  });
});

test('generatePocketBaseCredentials returns docker-local defaults', () => {
  const credentials = generatePocketBaseCredentials();
  assert.equal(credentials.url, 'http://127.0.0.1:8090');
  assert.match(credentials.adminEmail, /^nova-.*@local\.invalid$/);
  assert.ok(credentials.adminPassword.length >= 20);
});

test('unwrapFirebaseExportRoot unwraps single Firebase export wrapper node', () => {
  const wrapped = {
    'juba-kasse-default-rtdb-europe-west1': {
      expenses: [{ id: '1', amount: 10 }],
      people: {
        '1753650720871': {
          id: '1753650720871',
          name: 'Denis Chaban'
        }
      }
    }
  };

  assert.deepEqual(unwrapFirebaseExportRoot(wrapped), wrapped['juba-kasse-default-rtdb-europe-west1']);
});

test('unwrapFirebaseExportRoot leaves already-flat migration payloads unchanged', () => {
  const flat = {
    expenses: [{ id: '1', amount: 10 }],
    people: {
      '1753650720871': {
        id: '1753650720871',
        name: 'Denis Chaban'
      }
    }
  };

  assert.deepEqual(unwrapFirebaseExportRoot(flat), flat);
});

test('unwrapFirebaseExportRoot ignores unrelated single-key objects', () => {
  const unrelated = {
    metadata: {
      version: 1
    }
  };

  assert.deepEqual(unwrapFirebaseExportRoot(unrelated), unrelated);
});
