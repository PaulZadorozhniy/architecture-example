export default function promiseSerial(tasks) {
  return tasks.reduce(
    (promiseChain, currentTask) =>
      promiseChain.then(chainResults =>
        currentTask().then(currentResult => [...chainResults, currentResult])
      ),
    Promise.resolve([])
  );
}
