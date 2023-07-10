export type Options =
  | {
      target: "help";
    }
  | {
      target: "clean";
    }
  | {
      target: "bundle";
      mode: "native" | "docker";
      inputFile: Path;
      outputFile: Path;
      quickjsRef: string;
      bytecode: boolean;
    };

export function getOptions(): Options {
  const { flags, args } = parseScriptArgs({
    mode: string,
    inputFile: Path,
    outputFile: string,
    quickjsRef: string,
    help: boolean,
    h: boolean,
    clean: boolean,
    bytecode: boolean,
  });

  if (flags.help || flags.h) {
    return { target: "help" };
  }

  if (flags.clean) {
    return { target: "clean" };
  }

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
    Path,
    "'--input-file' must be specified as a path to a js file. It can alternatively be specified as the first positional argument."
  );

  let outputFile: Path =
    flags.outputFile ||
    new Path(
      args[1] || (mode === "native" ? "my_program" : "my_program-[PLATFORM]")
    ).resolve();
  assert.type(
    outputFile,
    Path,
    "'--output-file' must be specified as a path to the output program file. If unspecified, it defaults to './my_program'. It can alternatively be specified as the second positional argument."
  );

  const quickjsRef: string = flags.quickjsRef || "main";
  assert.type(
    quickjsRef,
    string,
    "'--quickjs-ref' must be a string. If unspecified, it defaults to 'main'"
  );

  const bytecode: string = flags.bytecode ?? true;
  assert.type(
    bytecode,
    boolean,
    "'--bytecode' must be a boolean. If unspecified, it defaults to true"
  );

  return {
    target: "bundle",
    mode,
    inputFile,
    outputFile,
    quickjsRef,
    bytecode,
  };
}
