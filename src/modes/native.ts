import * as std from "quickjs:std";
import { getAppCacheDir } from "../lib/get-app-cache-dir";

export function nativeMode(options: {
  quickjsRepoDir: Path;
  inputFile: Path;
  outputFile: Path;
  useBytecode: boolean;
}) {
  const { quickjsRepoDir, inputFile, outputFile, useBytecode } = options;

  exec("meta/build.sh", { cwd: quickjsRepoDir });

  if (exists(outputFile)) {
    remove(outputFile);
  }

  let fileToAppend = inputFile;
  if (useBytecode) {
    const bytecodeFilePath = getAppCacheDir().concat(`bytecode-${Date.now()}`);
    exec([
      quickjsRepoDir.concat("build/bin/quickjs-run").toString(),
      Path.resolve(__dirname, "../lib/file-to-bytecode.js"),
      inputFile.toString(),
      bytecodeFilePath.toString(),
    ]);
    fileToAppend = bytecodeFilePath;
  }

  const qjsBootstrapPath = useBytecode
    ? quickjsRepoDir.concat("build/bin/qjsbootstrap-bytecode")
    : quickjsRepoDir.concat("build/bin/qjsbootstrap");

  const outFile = std.open(outputFile.toString(), "w");
  pipe(qjsBootstrapPath, outFile);
  pipe(fileToAppend, outFile);
  outFile.close();
  chmod(0o755, outputFile);

  if (useBytecode) {
    console.log("Deleting", fileToAppend.toString());
    remove(fileToAppend);
  }

  console.log(`Program written to: ${outputFile}`);
}
