import { getAppCacheDir } from "../lib/get-app-cache-dir";

export function cleanTarget() {
  const qjsbundleCacheDir = getAppCacheDir();
  console.log("removing dir:", qjsbundleCacheDir.toString());
  remove(qjsbundleCacheDir);
}
