```javascript
import * as client from 'react-dom/client';

const containerDomElement = document.createElement('div');
const root = client.createRoot(containerDomElement);
root.render(reactElem);
```

```javascript
//////////////////////////////////////////
// react-dom/src/client/ReactDOMRoot,js //
//////////////////////////////////////////

export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  const root = createContainer(container, options);
  markContainerAsRoot(root.current, container);
  Dispatcher.current = ReactDOMClientDispatcher;
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(root);
}

function ReactDOMRoot(internalRoot: FiberRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render =
  function (children: ReactNodeList): void {
    const root = this._internalRoot;
    if (root === null) {
      throw new Error('Cannot update an unmounted root.');
    }
    // react-reconciler/src/ReactFiberReconciler
    updateContainer(children, root, null, null);
  };

///////////////////////////////////////////////
// react-reconciler/src/ReactFiberReconciler //
///////////////////////////////////////////////

export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>
): Lane {
  const current = container.current;
  const lane = requestUpdateLane(current);

  const update = createUpdate(lane);
  update.payload = {element};
  /* update =
    {
      lane: 32,
      tag: 0,
      payload: {
        element: {
          '$$typeof': Symbol(react.element),
          type: [Function: App],
          key: null,
          ref: null,
          props: {},
          _owner: null,
          _store: {}
        }
      },
      callback: null,
      next: null
    }
  */
  const root = enqueueUpdate(current /* host root*/, update, lane);
  if (root !== null) {
    scheduleUpdateOnFiber(root, current, lane);
    entangleTransitions(root, current, lane);
  }
  return lane;
}

/////////////////////////////////////////////////////
// react-reconciler/src/ReactFiberClassUpdateQueue //
/////////////////////////////////////////////////////

type Update<State> = {
  lane: Lane,
  tag: 0 | 1 | 2 | 3,
  payload: any,
  callback: (() => mixed) | null,
  next: Update<State> | null,
};

type UpdateQueue<State> = {
  baseState: State,
  firstBaseUpdate: Update<State> | null,
  lastBaseUpdate: Update<State> | null,
  shared: SharedQueue<State>,
  callbacks: Array<() => mixed> | null,
};

type SharedQueue<State> = {
  pending: Update<State> | null,
  lanes: Lanes,
  hiddenCallbacks: Array<() => mixed> | null,
};

export function enqueueUpdate<State>(
  fiber: Fiber,
  update: Update<State>,
  lane: Lane,
): FiberRoot | null {
  const updateQueue = fiber.updateQueue;
  const sharedQueue: SharedQueue<State> = updateQueue.shared;
  if (isUnsafeClassRenderPhaseUpdate(fiber)) {
    // ???
  } else {
    return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
  }
}
```

```javascript
//////////////////////////////////////////////////////
// react-reconciler/src/ReactFiberConcurrentUpdates //
//////////////////////////////////////////////////////

type ConcurrentUpdate = {
  next: ConcurrentUpdate,
  lane: Lane,
};

type ConcurrentQueue = {
  pending: ConcurrentUpdate | null,
};

const concurrentQueues: Array<any> = [];
let concurrentQueuesIndex = 0;
let concurrentlyUpdatedLanes: Lanes = NoLanes;

export function enqueueConcurrentClassUpdate<State>(
  fiber: Fiber,
  queue: SharedQueue<State>,
  update: Update<State>,
  lane: Lane,
): FiberRoot | null {
  const concurrentQueue: ConcurrentQueue = (queue: any);
  const concurrentUpdate: ConcurrentUpdate = (update: any);
  enqueueUpdate(fiber, concurrentQueue, concurrentUpdate, lane);
  return getRootForUpdatedFiber(fiber);
}

function enqueueUpdate(
  fiber: Fiber,
  queue: ConcurrentQueue | null,
  update: ConcurrentUpdate | null,
  lane: Lane,
) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;

  concurrentlyUpdatedLanes = mergeLanes(concurrentlyUpdatedLanes, lane);

  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate;
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
}
```

