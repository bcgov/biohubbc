import fastq, { asyncWorker } from 'fastq';
import { getLogger } from './logger';

const defaultLog = getLogger('concurrentTaskQueue');

type QueueResult<T, J> =
  | {
      task: T;
      value: J;
      error?: never;
    }
  | {
      task: T;
      value?: never;
      error: Error;
    };

/**
 * Process a list of tasks by queueing them and resolving them in parallel concurrently.
 *
 * Conceptually equivalent to:
 * @example
 *  const taskArrays = [[promiseA, promiseB], [promiseC, promiseD]];
 *  for (const tasks of taskArrays) {
 *    const results = Promise.all(task)
 *  }
 *
 * Notes:
 *  - Both `for` loops are required. The first loop pushes tasks into the queue,
 *    and the second loop waits for each task to resolve. Once a value is pushed
 *    into the `taskPromises` array, it will immediately begin resolving.
 *
 * @template T - The type of the tasks to process via `asyncWorker`
 * @template J - The type of the resolved value from `asyncWorker`
 * @param {T[]} tasks - The tasks to process
 * @param {asyncWorker<unknown, T, J>} asyncWorker - The worker function that processes each task
 * @param {number} concurrently - The number of tasks to process concurrently
 * @returns {Promise<QueueResult<T,J>[]>}
 */
export const taskQueue = async <T, J>(
  tasks: T[],
  asyncWorker: asyncWorker<unknown, T, J>,
  concurrently: number
): Promise<QueueResult<T, J>[]> => {
  const start = performance.now();

  const queue = fastq.promise(asyncWorker, concurrently);

  const taskPromises: { task: T; promise: Promise<J> }[] = []; // Values pushed into this array immediately begin resolving
  const results: QueueResult<T, J>[] = []; // The resolved values are pushed into this array

  // Queue the tasks
  for (const task of tasks) {
    // 1. Push each task into the queue
    const promise = queue.push(task);

    // 2. Push push promise into the taskPromises array
    taskPromises.push({ task, promise }); // will begin resolving
  }

  // Resolve the queued tasks
  for (const resolvable of taskPromises) {
    try {
      // 3. Wait for each promise to resolve
      const value = await resolvable.promise; // pseudo await - promises will already be resolving

      results.push({ task: resolvable.task, value });
    } catch (error: any) {
      results.push({ task: resolvable.task, error });
    }
  }

  // 4. Wait for the queue to drain for any remaining tasks
  await queue.drain();

  defaultLog.info({
    message: `Completed ${tasks.length} tasks in ${((performance.now() - start) / 1000).toFixed(3)}s.`
  });

  return results;
};
