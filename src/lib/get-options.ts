export type Options =
  | {
      target: "help";
      mistake: boolean;
    }
  | {
      target: "clean";
    }
  | {
      target: "bundle";
      mode: "debug" | "release";
      inputFile: Path;
      outputFile: Path;
      quickjsRef: string;
    }
  | {
      target: "archive";
      inputFile: Path; // binary pattern with [PLATFORM]
      outputFile: Path; // archive pattern with [PLATFORM]
      additionalFilesDir: Path | null;
    };

export function getOptions(): Options {
  const { flags, args } = parseScriptArgs({
    mode: string,
    inputFile: Path,
    outputFile: Path,
    quickjsRef: string,
    help: boolean,
    h: boolean,
    clean: boolean,
    archive: boolean,
    additionalFilesDir: Path,
  });

  if (flags.help || flags.h) {
    return { target: "help", mistake: false };
  }

  if (flags.clean) {
    return { target: "clean" };
  }

  const mode = flags.mode || "debug";
  assert.type(
    mode,
    types.or(types.exactString("debug"), types.exactString("release")),
    "'--mode' must be either 'debug' or 'release'"
  );

  let inputFile: Path | null =
    flags.inputFile || args[0] ? new Path(args[0]).resolve() : null;

  if (inputFile == null) {
    console.error("ERROR: Input file must be specified\n");
    return { target: "help", mistake: true };
  }

  assert.type(
    inputFile,
    Path,
    "'--input-file' must be specified as a path to a js file. It can alternatively be specified as the first positional argument."
  );

  if (!flags.archive && !exists(inputFile)) {
    throw new Error(
      `Cannot use the provided file as an input file, because it does not exist: ${inputFile.toString()}`
    );
  }

  let outputFile: Path =
    flags.outputFile ||
    new Path(
      args[1] || (mode === "debug" ? "my_program" : "my_program-[PLATFORM]")
    ).resolve();

  assert.type(
    outputFile,
    Path,
    "'--output-file' must be specified as a path to the output program file. If unspecified, it defaults to './my_program'. It can alternatively be specified as the second positional argument."
  );

  if (inputFile.toString() === outputFile.toString()) {
    throw new Error(
      `The input and output file cannot be the same: ${inputFile.toString()}`
    );
  }

  if (flags.archive) {
    const additionalFilesDir: Path | null = flags.additionalFilesDir || null;

    return {
      target: "archive",
      inputFile,
      outputFile,
      additionalFilesDir,
    };
  }

  const quickjsRef: string = flags.quickjsRef || "main";
  assert.type(
    quickjsRef,
    string,
    "'--quickjs-ref' must be a string. If unspecified, it defaults to 'main'"
  );

  return {
    target: "bundle",
    mode,
    inputFile,
    outputFile,
    quickjsRef,
  };
}
