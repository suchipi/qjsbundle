import * as std from "quickjs:std";

export function helpTarget(opts: { mistake: boolean }) {
  echo(String.dedent`
    ${inverse(
      bold(blue("qjsbundle"))
    )} - create a qjsbootstrap-based binary from a .js file

      --input-file (or first positional arg): path to the .js file to bundle

      --output-file (or second positional arg): path to create the program binary at

      --mode: 'debug' or 'release'
      
        method used to create the binaries.
        'debug' only builds binaries for the current platform (depends on node.js and ninja), and includes the full JS source string in the binary for debugging purposes.
        'release' builds binaries for multiple platforms (depends on docker), and compiles the JS source string to bytecode to make smaller binaries (at the expense of error stack trace information).
        
        defaults to 'debug'.

      --quickjs-ref: what commit/branch/whatever of github.com/suchipi/quickjs to use. defaults to 'main'

      --clean: remove this program's cached files (namely, a local copy of the quickjs repo)

      --help or -h: show this help text
  `);

  if (opts.mistake) {
    std.exit(2);
  } else {
    std.exit(0);
  }
}
