const PocketBaseModule = require('pocketbase');

const PocketBase = PocketBaseModule.default || PocketBaseModule;

const DEFAULT_MAPPINGS = Object.freeze([
  { firebasePath: 'people', collection: 'people', sourceType: 'recordMap' },
  { firebasePath: 'users', collection: 'users', sourceType: 'recordMap' },
  { firebasePath: 'donations', collection: 'donations', sourceType: 'recordMap' },
  { firebasePath: 'expenses', collection: 'expenses', sourceType: 'recordMap' },
  { firebasePath: 'requests', collection: 'requests', sourceType: 'recordMap' },
  { firebasePath: 'settings', collection: 'settings', sourceType: 'singleRecord', recordKey: 'settings' },
  { firebasePath: 'system', collection: 'system', sourceType: 'singleRecord', recordKey: 'system' }
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDefaultPocketBaseMigrationConfig() {
  return {
    url: '',
    adminEmail: '',
    adminPassword: '',
    mappings: clone(DEFAULT_MAPPINGS)
  };
}

function normalizeMapping(mapping = {}, index = 0) {
  const normalized = {
    firebasePath: typeof mapping.firebasePath === 'string' ? mapping.firebasePath.trim().replace(/^\/+|\/+$/g, '') : '',
    collection: typeof mapping.collection === 'string' ? mapping.collection.trim() : '',
    sourceType: mapping.sourceType === 'singleRecord' ? 'singleRecord' : 'recordMap',
    firebaseKeyField: typeof mapping.firebaseKeyField === 'string' && mapping.firebaseKeyField.trim()
      ? mapping.firebaseKeyField.trim()
      : 'firebaseKey',
    payloadMode: mapping.payloadMode === 'raw' ? 'raw' : 'wrapped',
    payloadField: typeof mapping.payloadField === 'string' && mapping.payloadField.trim()
      ? mapping.payloadField.trim()
      : 'data',
    recordKey: typeof mapping.recordKey === 'string' && mapping.recordKey.trim()
      ? mapping.recordKey.trim()
      : ''
  };

  if (normalized.sourceType === 'singleRecord' && !normalized.recordKey) {
    normalized.recordKey = normalized.firebasePath || `root-${index + 1}`;
  }

  return normalized;
}

function normalizePocketBaseMigrationConfig(config) {
  const defaults = getDefaultPocketBaseMigrationConfig();
  const rawConfig = config && typeof config === 'object' ? config : {};
  const rawMappings = Array.isArray(rawConfig.mappings) && rawConfig.mappings.length > 0
    ? rawConfig.mappings
    : defaults.mappings;

  const mappings = rawMappings
    .map((mapping, index) => normalizeMapping(mapping, index))
    .filter((mapping) => mapping.firebasePath && mapping.collection);

  return {
    url: typeof rawConfig.url === 'string' ? rawConfig.url.trim() : defaults.url,
    adminEmail: typeof rawConfig.adminEmail === 'string' ? rawConfig.adminEmail.trim() : defaults.adminEmail,
    adminPassword: typeof rawConfig.adminPassword === 'string' ? rawConfig.adminPassword : defaults.adminPassword,
    mappings: mappings.length > 0 ? mappings : defaults.mappings
  };
}

function validatePocketBaseMigrationConfig(config) {
  const missingFields = [];
  if (!config.url) missingFields.push('url');
  if (!config.adminEmail) missingFields.push('adminEmail');
  if (!config.adminPassword) missingFields.push('adminPassword');
  if (!Array.isArray(config.mappings) || config.mappings.length === 0) missingFields.push('mappings');

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

async function createPocketBaseClient(config, createClient = (url) => new PocketBase(url)) {
  const pb = createClient(config.url);
  await pb.collection('_superusers').authWithPassword(config.adminEmail, config.adminPassword);
  return pb;
}

function buildPayloadForRecord(firebaseKey, value, mapping) {
  const payload = mapping.payloadMode === 'raw' && value && typeof value === 'object' && !Array.isArray(value)
    ? { ...value }
    : mapping.payloadMode === 'raw'
      ? { value }
      : { [mapping.payloadField]: value };

  if (mapping.firebaseKeyField) {
    payload[mapping.firebaseKeyField] = firebaseKey;
  }

  return payload;
}

async function readFirebasePath(firebaseDatabase, firebasePath) {
  const snapshot = await firebaseDatabase.ref(firebasePath).once('value');
  if (!snapshot.exists()) return null;
  return snapshot.val();
}

function toRecordEntries(sourceData, mapping) {
  if (sourceData == null) return [];

  if (mapping.sourceType === 'singleRecord') {
    return [{ firebaseKey: mapping.recordKey, value: sourceData }];
  }

  if (Array.isArray(sourceData)) {
    return sourceData
      .map((value, index) => ({ firebaseKey: String(index), value }))
      .filter((entry) => entry.value !== undefined);
  }

  if (typeof sourceData === 'object') {
    return Object.entries(sourceData).map(([firebaseKey, value]) => ({ firebaseKey, value }));
  }

  return [{ firebaseKey: mapping.recordKey || mapping.firebasePath, value: sourceData }];
}

async function runFirebaseToPocketBaseMigration({
  firebaseDatabase,
  pocketBaseClient,
  pocketBaseConfig,
  dryRun = false
}) {
  const config = normalizePocketBaseMigrationConfig(pocketBaseConfig);
  const summary = {
    dryRun,
    mappings: [],
    totals: {
      recordsRead: 0,
      created: 0,
      updated: 0,
      skipped: 0
    }
  };

  for (const mapping of config.mappings) {
    const sourceData = await readFirebasePath(firebaseDatabase, mapping.firebasePath);
    const entries = toRecordEntries(sourceData, mapping);
    const mappingSummary = {
      firebasePath: mapping.firebasePath,
      collection: mapping.collection,
      sourceType: mapping.sourceType,
      recordsRead: entries.length,
      created: 0,
      updated: 0,
      skipped: 0
    };

    const collectionApi = pocketBaseClient.collection(mapping.collection);

    for (const entry of entries) {
      const payload = buildPayloadForRecord(entry.firebaseKey, entry.value, mapping);
      const filter = pocketBaseClient.filter(
        `${mapping.firebaseKeyField} = {:firebaseKey}`,
        { firebaseKey: entry.firebaseKey }
      );
      const existing = await collectionApi.getList(1, 1, {
        filter,
        skipTotal: true
      });
      const existingRecord = existing.items[0] || null;

      if (dryRun) {
        if (existingRecord) {
          mappingSummary.updated += 1;
          summary.totals.updated += 1;
        } else {
          mappingSummary.created += 1;
          summary.totals.created += 1;
        }
        continue;
      }

      if (existingRecord) {
        await collectionApi.update(existingRecord.id, payload);
        mappingSummary.updated += 1;
        summary.totals.updated += 1;
      } else {
        await collectionApi.create(payload);
        mappingSummary.created += 1;
        summary.totals.created += 1;
      }
    }

    if (entries.length === 0) {
      mappingSummary.skipped += 1;
      summary.totals.skipped += 1;
    }

    summary.totals.recordsRead += entries.length;
    summary.mappings.push(mappingSummary);
  }

  return summary;
}

module.exports = {
  buildPayloadForRecord,
  createPocketBaseClient,
  getDefaultPocketBaseMigrationConfig,
  normalizePocketBaseMigrationConfig,
  runFirebaseToPocketBaseMigration,
  validatePocketBaseMigrationConfig
};