```javascript
////////////////////////
// ReactFiberWorkLoop //
////////////////////////

// !!! Initial Render Path !!! //

// workInProgressRoot === null
export function scheduleUpdateOnFiber(
  root: FiberRoot,
  fiber: Fiber,
  lane: Lane,
) {
  markRootUpdated(root, lane);
  ensureRootIsScheduled(root);    
}

// ReactFiberRootScheduler
// mightHavePendingSyncWork = false
// didScheduleMicrotask = false
// firstScheduledRoot = null
// lastScheduledRoot = null
export function ensureRootIsScheduled(root: FiberRoot): void {
  mightHavePendingSyncWork = true;
  firstScheduledRoot = lastScheduledRoot = root;
  if (!didScheduleMicrotask) {
    didScheduleMicrotask = true;
    queueMicrotask(processRootScheduleInMicrotask);
  }
}

function processRootScheduleInMicrotask() {
  didScheduleMicrotask = false;
  // We'll recompute this as we iterate through all the roots and schedule them.
  mightHavePendingSyncWork = false;

  const currentTime = now();

  let prev = null;
  let root = firstScheduledRoot;
  const next = root.next;

  if (
    currentEventTransitionLane !== NoLane &&
    shouldAttemptEagerTransition()
  ) {
    markRootEntangled(root, mergeLanes(currentEventTransitionLane, SyncLane));
  }

  const nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
  if (nextLanes === NoLane) {
    // This root has no more pending work. Remove it from the schedule. To
    // guard against subtle reentrancy bugs, this microtask is the only place
    // we do this — you can add roots to the schedule whenever, but you can
    // only remove them here.

    // Null this out so we know it's been removed from the schedule.
    root.next = null;
    if (prev === null) {
      // This is the new head of the list
      firstScheduledRoot = next;
    } else {
      prev.next = next;
    }
    if (next === null) {
      // This is the new tail of the list
      lastScheduledRoot = prev;
    }
  } else {
    // This root still has work. Keep it in the list.
    prev = root;
    if (includesSyncLane(nextLanes)) {
      mightHavePendingSyncWork = true;
    }
  }
  root = next;


  currentEventTransitionLane = NoLane;

  flushSyncWorkOnAllRoots();
}

export function performConcurrentWorkOnRoot(
  root: FiberRoot,
  didTimeout: boolean,
): RenderTaskFn | null {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    throw new Error('Should not already be working.');
  }
  // Determine the next lanes to work on, using the fields stored
  // on the root.
  // TODO: This was already computed in the caller. Pass it as an argument.
  let lanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
  );

  // We disable time-slicing in some cases: if the work has been CPU-bound
  // for too long ("expired" work, to prevent starvation), or we're in
  // sync-updates-by-default mode.
  // TODO: We only check `didTimeout` defensively, to account for a Scheduler
  // bug we're still investigating. Once the bug in Scheduler is fixed,
  // we can remove this, since we track expiration ourselves.
  const shouldTimeSlice =
    !includesBlockingLane(root, lanes) &&
    !includesExpiredLane(root, lanes) &&
    (disableSchedulerTimeoutInWorkLoop || !didTimeout);
  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes);
  
  if (exitStatus !== RootInProgress) {
    if (exitStatus === RootErrored) {
      // If something threw an error, try rendering one more time. We'll
      // render synchronously to block concurrent data mutations, and we'll
      // includes all pending updates are included. If it still fails after
      // the second attempt, we'll give up and commit the resulting tree.
      const originallyAttemptedLanes = lanes;
      const errorRetryLanes = getLanesToRetrySynchronouslyOnError(
        root,
        originallyAttemptedLanes,
      );
      if (errorRetryLanes !== NoLanes) {
        lanes = errorRetryLanes;
        exitStatus = recoverFromConcurrentError(
          root,
          originallyAttemptedLanes,
          errorRetryLanes,
        );
      }
    }
    if (exitStatus === RootFatalErrored) {
      const fatalError = workInProgressRootFatalError;
      prepareFreshStack(root, NoLanes);
      markRootSuspended(root, lanes);
      ensureRootIsScheduled(root);
      throw fatalError;
    }

    if (exitStatus === RootDidNotComplete) {
      // The render unwound without completing the tree. This happens in special
      // cases where need to exit the current render without producing a
      // consistent tree or committing.
      markRootSuspended(root, lanes);
    } else {
      // The render completed.

      // Check if this render may have yielded to a concurrent event, and if so,
      // confirm that any newly rendered stores are consistent.
      // TODO: It's possible that even a concurrent render may never have yielded
      // to the main thread, if it was fast enough, or if it expired. We could
      // skip the consistency check in that case, too.
      const renderWasConcurrent = !includesBlockingLane(root, lanes);
      const finishedWork: Fiber = (root.current.alternate: any);
      if (
        renderWasConcurrent &&
        !isRenderConsistentWithExternalStores(finishedWork)
      ) {
        // A store was mutated in an interleaved event. Render again,
        // synchronously, to block further mutations.
        exitStatus = renderRootSync(root, lanes);

        // We need to check again if something threw
        if (exitStatus === RootErrored) {
          const originallyAttemptedLanes = lanes;
          const errorRetryLanes = getLanesToRetrySynchronouslyOnError(
            root,
            originallyAttemptedLanes,
          );
          if (errorRetryLanes !== NoLanes) {
            lanes = errorRetryLanes;
            exitStatus = recoverFromConcurrentError(
              root,
              originallyAttemptedLanes,
              errorRetryLanes,
            );
            // We assume the tree is now consistent because we didn't yield to any
            // concurrent events.
          }
        }
        if (exitStatus === RootFatalErrored) {
          const fatalError = workInProgressRootFatalError;
          prepareFreshStack(root, NoLanes);
          markRootSuspended(root, lanes);
          ensureRootIsScheduled(root);
          throw fatalError;
        }

        // FIXME: Need to check for RootDidNotComplete again. The factoring here
        // isn't ideal.
      }

      // We now have a consistent tree. The next step is either to commit it,
      // or, if something suspended, wait to commit it after a timeout.
      root.finishedWork = finishedWork;
      root.finishedLanes = lanes;
      finishConcurrentRender(root, exitStatus, finishedWork, lanes);
    }
  }

  ensureRootIsScheduled(root);
  return getContinuationForRoot(root, originalCallbackNode);
}
```