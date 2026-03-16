const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { pipeline } = require('stream/promises');

function resolveSafeDestination(baseDir, relativePath) {
  const normalizedRelativePath = path.posix.normalize(relativePath.replace(/\\/g, '/'));
  if (
    normalizedRelativePath === '..' ||
    normalizedRelativePath.startsWith('../') ||
    path.isAbsolute(normalizedRelativePath)
  ) {
    return null;
  }

  const resolvedBaseDir = path.resolve(baseDir);
  const destination = path.join(resolvedBaseDir, normalizedRelativePath);
  const resolvedDestination = path.resolve(destination);
  if (resolvedDestination !== resolvedBaseDir && !resolvedDestination.startsWith(resolvedBaseDir + path.sep)) {
    return null;
  }

  return resolvedDestination;
}

async function extractBackupArchive({ backupPath, restoreDbDir, configRestorePath }) {
  const zip = fs.createReadStream(backupPath).pipe(unzipper.Parse({ forceStream: true }));

  for await (const entry of zip) {
    const fileName = entry.path;
    if (fileName.startsWith('db/')) {
      const relativePath = fileName.substring(3);
      const destination = resolveSafeDestination(restoreDbDir, relativePath);

      if (!destination) {
        entry.autodrain();
        continue;
      }

      if (entry.type === 'Directory') {
        await fs.promises.mkdir(destination, { recursive: true });
        entry.autodrain();
      } else {
        await fs.promises.mkdir(path.dirname(destination), { recursive: true });
        await pipeline(entry, fs.createWriteStream(destination));
      }
    } else if (fileName === 'config.json') {
      await fs.promises.mkdir(path.dirname(configRestorePath), { recursive: true });
      await pipeline(entry, fs.createWriteStream(configRestorePath));
    } else {
      entry.autodrain();
    }
  }
}

module.exports = {
  extractBackupArchive,
  resolveSafeDestination
};
