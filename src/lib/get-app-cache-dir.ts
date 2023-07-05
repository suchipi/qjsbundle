import { getOsCacheDir } from "./get-os-cache-dir";

export function getAppCacheDir(): Path {
  const cacheDir = getOsCacheDir();
  const qjsbundleCacheDir = cacheDir.concat("qjsbundle");
  return qjsbundleCacheDir;
}
