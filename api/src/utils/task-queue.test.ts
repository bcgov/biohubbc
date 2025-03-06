import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import { taskQueue } from './task-queue';

describe('taskQueue', () => {
  it('should process tasks and return results', async () => {
    const asyncWorker = sinon.stub();

    asyncWorker.onCall(0).resolves(1);
    asyncWorker.onCall(1).resolves(2);

    const results = await taskQueue([1, 2], asyncWorker, 2);

    expect(asyncWorker.getCall(0)).to.have.been.calledWith(1);
    expect(asyncWorker.getCall(1)).to.have.been.calledWith(2);

    expect(results).to.deep.equal([
      { task: 1, value: 1 },
      { task: 2, value: 2 }
    ]);
  });

  it('should process tasks and return errors', async () => {
    const asyncWorker = sinon.stub();

    asyncWorker.onCall(0).resolves(1);
    asyncWorker.onCall(1).rejects(new Error('Test Error'));

    const results = await taskQueue([1, 2], asyncWorker, 2);

    expect(asyncWorker.getCall(0)).to.have.been.calledWith(1);
    expect(asyncWorker.getCall(1)).to.have.been.calledWith(2);

    expect(results).to.deep.equal([
      { task: 1, value: 1 },
      { task: 2, error: new Error('Test Error') }
    ]);
  });

  it('should process tasks concurrently and complete in less than 200ms', async () => {
    const asyncWorker = sinon.stub();

    asyncWorker.onCall(0).callsFake(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 1;
    });

    asyncWorker.onCall(1).callsFake(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 2;
    });

    const start = performance.now();
    await taskQueue([1, 2], asyncWorker, 2);
    const elapsed = performance.now() - start;

    expect(elapsed).to.be.lessThan(200);
  });
});
