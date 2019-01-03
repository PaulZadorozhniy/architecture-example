export default function terminateProcess(exitCode) {
  setTimeout(() => process.exit(exitCode), 20);
};
