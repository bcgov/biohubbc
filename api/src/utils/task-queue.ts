import fastq, { asyncWorker } from 'fastq';
import { getLogger } from './logger';

const defaultLog = getLogger('TaskQueue');

export type QueueResult<TaskType, WorkerResultType> =
  | {
      task: TaskType;
      value: WorkerResultType;
      error?: never;
    }
  | {
      task: TaskType;
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
 *    const results = Promise.all(tasks)
 *  }
 *
 * @template TaskType - The type of the tasks to process via `asyncWorker`
 * @template WorkerResultType - The type of the resolved value from `asyncWorker`
 * @param {TaskType[]} tasks - The tasks to process
 * @param {asyncWorker<unknown, TaskType, WorkerResultType>} asyncWorker - The worker function that processes each task
 * @param {number} concurrently - The number of tasks to process concurrently
 * @returns {Promise<QueueResult<TaskType, WorkerResultType>[]>}
 */
export const taskQueue = async <TaskType, WorkerResultType>(
  tasks: TaskType[],
  asyncWorker: asyncWorker<unknown, TaskType, WorkerResultType>,
  concurrently: number
): Promise<QueueResult<TaskType, WorkerResultType>[]> => {
  const start = performance.now();
  const results: QueueResult<TaskType, WorkerResultType>[] = []; // The resolved values are pushed into this array

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
