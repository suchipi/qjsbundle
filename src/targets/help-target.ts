import * as std from "quickjs:std";

export function helpTarget() {
  echo(String.dedent`
    ${inverse(
      bold(blue("qjsbundle"))
    )} - create a qjsbootstrap-based binary from a .js file

      --input-file (or first positional arg): path to the .js file to bundle

      --output-file (or second positional arg): path to create the program binary at

      --mode: 'native' or 'docker'
      
        method used to create the binaries.
        'native' only builds binaries for the current platform (depends on node.js and ninja).
        'docker' builds binaries for multiple platforms (depends on docker).
        
        defaults to 'native'.

      --quickjs-ref: what commit/branch/whatever of github.com/suchipi/quickjs to use. defaults to 'main'

      --clean: remove this program's cached files (namely, a local copy of the quickjs repo)

      --help or -h: show this help text
  `);

  std.exit(2);
}
