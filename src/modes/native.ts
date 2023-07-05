import * as std from "quickjs:std";

export function nativeMode(options: {
  quickjsRepoDir: Path;
  inputFile: Path;
  outputFile: Path;
}) {
  const { quickjsRepoDir, inputFile, outputFile } = options;

  exec("meta/build.sh", { cwd: quickjsRepoDir.toString() });

  const qjsBootstrapPath = quickjsRepoDir.concat("build/bin/qjsbootstrap");

  if (exists(outputFile)) {
    remove(outputFile);
  }

  const outFile = std.open(outputFile.toString(), "w");
  pipe(qjsBootstrapPath, outFile);
  pipe(inputFile, outFile);
  outFile.close();
  chmod(0o755, outputFile);

  console.log(`Program written to: ${outputFile}`);
}
