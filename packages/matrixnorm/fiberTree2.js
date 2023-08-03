/**
 * @flow
 */

import type { Fiber, FiberRoot } from 'react-reconciler/src/ReactInternalTypes';
import { fiberInfoShort } from './print'

/*
a
|
b -- c -- - -- d -- p
     |         |    |
     e -- f    k    t
          |
          m
*/

export function fiberTreeToXMLv1(startNode: Fiber): string {
  const tab = " ".repeat(2);
  let depth = -1;

  function __doWorkRecur(node: Fiber): string {
    depth++;
    const padding = tab.repeat(depth);
    const fibInfo = fiberInfoShort(node);

    let result = '';
    if (node.child) {
      result += `${padding}<${fibInfo}>\n`;
      result += __doWorkRecur(node.child);
      result += `${padding}</${fibInfo}>\n`;
    } else {
      result = `${padding}<${fibInfo} />\n`;
    }
    depth--;

    if (node.sibling) {
      result += __doWorkRecur(node.sibling);
    }

    return result;
  }

  return __doWorkRecur(startNode);
}

export function fiberTreeToXMLv2(startNode: Fiber): string {
  const tab = " ".repeat(2);
  let depth = -1;

  function __doWorkRecur(node: Fiber): string {
    depth++;
    const padding = tab.repeat(depth);
    const fibInfo = fiberInfoShort(node);

    let result = '';
    if (node.child) {
      result += `${padding}<${fibInfo}>\n`;
      result += __doWorkRecur(node.child);
      result += `${padding}</${fibInfo}>\n`;
    } else {
      result = `${padding}<${fibInfo} />\n`;
    }
    depth--;

    if (node.sibling) {
      result += __doWorkRecur(node.sibling);
    }

    return result;
  }

  return __doWorkRecur(startNode);
}