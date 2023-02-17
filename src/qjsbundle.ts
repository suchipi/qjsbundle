#!/usr/bin/env yavascript
import * as std from "quickjs:std";

type Options = {
  mode: "native" | "docker";
  script: string;
  out: string;
  quickjsRef: string;
  help: boolean;
  // TODO: bytecode option
};

main();

function main() {
  if (yavascript.version !== "0.0.8") {
    console.warn(
      `This script is intended for yavascript 0.0.8, but the current yavascript version is '${yavascript.version}'. This might not work correctly.`
    );
  }

  const opts = getOptions();
  if (opts.help) {
    echo(String.dedent`
      qjsbundle - create a qjsbootstrap-based binary from a .js file

      --mode: 'native' or 'docker'. native only builds binaries for the current platform, docker builds binaries for multiple platforms. defaults to native.
      --script (or first positional arg): the .js file to bundle
      --name: name of the program file to create. defaults to 'my_program'
      --quickjs-ref: what commit/branch/whatever of github/suchipi/quickjs to use. defaults to 'main'
      --help or -h: show this help text
    `);

    std.exit(2);
  }

  const cacheDir = getCacheDir();
  const qjsbundleCacheDir = Path.join(cacheDir, "qjsbundle");
  console.log("using cache dir:", qjsbundleCacheDir);

  // TODO ensuredir not working properly?
  ensureDir(qjsbundleCacheDir);

  const quickjsRepoDir = Path.join(qjsbundleCacheDir, "quickjs");

  if (!isDir(quickjsRepoDir)) {
    exec("git clone https://github.com/suchipi/quickjs.git", {
      cwd: dirname(quickjsRepoDir),
      // TODO exec type is wrong; these are optional
      failOnNonZeroStatus: true,
      captureOutput: false,
    });
  }

  const dirBefore = pwd();
  cd(quickjsRepoDir);

  exec("git fetch origin");
  exec(["git", "checkout", opts.quickjsRef]);

  if (opts.mode === "native") {
    exec("meta/build.sh");

    cd(dirBefore);

    const qjsBootstrapPath = Path.join(
      quickjsRepoDir,
      "build/bin/qjsbootstrap"
    );

    if (exists(opts.out)) {
      remove(opts.out);
    }

    const outFile = std.open(opts.out, "w");
    pipe({ path: qjsBootstrapPath }, outFile);
    pipe({ path: opts.script }, outFile);

    console.log(`Program written to: ${outFile}`);
  } else if (opts.mode === "docker") {
    throw new Error("docker mode not yet implemented");
  } else {
    throw new Error(`Invalid mode: ${opts.mode}`);
  }
}

function getOptions(): Options {
  const { flags, args } = parseScriptArgs({
    mode: string,
    script: parseScriptArgs.Path,
    name: string,
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

  let script: string = flags.script || args[0];
  assert.type(
    script,
    types.string,
    "'--script' must be specified as a path to a js file. It can also be specified as the first positional argument."
  );
  script = Path.resolve(script);

  let out: string = flags.out || args[1] || "my_program";
  assert.type(
    out,
    types.string,
    "'--out' must be a string. If unspecified, it defaults to 'my_program'. It can also be specified as the second positional argument."
  );
  out = Path.resolve(out);

  const quickjsRef: string = flags.quickjsRef || "main";
  assert.type(
    quickjsRef,
    types.string,
    "'--quickjs-ref' must be a string. If unspecified, it defaults to 'main'"
  );

  const help = flags.help || flags.h || false;

  return {
    mode,
    script,
    out,
    quickjsRef,
    help,
  };
}

function getCacheDir() {
  let kernelName: string;
  try {
    kernelName = $("uname").stdout.trim();
  } catch (err) {
    kernelName = "linux";
  }

  if (kernelName === "Darwin") {
    const HOME = env.HOME;
    assert.type(
      HOME,
      types.string,
      "'HOME' env var needs to be defined (so we can clone quickjs into caches dir)"
    );

    return Path.join(HOME, "Library", "Caches");
  } else {
    let cacheDir = env.XDG_CACHE_HOME;
    if (!cacheDir) {
      const HOME = env.HOME;
      assert.type(
        HOME,
        types.string,
        "'HOME' or 'XDG_CACHE_HOME' env var needs to be defined (so we can clone quickjs into caches dir)"
      );

      cacheDir = Path.join(HOME, ".cache");
    }

    return cacheDir;
  }
}
