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

  function getInputOutputFiles() {
    const inputFile: Path | null =
      flags.inputFile || args[0] ? new Path(args[0]).resolve() : null;

    const outputFile: Path | null =
      flags.outputFile || args[1] ? new Path(args[1]).resolve() : null;

    if (
      inputFile != null &&
      outputFile != null &&
      inputFile.toString() === outputFile.toString()
    ) {
      throw new Error(
        `The input and output file cannot be the same: ${inputFile.toString()}`
      );
    }

    return { inputFile, outputFile };
  }

  if (flags.archive) {
    const { inputFile, outputFile } = getInputOutputFiles();
    if (inputFile == null) {
      console.error("ERROR: Input file pattern must be specified\n");
      return { target: "help", mistake: true };
    }

    if (outputFile == null) {
      console.error("ERROR: Output file pattern must be specified\n");
      return { target: "help", mistake: true };
    }

    const additionalFilesDir: Path | null = flags.additionalFilesDir || null;

    return {
      target: "archive",
      inputFile,
      outputFile,
      additionalFilesDir,
    };
  }

  // everything past here is bundle target

  const mode = flags.mode || "debug";
  assert.type(
    mode,
    types.or(types.exactString("debug"), types.exactString("release")),
    "'--mode' must be either 'debug' or 'release'"
  );

  let { inputFile, outputFile } = getInputOutputFiles();

  if (inputFile == null) {
    console.error("ERROR: Input file must be specified\n");
    return { target: "help", mistake: true };
  }

  if (!exists(inputFile)) {
    throw new Error(
      `Cannot use the provided file as an input file, because it does not exist: ${inputFile.toString()}`
    );
  }

  outputFile =
    outputFile ||
    new Path(
      mode === "debug" ? "my_program" : "my_program-[PLATFORM]"
    ).resolve();

  const quickjsRef: string = flags.quickjsRef || "main";

  return {
    target: "bundle",
    mode,
    inputFile,
    outputFile,
    quickjsRef,
  };
}
