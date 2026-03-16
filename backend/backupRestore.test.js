const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const archiver = require('archiver');

const { extractBackupArchive } = require('./backupRestore');

async function createBackupArchive(archivePath, entries) {
  await fs.promises.mkdir(path.dirname(archivePath), { recursive: true });

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    for (const entry of entries) {
      if (entry.type === 'dir') {
        archive.append('', { name: entry.name });
      } else {
        archive.append(entry.content, { name: entry.name });
      }
    }
    const finalizeResult = archive.finalize();
    if (finalizeResult && typeof finalizeResult.then === 'function') {
      finalizeResult.catch(reject);
    }
  });
}

test('extractBackupArchive restores db files and config.json', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'nova-restore-test-'));
  const backupPath = path.join(tempRoot, 'backup.zip');
  const restoreDbDir = path.join(tempRoot, 'db-restore');
  const configRestorePath = path.join(tempRoot, 'config-restore.json');

  try {
    await createBackupArchive(backupPath, [
      { name: 'db/data.db', content: 'sqlite-bytes' },
      { name: 'db/collection/uploads/a.txt', content: 'hello' },
      { name: 'config.json', content: '{"appName":"Nova"}' },
      { name: 'ignored.txt', content: 'skip' }
    ]);

    await extractBackupArchive({ backupPath, restoreDbDir, configRestorePath });

    assert.equal(await fs.promises.readFile(path.join(restoreDbDir, 'data.db'), 'utf8'), 'sqlite-bytes');
    assert.equal(await fs.promises.readFile(path.join(restoreDbDir, 'collection/uploads/a.txt'), 'utf8'), 'hello');
    assert.equal(await fs.promises.readFile(configRestorePath, 'utf8'), '{"appName":"Nova"}');
  } finally {
    await fs.promises.rm(tempRoot, { recursive: true, force: true });
  }
});

test('extractBackupArchive ignores path traversal entries', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'nova-restore-test-'));
  const backupPath = path.join(tempRoot, 'backup.zip');
  const restoreDbDir = path.join(tempRoot, 'db-restore');
  const configRestorePath = path.join(tempRoot, 'config-restore.json');
  const escapedPath = path.join(tempRoot, 'escaped.txt');

  try {
    await createBackupArchive(backupPath, [
      { name: 'db/../../escaped.txt', content: 'malicious' },
      { name: 'db/ok.txt', content: 'safe' },
      { name: 'config.json', content: '{}' }
    ]);

    await extractBackupArchive({ backupPath, restoreDbDir, configRestorePath });

    assert.equal(fs.existsSync(escapedPath), false);
    assert.equal(await fs.promises.readFile(path.join(restoreDbDir, 'ok.txt'), 'utf8'), 'safe');
  } finally {
    await fs.promises.rm(tempRoot, { recursive: true, force: true });
  }
});
