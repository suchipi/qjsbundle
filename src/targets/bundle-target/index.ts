#!/usr/bin/env yavascript
import { Options } from "../../lib/get-options";
import { prepareQuickjsRepo } from "../../lib/prepare-quickjs-repo";
import { debugMode } from "./debug";
import { releaseMode } from "./release";

export function bundleTarget(opts: Options & { target: "bundle" }) {
  const quickjsRepoDir = prepareQuickjsRepo(opts.quickjsRef);

  if (opts.mode === "debug") {
    debugMode({
      quickjsRepoDir,
      inputFile: opts.inputFile,
      outputFile: opts.outputFile,
    });
  } else if (opts.mode === "release") {
    releaseMode({
      quickjsRepoDir,
      inputFile: opts.inputFile,
      outputFile: opts.outputFile,
    });
  } else {
    throw new Error(`Invalid mode: ${opts.mode}`);
  }
}
