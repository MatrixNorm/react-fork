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

export function fiberTreeToXMLv1(wipHostRoot: Fiber, curHostRoot: Fiber | null = null): string {
  //
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
    const hasThisNodeInCurTree = curNodesSet.has(node);
    const prefix = hasThisNodeInCurTree ? '!!' : '';
    const recurTo = hasThisNodeInCurTree ? do_work : (kid: Fiber) => do_work2(kid, curNodesSet);

    if (children.length === 0) {
      result = `${padding}${prefix}<${fibInfo} />\n`;
    } else {
      result = `${padding}${prefix}<${fibInfo}>\n`;
      for (let kid of children) {
        result += recurTo(kid);
      }
      result += `${padding}${prefix}</${fibInfo}>\n`;
    }

    depth--;
    return result;
  }

  function putFiberTreeNodesInSet(rootNode: Fiber, resultSet: Set<Fiber>): void {
    resultSet.add(rootNode);
    const children = __getAllChildrenOfFiber(rootNode);
    for (let kid of children) {
      putFiberTreeNodesInSet(kid, resultSet);
    }
  }

  if (curHostRoot) {
    let curNodesSet = new Set < Fiber > ();
    putFiberTreeNodesInSet(curHostRoot, curNodesSet);
    return do_work2(wipHostRoot, curNodesSet)
  } else {
    return do_work(wipHostRoot);
  }
};

export function fiberTreeToXMLv2(wipHostRoot: Fiber, curHostRoot: Fiber | null = null): string {
  //
  const tab = "  ";
  let depth = -1;

  function do_work(node: Fiber, curNodesSet: Set<Fiber> | null = null): string {
    depth++;

    let result;
    const children = __getAllChildrenOfFiber(node);
    const padding = tab.repeat(depth);
    const fibInfo = fiberInfoShort(node);
    const hasThisNodeInCurTree = curNodesSet !== null && curNodesSet.has(node);
    const prefix = hasThisNodeInCurTree ? '!!' : '';
    const recurTo = hasThisNodeInCurTree ? do_work : (kid: Fiber) => do_work(kid, curNodesSet);

    if (children.length === 0) {
      result = `${padding}${prefix}<${fibInfo} />\n`;
    } else {
      result = `${padding}${prefix}<${fibInfo}>\n`;
      for (let kid of children) {
        result += recurTo(kid);
      }
      result += `${padding}${prefix}</${fibInfo}>\n`;
    }
    
    depth--;
    return result;
  }

  function putFiberTreeNodesInSet(rootNode: Fiber, resultSet: Set<Fiber>): void {
    resultSet.add(rootNode);
    const children = __getAllChildrenOfFiber(rootNode);
    for (let kid of children) {
      putFiberTreeNodesInSet(kid, resultSet);
    }
  }

  if (curHostRoot) {
    let curNodesSet = new Set < Fiber > ();
    putFiberTreeNodesInSet(curHostRoot, curNodesSet);
    return do_work(wipHostRoot, curNodesSet)
  } else {
    return do_work(wipHostRoot);
  }
};

export function fiberTreeToXMLv3(wipHostRoot: Fiber, curHostRoot: Fiber | null = null): string {

  const tab = " ".repeat(2);

  function do_work(node: Fiber, depth: number, curNodesSet: Set<Fiber> | null = null): string {
    let result;
    const children = __getAllChildrenOfFiber(node);
    const padding = tab.repeat(depth);
    const fibInfo = fiberInfoShort(node);
    const hasThisNodeInCurTree = curNodesSet !== null && curNodesSet.has(node);
    const prefix = hasThisNodeInCurTree ? '!!' : '';
    const recurTo = hasThisNodeInCurTree ? 
      (kid: Fiber) => do_work(kid, depth + 1) :
      (kid: Fiber) => do_work(kid, depth + 1, curNodesSet);

    if (children.length === 0) {
      result = `${padding}${prefix}<${fibInfo} />\n`;
    } else {
      result = `${padding}${prefix}<${fibInfo}>\n`;
      for (let kid of children) {
        result += recurTo(kid);
      }
      result += `${padding}${prefix}</${fibInfo}>\n`;
    }
    return result;
  }

  function putFiberTreeNodesInSet(rootNode: Fiber, resultSet: Set<Fiber>): void {
    resultSet.add(rootNode);
    const children = __getAllChildrenOfFiber(rootNode);
    for (let kid of children) {
      putFiberTreeNodesInSet(kid, resultSet);
    }
  }

  if (curHostRoot) {
    let curNodesSet = new Set < Fiber > ();
    putFiberTreeNodesInSet(curHostRoot, curNodesSet);
    return do_work(wipHostRoot, 0, curNodesSet)
  } else {
    return do_work(wipHostRoot, 0);
  }
};