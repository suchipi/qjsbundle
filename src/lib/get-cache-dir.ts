export function getCacheDir(): Path {
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

    return new Path(HOME, "Library", "Caches");
  } else {
    let cacheDir = env.XDG_CACHE_HOME ? new Path(env.XDG_CACHE_HOME) : null;
    if (!cacheDir) {
      const HOME = env.HOME;
      assert.type(
        HOME,
        types.string,
        "'HOME' or 'XDG_CACHE_HOME' env var needs to be defined (so we can clone quickjs into caches dir)"
      );

      cacheDir = new Path(HOME, ".cache");
    }

    return cacheDir;
  }
}
