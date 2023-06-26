
* You may need kill watchman precess if it runs in background otherwise test will no be run.

* xxx

```
$ yarn config set watchman false
```

```
$ yarn config list
```

```
$ cat ~/.yarnrc
```

## Run tests

Single test module:
```
$ yarn test ./packages/matrixnorm/__tests__/useState-test.js
```

Single test from module:
```
$ yarn test ./packages/matrixnorm/__tests__/useState-test.js -t mount
```

## Run test with debugger

```javascript
//
let workInProgressRoot: FiberRoot | null = null;
let workInProgress: Fiber | null = null;

while (workInProgress !== null) {
  const current = workInProgress.alternate;
  const next = beginWork(current, workInProgress);
  // @@@ workInProgress, next
  if (next === null) {
    // Attempt to complete the current unit of work, then move to the next
    // sibling. If there are no more siblings, return to the parent fiber.
    do {
        // The current, flushed, state of this fiber is the alternate. Ideally
        // nothing should rely on this, but relying on it here means that we don't
        // need an additional field on the work in progress.
        const current = workInProgress.alternate;
        const returnFiber = workInProgress.return;
        const next = completeWork(current, workInProgress);
        if (next !== null) {
            // Completing this fiber spawned new work. Work on that next.
            workInProgress = next;
            break;
        }
        const siblingFiber = workInProgress.sibling;
        // $$$ workInProgress, siblingFiber
        if (siblingFiber !== null) {
            // If there is more work to do in this returnFiber, do that next.
            workInProgress = siblingFiber;
            break;
        }
        // Otherwise, return to the parent
        workInProgress = returnFiber;
    } while (workInProgress !== null);
  } else {
    workInProgress = next;
  }
}
```

```javascript
function completeWork(current: Fiber | null, workInProgress: Fiber): Fiber | null {
  const newProps = workInProgress.pendingProps;
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      bubbleProperties(workInProgress);
      return null;
    case HostComponent: {
      popHostContext(workInProgress);
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps
        );
      } else {
        if (!newProps) {
          // This can happen when we abort work.
          bubbleProperties(workInProgress);
          return null;
        }
        const currentHostContext = getHostContext();
        const rootContainerInstance = getRootHostContainer();
        // create DOM element
        const instance = createInstance(
          type,
          newProps,
          rootContainerInstance,
          currentHostContext,
          workInProgress,
        );
        // !!! workInProgress, instance
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
      }
      bubbleProperties(workInProgress);
      return null;
    }            
  }
}
```

```javascript
function appendAllChildren(parent: Instance, workInProgress: Fiber) {
  // We only have the top Fiber that was created but we need recurse down its
  // children to find all the terminal nodes.
  let node = workInProgress.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      parent.appendChild(node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
```