import fastq, { asyncWorker } from 'fastq';
import { getLogger } from './logger';

const defaultLog = getLogger('TaskQueue');

export type QueueResult<T, J> =
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
  const results: QueueResult<T, J>[] = []; // The resolved values are pushed into this array

  const queue = fastq.promise(asyncWorker, concurrently);

  // 1. Queue the tasks
  for (const task of tasks) {
    // 2. Push each task into the queue and handle the resolved value or error
    queue
      .push(task)
      .then((value) => results.push({ task, value }))
      .catch((error) => results.push({ task, error })); // Catch errors and push into results
  }

  // 4. Wait for the queue to drain (all tasks to complete)
  // WARNING: Use `queue.drainED()` not `queue.drain()`.
  // The latter will not wait for the tasks to complete.
  await queue.drained();

  defaultLog.info({
    message: `Completed ${tasks.length} tasks in ${((performance.now() - start) / 1000).toFixed(3)}s.`
  });

  return results;
};
