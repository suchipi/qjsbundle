#!/usr/bin/env yavascript
import { getOptions } from "./lib/get-options";
import { helpTarget } from "./targets/help-target";
import { cleanTarget } from "./targets/clean-target";
import { bundleTarget } from "./targets/bundle-target";

main();

function main() {
  const opts = getOptions();

  switch (opts.target) {
    case "help": {
      helpTarget();
      break;
    }
    case "clean": {
      cleanTarget();
      break;
    }
    case "bundle": {
      bundleTarget(opts);
      break;
    }
    default: {
      throw new Error(`Unhandled target: ${(opts as any).target}`);
    }
  }
}
