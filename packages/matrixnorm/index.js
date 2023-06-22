import type { Fiber } from 'react-reconciler/src/ReactInternalTypes';

export const getFiberType = fiber => {
  switch (fiber.tag) {
    case 0: {
      return `func <${fiber.type.name}>`;
    }
    case 2: {
      return `indeterminate <${fiber.type.name}>`;
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

export const fiberInfo = (fiber: Fiber) => {
  return fiber ? `Fib <tag=${fiber.tag} ${getFiberType(fiber)}>` : 'Fib <NULL>';
};

export const elementInfo = element => {
  if (!element) return null;

  if (Array.isArray(element)) {
    return element.map(el => elementInfo(el));
  }

  const _element = { ...element };
  _element._owner = fiberInfo(element._owner);
  return _element;
};

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

export const log = namespace => {
  const _NAMESPACES = window.__MATRIX_NORM_LOG_NAMESPACES;

  if (_NAMESPACES && _NAMESPACES.includes(namespace)) {
    return console.log;
  } else {
    return () => { };
  }
};
