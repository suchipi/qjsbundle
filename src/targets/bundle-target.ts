#!/usr/bin/env yavascript
import { Options } from "../lib/get-options";
import { prepareQuickjsRepo } from "../lib/prepare-quickjs-repo";
import { nativeMode } from "../modes/native";
import { dockerMode } from "../modes/docker";

export function bundleTarget(opts: Options & { target: "bundle" }) {
  const quickjsRepoDir = prepareQuickjsRepo(opts.quickjsRef);

  if (opts.mode === "native") {
    nativeMode({
      quickjsRepoDir,
      inputFile: opts.inputFile,
      outputFile: opts.outputFile,
      useBytecode: opts.bytecode,
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
}
