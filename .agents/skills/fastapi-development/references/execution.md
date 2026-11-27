# FastAPI execution and jobs

## Request execution

- Await nonblocking I/O from async handlers. For blocking libraries, use a synchronous handler or dependency where it fits, or offload explicitly with a capacity limit. FastAPI offloads sync handlers and dependencies it invokes. Direct calls to sync helpers inside an async handler run on the event loop.
- Budget downstream calls, outstanding work, and the shared thread limiter together. Give pooled clients explicit timeouts and keep retries bounded and safe for the operation. A timeout on the awaiter can leave a thread, subprocess, or device task running. Define what actually stops work and releases its resources.
- For streaming, bound buffering and handle disconnects. Give the stream explicit ownership of resources it needs and check [dependency teardown](application.md#settings-and-dependencies). Define how the stream signals failure once HTTP headers are sent.

[FastAPI async execution](https://fastapi.tiangolo.com/async/) · [Starlette thread pool](https://starlette.dev/threadpool/) · [Python future cancellation](https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.Future.cancel)

## Background and compute work

- Use `BackgroundTasks` for small in-process work when loss during restart is acceptable. Use a durable execution backend when work needs reliable completion, retry, or restart recovery. Pass stable IDs and validated inputs to jobs. Reopen required resources in the worker and make failure, retries, and duplicate delivery observable.
- Keep API admission and latency within the serving budget. Size compute separately for its allocated CPU, memory, and accelerators. Choose threads, processes, or an external worker based on whether the work blocks on I/O, runs CPU-bound Python, or executes in native code or on a device. Account for native library threads, process count, and shared device capacity together.
- Assign model weights, warmup, and device handles to their serving or compute owner. Account for model memory in each process. Avoid sharing initialized accelerator state across a fork unless the runtime explicitly supports it. A process-local semaphore only limits that process. Bound decoding, scratch space, subprocesses, and outputs to match workload and capacity.
- Exercise failure modes relevant to the changed execution path, such as disconnect cleanup, queue saturation, duplicate delivery, or timeout. Routine API tests can fake expensive calls. Claims about model loading, runtime behavior, or performance need representative runtime evidence.

[FastAPI background tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
