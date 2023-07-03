import * as std from "quickjs:std";

export function nativeMode(options: {
  quickjsRepoDir: Path;
  inputFile: Path;
  outputFile: Path;
}) {
  const { quickjsRepoDir, inputFile, outputFile } = options;

  // TODO (in yavascript): cwd should accept Path
  exec("meta/build.sh", { cwd: quickjsRepoDir.toString() });

  const qjsBootstrapPath = Path.join(quickjsRepoDir, "build/bin/qjsbootstrap");

  if (exists(outputFile)) {
    remove(outputFile);
  }

  const outFile = std.open(outputFile.toString(), "w");
  pipe({ path: qjsBootstrapPath }, outFile);
  // TODO (in yavascript): Path should be accepted as PipeSource
  pipe({ path: inputFile.toString() }, outFile);
  outFile.close();
  chmod(0o755, outputFile);

  console.log(`Program written to: ${outputFile}`);
}
