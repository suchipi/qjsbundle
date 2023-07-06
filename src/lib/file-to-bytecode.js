// this gets run by the cloned quickjs, NOT by the host yavascript or quickjs
import * as std from "quickjs:std";
import * as os from "quickjs:os";
import * as bc from "quickjs:bytecode";

const [_quickjsRun, _fileToBytecode, inputFile, outputFile] = scriptArgs;

if (!inputFile) {
  console.error("Please specify an input file (argv[2])");
  std.exit(1);
}
if (!outputFile) {
  console.error("Please specify an output file (argv[3])");
  std.exit(1);
}

const bytecode = bc.fromFile(inputFile);

const fd = os.open(outputFile, os.O_WRONLY | os.O_BINARY | os.O_CREAT);
const writtenBytes = os.write(fd, bytecode, 0, bytecode.byteLength);
os.close(fd);

console.log(`Wrote ${writtenBytes} bytes to ${outputFile}`);
