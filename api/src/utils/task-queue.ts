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
  const results: QueueResult<TaskType, WorkerResultType>[] = [];
  const queue = fastq.promise(asyncWorker, concurrently);
  // Create promises that capture the result handling completion
  const taskPromises = tasks.map((task) =>
    queue
      .push(task)
      .then((value) => {
        results.push({ task, value });
      })
      .catch((error) => {
        results.push({ task, error });
      })
  );
  // Wait for ALL task promises to resolve (including result handling)
  await Promise.all(taskPromises);
  defaultLog.info({
    message: `Completed ${tasks.length} tasks in ${((performance.now() - start) / 1000).toFixed(3)}s.`
  });
  return results;
};
