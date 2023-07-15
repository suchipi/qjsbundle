import { getAppCacheDir } from "../lib/get-app-cache-dir";
import { PLATFORMS } from "../lib/platforms";

export function archiveTarget(options: {
  inputFile: Path; // binary pattern with [PLATFORM]
  outputFile: Path; // archive pattern with [PLATFORM]
  additionalFilesDir: Path | null;
}) {
  const { inputFile, outputFile, additionalFilesDir } = options;

  const inputFileString = inputFile.toString();
  const outputFileString = outputFile.toString();

  function inputFileFor(triplet: string) {
    const exeSuffix = /windows/.test(triplet) ? ".exe" : "";
    const templatePath = inputFileString + exeSuffix;

    if (/\[PLATFORM\]/.test(templatePath)) {
      return new Path(templatePath.replace(/\[PLATFORM\]/g, triplet));
    } else {
      throw new Error(
        "When archiving, the input filename should be a pattern containing the string '[PLATFORM]'. Received input file was: " +
          inputFileString
      );
    }
  }

  function outputFileFor(triplet: string) {
    const exeSuffix = /windows/.test(triplet) ? ".exe" : "";
    const templatePath = outputFileString + exeSuffix;

    if (/\[PLATFORM\]/.test(templatePath)) {
      return new Path(templatePath.replace(/\[PLATFORM\]/g, triplet));
    } else {
      throw new Error(
        "When archiving, the output filename should be a pattern containing the string '[PLATFORM]'. Received output file was: " +
          outputFileString
      );
    }
  }

  const appCacheDir = getAppCacheDir();
  const archiveCacheDir = appCacheDir.concat(`archive-${Date.now()}`);

  try {
    ensureDir(archiveCacheDir);

    for (const triplet of PLATFORMS) {
      const binaryPath = inputFileFor(triplet);
      const tarGzPath = outputFileFor(triplet);

      const platformDir = archiveCacheDir.concat(triplet);
      ensureDir(platformDir);
      copy(binaryPath, platformDir);

      if (additionalFilesDir != null) {
        // TODO: ls should probably return array of Path, not array of string
        for (const additionalFile of ls(additionalFilesDir)) {
          copy(additionalFile, platformDir);
        }
      }

      exec(["tar", "-czvf", tarGzPath.toString(), platformDir.toString()]);
    }
  } finally {
    remove(archiveCacheDir);
  }
}
