import * as std from "quickjs:std";
import { getAppCacheDir } from "../../lib/get-app-cache-dir";
import { PLATFORMS } from "../../lib/platforms";

// uses docker to build binaries for all supported platforms
export function releaseMode(options: {
  quickjsRepoDir: Path;
  inputFile: Path;
  outputFile: Path;
}) {
  const { quickjsRepoDir, inputFile, outputFile } = options;

  function outputFileFor(triplet: string) {
    const exeSuffix = /windows/.test(triplet) ? ".exe" : "";
    const templatePath = outputFile.toString() + exeSuffix;

    if (/\[PLATFORM\]/.test(templatePath)) {
      return new Path(templatePath.replace(/\[PLATFORM\]/g, triplet));
    } else {
      throw new Error(
        "When compiling in Docker mode, more than file is output; one per platform. The string '[PLATFORM]' must appear in the output file path, which will be used as a placeholder for all the different platform triplets that get compiled. But, the string '[PLATFORM]' was not present in the received output path, so it's not clear how to write files that don't overwrite each other. Received output file was: " +
          outputFile.toString()
      );
    }
  }

  // precalculate output file paths so error messages from that process happen
  // sooner rather than after spending minutes and minutes compiling stuff in
  // docker
  const outputFilesMap = PLATFORMS.reduce((obj, platform) => {
    obj[platform] = outputFileFor(platform);
    return obj;
  }, {});

  // to get quickjs-run for current platform
  exec("meta/build.sh", { cwd: quickjsRepoDir });
  const quickjsRunOutPath = getAppCacheDir().concat("quickjs-run");
  if (exists(quickjsRunOutPath)) {
    remove(quickjsRunOutPath);
  }
  copy(quickjsRepoDir.concat("build/bin/quickjs-run"), quickjsRunOutPath);

  // to get qjsbootstrap for all platforms
  // NOTE: will delete the contents of quickjsRepoDir/build
  exec("meta/docker/build-all.sh", { cwd: quickjsRepoDir });

  const bytecodeFilePath = getAppCacheDir().concat(`bytecode-${Date.now()}`);
  exec([
    quickjsRunOutPath.toString(),
    Path.resolve(__dirname, "../../lib/file-to-bytecode.js"),
    inputFile.toString(),
    bytecodeFilePath.toString(),
  ]);

  for (const triplet of PLATFORMS) {
    const outputFile = outputFilesMap[triplet];

    if (exists(outputFile)) {
      remove(outputFile);
    }

    ensureDir(dirname(outputFile));

    const exeSuffix = /windows/.test(triplet) ? ".exe" : "";

    const qjsBootstrapPath = quickjsRepoDir.concat(
      `build/${triplet}/bin/qjsbootstrap-bytecode${exeSuffix}`
    );

    console.log("Writing", outputFile.toString());
    const outFile = std.open(outputFile.toString(), "w");
    pipe(qjsBootstrapPath, outFile);
    pipe(bytecodeFilePath, outFile);
    outFile.close();
    chmod(0o755, outputFile);
  }

  console.log("Deleting", bytecodeFilePath.toString());
  remove(bytecodeFilePath);
}
