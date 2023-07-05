#!/usr/bin/env yavascript
import * as std from "quickjs:std";
import { getOptions } from "./lib/get-options";
import { prepareQuickjsRepo } from "./lib/prepare-quickjs-repo";
import { nativeMode } from "./modes/native";
import { dockerMode } from "./modes/docker";
import { getAppCacheDir } from "./lib/get-app-cache-dir";

main();

function main() {
  const opts = getOptions();

  switch (opts.target) {
    case "help": {
      echo(String.dedent`
      qjsbundle - create a qjsbootstrap-based binary from a .js file

      --mode: 'native' or 'docker'. native only builds binaries for the current platform, docker builds binaries for multiple platforms. defaults to native.
      --script (or first positional arg): the .js file to bundle
      --name: name of the program file to create. defaults to 'my_program'
      --quickjs-ref: what commit/branch/whatever of github/suchipi/quickjs to use. defaults to 'main'
      --help or -h: show this help text
    `);

      std.exit(2);
      break; // never reached, but makes typescript happy
    }
    case "clean": {
      const qjsbundleCacheDir = getAppCacheDir();
      console.log("removing dir:", qjsbundleCacheDir.toString());
      remove(qjsbundleCacheDir);
      break;
    }
    case "bundle": {
      const quickjsRepoDir = prepareQuickjsRepo(opts.quickjsRef);

      if (opts.mode === "native") {
        nativeMode({
          quickjsRepoDir,
          inputFile: opts.inputFile,
          outputFile: opts.outputFile,
        });
      } else if (opts.mode === "docker") {
        dockerMode({
          quickjsRepoDir,
          inputFile: opts.inputFile,
          outputFile: opts.outputFile,
        });
      } else {
        throw new Error(`Invalid mode: ${opts.mode}`);
      }
      break;
    }
    default: {
      throw new Error(`Unhandled target: ${(opts as any).target}`);
    }
  }
}
