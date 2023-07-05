import * as os from "quickjs:os";

export function getCacheDir(): Path {
  switch (os.platform) {
    case "win32": {
      const LOCALAPPDATA = env.LOCALAPPDATA;
      assert.type(
        LOCALAPPDATA,
        types.string,
        "'LOCALAPPDATA' env var needs to be defined (so we can clone quickjs into caches dir)"
      );

      return new Path(LOCALAPPDATA);
    }

    case "darwin": {
      const HOME = env.HOME;
      assert.type(
        HOME,
        types.string,
        "'HOME' env var needs to be defined (so we can clone quickjs into caches dir)"
      );

      return new Path(HOME, "Library", "Caches");
    }

    default: {
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
}
