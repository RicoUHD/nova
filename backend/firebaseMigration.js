const EXPECTED_MIGRATION_KEYS = new Set([
  'settings',
  'system',
  'donations',
  'expenses',
  'people',
  'requests',
  'users'
]);

function unwrapFirebaseExportRoot(data) {
  function unwrapRecursive(currentData) {
    if (!currentData || typeof currentData !== 'object' || Array.isArray(currentData)) {
      return { found: false, data: currentData };
    }

    const rootKeys = Object.keys(currentData);
    if (rootKeys.some((key) => EXPECTED_MIGRATION_KEYS.has(key))) {
      return { found: true, data: currentData };
    }

    if (rootKeys.length === 1) {
      const rootKey = rootKeys[0];
      const nested = currentData[rootKey];
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        return unwrapRecursive(nested);
      }
    }

    return { found: false, data: currentData };
  }

  const result = unwrapRecursive(data);
  if (result && result.found) {
    return result.data;
  }

  return data;
}

module.exports = {
  EXPECTED_MIGRATION_KEYS,
  unwrapFirebaseExportRoot
};
