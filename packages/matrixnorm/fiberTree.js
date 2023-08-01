/**
 * @flow
 */

import type { Fiber, FiberRoot } from 'react-reconciler/src/ReactInternalTypes';
import { fiberInfoShort } from './print'

function __getAllChildrenOfFiber(fiber: Fiber): Fiber[] {
  let children = [];
  let child = fiber.child;
  while (child) {
    children.push(child);
    child = child.sibling;
  }
  return children;
}

export const fiberTreeToObject = (node: Fiber): Object => {
  let { child: firstChild } = node;
  if (firstChild) {
    let children = __getAllChildrenOfFiber(node);
    return { [fiberInfoShort(node)]: children.map(fiberTreeToObject) };
  } else {
    return fiberInfoShort(node);
  }
};

export function fiberTreeToXML(wipHostRoot: Fiber, curHostRoot: Fiber | null = null): string {
  const tab = "  ";
  let depth = -1;

  function do_work(node: Fiber): string {
    depth++;

    let result;
    const children = __getAllChildrenOfFiber(node);
    const padding = tab.repeat(depth);
    const fibInfo = fiberInfoShort(node);

    if (children.length === 0) {
      // leaf node
      result = `${padding}<${fibInfo} />\n`;
    } else {
      result = `${padding}<${fibInfo}>\n`;
      for (let kid of children) {
        result += do_work(kid);
      }
      result += `${padding}</${fibInfo}>\n`;
    }

    depth--;
    return result;
  }

  function do_work2(node: Fiber, curNodesSet: Set<Fiber>): string {
    depth++;

    let result;
    const children = __getAllChildrenOfFiber(node);
    const padding = tab.repeat(depth);
    const fibInfo = fiberInfoShort(node);
    const prefix = curNodesSet.has(node) ? '!!' : '';

    if (children.length === 0) {
      result = `${padding}${prefix}<${fibInfo} />\n`;
    } else {
      result = `${padding}${prefix}<${fibInfo}>\n`;
      let recurTo = curNodesSet.has(node) ? do_work : (kid: Fiber) => do_work2(kid, curNodesSet);
      for (let kid of children) {
        result += recurTo(kid);
      }
      result += `${padding}${prefix}</${fibInfo}>\n`;
    }

    depth--;
    return result;
  }

  function putNodesInSet(rootNode: Fiber, accSet: Set<Fiber>): void {
    accSet.add(rootNode);
    const children = __getAllChildrenOfFiber(rootNode);
    for (let kid of children) {
      putNodesInSet(kid, accSet);
    }
  }

  if (curHostRoot) {
    let curNodesSet = new Set < Fiber > ();
    putNodesInSet(curHostRoot, curNodesSet);
    return do_work2(wipHostRoot, curNodesSet)
  }

  return do_work(wipHostRoot);
};