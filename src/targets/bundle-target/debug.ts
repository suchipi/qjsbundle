import * as std from "quickjs:std";

// only builds binaries for current platform
export function debugMode(options: {
  quickjsRepoDir: Path;
  inputFile: Path;
  outputFile: Path;
}) {
  const { quickjsRepoDir, inputFile, outputFile } = options;

  exec("meta/build.sh", { cwd: quickjsRepoDir });

  if (exists(outputFile)) {
    remove(outputFile);
  }

  const qjsBootstrapPath = quickjsRepoDir.concat("build/bin/qjsbootstrap");

  const outFile = std.open(outputFile.toString(), "w");
  pipe(qjsBootstrapPath, outFile);
  pipe(inputFile, outFile);
  outFile.close();
  chmod(0o755, outputFile);

  console.log(`Program written to: ${outputFile}`);
}
