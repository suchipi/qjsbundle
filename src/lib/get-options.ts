export type Options = {
  mode: "native" | "docker";
  inputFile: Path;
  outputFile: Path;
  quickjsRef: string;
  help: boolean;
  // TODO: bytecode option
};

export function getOptions(): Options {
  const { flags, args } = parseScriptArgs({
    mode: string,
    inputFile: Path,
    outputFile: string,
    quickjsRef: string,
    help: boolean,
    h: boolean,
  });

  const mode = flags.mode || "native";
  assert.type(
    mode,
    types.or(types.exactString("native"), types.exactString("docker")),
    "'--mode' must be either 'native' or 'docker'"
  );

  let inputFile: Path | null =
    flags.inputFile || args[0] ? new Path(args[0]).resolve() : null;

  assert.type(
    inputFile,
    types.Path,
    "'--input-file' must be specified as a path to a js file. It can alternatively be specified as the first positional argument."
  );

  let outputFile: Path =
    flags.outputFile || new Path(args[1] || "my_program").resolve();
  assert.type(
    outputFile,
    types.Path,
    "'--output-file' must be specified as a path to the output program file. If unspecified, it defaults to './my_program'. It can alternatively be specified as the second positional argument."
  );

  const quickjsRef: string = flags.quickjsRef || "main";
  assert.type(
    quickjsRef,
    types.string,
    "'--quickjs-ref' must be a string. If unspecified, it defaults to 'main'"
  );

  const help = flags.help || flags.h || false;

  return {
    mode,
    inputFile,
    outputFile,
    quickjsRef,
    help,
  };
}
