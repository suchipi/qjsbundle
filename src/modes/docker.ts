import * as std from "quickjs:std";
import { getAppCacheDir } from "../lib/get-app-cache-dir";

const PLATFORMS = [
  "x86_64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "x86_64-unknown-linux-musl",
  "x86_64-unknown-linux-static",
  "x86_64-pc-windows-static",
  "aarch64-apple-darwin",
  "aarch64-unknown-linux-gnu",
  "aarch64-unknown-linux-musl",
  "aarch64-unknown-linux-static",
];

export function dockerMode(options: {
  quickjsRepoDir: Path;
  inputFile: Path;
  outputFile: Path;
  useBytecode: boolean;
}) {
  const { quickjsRepoDir, inputFile, outputFile, useBytecode } = options;

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

  let fileToAppend = inputFile;
  if (useBytecode) {
    const bytecodeFilePath = getAppCacheDir().concat(`bytecode-${Date.now()}`);
    exec([
      quickjsRunOutPath.toString(),
      Path.resolve(__dirname, "../lib/file-to-bytecode.js"),
      inputFile.toString(),
      bytecodeFilePath.toString(),
    ]);
    fileToAppend = bytecodeFilePath;
  }

  for (const triplet of PLATFORMS) {
    const outputFile = outputFilesMap[triplet];

    if (exists(outputFile)) {
      remove(outputFile);
    }

    ensureDir(dirname(outputFile));

    const exeSuffix = /windows/.test(triplet) ? ".exe" : "";

    const qjsBootstrapPath = useBytecode
      ? quickjsRepoDir.concat(
          `build/${triplet}/bin/qjsbootstrap-bytecode${exeSuffix}`
        )
      : quickjsRepoDir.concat(`build/${triplet}/bin/qjsbootstrap${exeSuffix}`);

    console.log("Writing", outputFile.toString());
    const outFile = std.open(outputFile.toString(), "w");
    pipe(qjsBootstrapPath, outFile);
    pipe(fileToAppend, outFile);
    outFile.close();
    chmod(0o755, outputFile);
  }

  if (useBytecode) {
    console.log("Deleting", fileToAppend.toString());
    remove(fileToAppend);
  }
}
