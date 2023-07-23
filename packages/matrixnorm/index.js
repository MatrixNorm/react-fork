import type { Fiber, FiberRoot } from 'react-reconciler/src/ReactInternalTypes';

export const getFiberType = (fiber: Fiber) => {
  switch (fiber.tag) {
    case 0: {
      return `func {${fiber.type.name}}`;
    }
    case 2: {
      return `indeterminate {${fiber.type.name}}`;
    }
    case 3: {
      return 'hostRoot';
    }
    case 14: {
      return `memo type:${fiber.elementType.type.name}`
    }
    case 15: {
      return `simpleMemo type:${fiber.type.name}`
    }
    default:
      return fiber.type;
  }
};

export const fiberInfo = (fiber: Fiber | null): void => {
  return fiber ? `Fib <tag=${fiber.tag} ${getFiberType(fiber)}>` : 'Fib <NULL>';
};

export const fiberInfoShort = (fiber: Fiber | null): void => {
  return fiber ? `${getFiberType(fiber)}` : 'NULL';
};

export const elementInfo = element => {
  if (!element) return null;

  if (Array.isArray(element)) {
    return element.map(el => elementInfo(el));
  }

  if (typeof element === 'object') {
    const _element = { ...element };

    _element._owner = fiberInfo(_element._owner);
    if (_element.type?.constructor === Function) {
      _element.type = `func <${_element.type.name}>`
    }

    let children = _element.props?.children;
    // && (Array.isArray(children) || Object.isObject(children)
    if (children) {
      _element.props = { ..._element.props, children: elementInfo(children) }
    }
    return _element;
  } else {
    return element
  }
};

export const domElementInfo = domElement => {
  return `DOM elem <${domElement?.tagName}>`
};

function __getAllChildrenOfFiber(fiber: Fiber) {
  let children = [];
  let child = fiber.child;
  while (child) {
    children.push(child);
    child = child.sibling;
  }
  return children;
}

export const fiberTreeToObject = (node: Fiber) => {
  let { child: firstChild } = node;
  if (firstChild) {
    let children = __getAllChildrenOfFiber(node);
    return { [fiberInfoShort(node)]: children.map(fiberTreeToObject) };
  } else {
    return fiberInfoShort(node);
  }
};

function fiberTreeToXMLClosure() {
  const print = console.log;
  const step = "  ";
  
  let depth = -1;
  
  function fiberTreeToXML(node: Fiber) {
    depth++;

    let result;
    const children = __getAllChildrenOfFiber(node);
    const padding = step.repeat(depth);
    const fibInfo = fiberInfoShort(node);
    
    if (children.length === 0) {
      result = `${padding}<${fibInfo} />\n`;
    } else {
      result = `${padding}<${fibInfo}>\n`;
      for(let kid of children) {
        result += fiberTreeToXML(kid);
      }      
      result += `${padding}</${fibInfo}>\n`;
    }

    depth--;
    return result;
  }

  return fiberTreeToXML;
};

export const fiberTreeToXML = fiberTreeToXMLClosure();

// const fiberTreeToObject2 = (wipNode: Fiber, curNode: Fiber) => {
//   if (wipNode === curNode) {
//     let { child: firstChild } = wipNode;
//     if (firstChild) {
//       let children = __getAllChildrenOfFiber(wipNode);
//       return { [`(!)${fiberInfo(wipNode)}`]: children.map(fiberTreeToObject) };
//     } else {
//       return `(!)${fiberInfo(wipNode)}`;
//     }
//   } else {
//     let { child: wipFirstChild } = wipNode;
//     let { child: curFirstChild } = curNode;
//     // XXX
//   }
// }

export const getStackTrace = depth => {
  let obj = {};
  Error.captureStackTrace(obj, getStackTrace);

  let stackStr = obj.stack
    .split('\n')
    .slice(1, depth + 1)
    // .map(frame => {
    //   console.log(frame)
    //   let frameData = frame.trim().split(' ');
    //   let functionName = frameData[1];
    //   let filePath = frameData[2].split('/');
    //   let fileName = filePath[filePath.length - 1];
    //   fileName = fileName.substring(0, fileName.lastIndexOf(':'));
    //   return {
    //     functionName,
    //     fileName,
    //   };
    // })
    // .map(({functionName, fileName}) => `${functionName}:: ${fileName}`)
    .join('\n');

  return '\n\n' + stackStr;
};
