/* eslint-disable no-console */
import { EventEmitter } from '../../event-emitter';
import { OctaveBandValues } from '../../transfer-objects/octave-bands';
import { AnalyzeRequestData, createAnalyzeRequest } from './analyze-request';
import {
  AnalyzeResponseData,
  AnalyzeResponseMessageBody,
} from './analyze-response';

type Results = {
  paramId: string;
  singleFigure: number;
  octaveBandValues?: OctaveBandValues;
}[];

interface AnalyzingQueue {
  analyzeFile(fileId: string, request: AnalyzeRequestData): Promise<Results>;
  removeTasksForFile(fileId: string): void;
}

type Task = {
  forFileId: string;
  request: AnalyzeRequestData;
  transactionId: number;
};

type QueueWorker = {
  webWorker: Worker;
  busy: boolean;
};

export function analyzingQueue(): AnalyzingQueue {
  const maxWorkerCount = window.navigator.hardwareConcurrency;

  let nextTransactionId = 0;

  const workers: QueueWorker[] = [];

  let queuedTasks: Task[] = [];

  spawnWorker();

  const eventBus = new EventEmitter<{
    'analyze-response': {
      transactionId: number;
      payload: AnalyzeResponseData;
    };
  }>();

  function spawnWorker(): Worker {
    const webWorker = new Worker(
      new URL('./analyzing-worker.js', import.meta.url),
      {
        type: 'module',
      }
    );
    workers.push({
      webWorker,
      busy: false,
    });
    webWorker.addEventListener('message', onWorkerMessage);

    return webWorker;
  }

  function setWorkerAvailable(worker: Worker) {
    const queueWorker = workers.find(({ webWorker }) => webWorker === worker);

    if (queueWorker) {
      queueWorker.busy = false;
    }
  }

  function setWorkerBusy(worker: Worker) {
    const queueWorker = workers.find(({ webWorker }) => webWorker === worker);

    if (queueWorker) {
      queueWorker.busy = true;
    }
  }

  function onWorkerMessage(
    this: Worker,
    {
      data: { transactionId, payload },
    }: MessageEvent<AnalyzeResponseMessageBody>
  ) {
    eventBus.dispatchEvent('analyze-response', {
      transactionId,
      payload: {
        results: payload.results.map(r => ({
          ...r,
          octaveBandValues: r.octaveBandValues
            ? new OctaveBandValues(r.octaveBandValues)
            : undefined,
        })),
      },
    });

    const nextTask = queuedTasks.shift();

    if (nextTask) {
      processInWorker(this, nextTask.request, nextTask.transactionId);
    } else {
      setWorkerAvailable(this);
    }
  }

  function generateTransactionId() {
    // eslint-disable-next-line no-plusplus
    return nextTransactionId++;
  }

  function processInWorker(
    worker: Worker,
    request: AnalyzeRequestData,
    transactionId: number
  ) {
    const [message, transfer] = createAnalyzeRequest(request, transactionId);

    worker.postMessage(message, {
      transfer,
    });

    setWorkerBusy(worker);
  }

  function enqueueTask(
    forFileId: string,
    request: AnalyzeRequestData,
    transactionId: number
  ) {
    queuedTasks.push({
      forFileId,
      request,
      transactionId,
    });
  }

  function waitForResults(transactionId: number): Promise<Results> {
    return new Promise(resolve => {
      function listener({
        transactionId: receivedTransactionId,
        payload,
      }: {
        transactionId: number;
        payload: AnalyzeResponseData;
      }) {
        if (receivedTransactionId === transactionId) {
          eventBus.removeEventListener('analyze-response', listener);

          resolve(payload.results);
        }
      }

      eventBus.addEventListener('analyze-response', listener);
    });
  }

  function getAvailableWorker(): Worker | null {
    const notBusyQueueWorker = workers.find(({ busy }) => !busy);

    if (notBusyQueueWorker) {
      return notBusyQueueWorker.webWorker;
    }

    if (workers.length < maxWorkerCount) {
      return spawnWorker();
    }

    return null;
  }

  function processOrEnqueueRequest(
    fileId: string,
    request: AnalyzeRequestData
  ): number {
    const transactionId = generateTransactionId();

    if (queuedTasks.length > 0) {
      enqueueTask(fileId, request, transactionId);
      return transactionId;
    }

    const availableWorker = getAvailableWorker();

    if (availableWorker) {
      processInWorker(availableWorker, request, transactionId);
    } else {
      enqueueTask(fileId, request, transactionId);
    }

    return transactionId;
  }

  return {
    analyzeFile(fileId, request) {
      if (queuedTasks.find(v => v.forFileId === fileId)) {
        throw new Error(`a job for the file ${fileId} has already been queued`);
      }

      const transactionId = processOrEnqueueRequest(fileId, request);

      return waitForResults(transactionId);
    },
    removeTasksForFile(fileId: string) {
      queuedTasks = queuedTasks.filter(task => task.forFileId !== fileId);
    },
  };
}
