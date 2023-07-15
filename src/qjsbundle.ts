#!/usr/bin/env yavascript
import { getOptions } from "./lib/get-options";
import { helpTarget } from "./targets/help-target";
import { cleanTarget } from "./targets/clean-target";
import { bundleTarget } from "./targets/bundle-target";
import { archiveTarget } from "./targets/archive-target";

main();

function main() {
  const opts = getOptions();

  switch (opts.target) {
    case "help": {
      helpTarget(opts);
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
    case "archive": {
      archiveTarget(opts);
      break;
    }
    default: {
      throw new Error(`Unhandled target: ${(opts as any).target}`);
    }
  }
}
