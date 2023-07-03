import { getCacheDir } from "./get-cache-dir";

/** returns quickjs repo dir */
export function prepareQuickjsRepo(ref: string): Path {
  const cacheDir = getCacheDir();
  const qjsbundleCacheDir = cacheDir.concat("qjsbundle");
  console.log("using cache dir:", qjsbundleCacheDir.toString());

  ensureDir(qjsbundleCacheDir);

  const quickjsRepoDir = qjsbundleCacheDir.concat("quickjs");
  if (!isDir(quickjsRepoDir)) {
    exec("git clone https://github.com/suchipi/quickjs.git", {
      cwd: dirname(quickjsRepoDir),
    });
  }

  // TODO (in yavascript): cwd should accept Path
  exec("git fetch origin", { cwd: quickjsRepoDir.toString() });
  exec(["git", "checkout", ref], { cwd: quickjsRepoDir.toString() });

  return quickjsRepoDir;
}
