'use strict';

function __queue(label) {
  const msg = label ? `wait for microtasks ${label}` : 'wait for microtasks';
  console.log(msg);
  return new Promise(queueMicrotask);
}

describe('force concurrent render', () => {
  // ???
  let containerForReactComponent = null;
  let React;
  let ReactDOM;
  let ReactDOMClient;
  let ReactTestUtils;
  let Scheduler;

  beforeEach(() => {
    jest.resetModules(); // ???

    React = require('react');
    ReactDOM = require('react-dom');
    ReactDOMClient = require('react-dom/client');
    ReactTestUtils = require('react-dom/test-utils');
    Scheduler = require('scheduler');

    containerForReactComponent = document.createElement('div');
    document.body.appendChild(containerForReactComponent);

    global.IS_REACT_ACT_ENVIRONMENT = false;
    global.__DEV__ = false;
  });

  afterEach(() => {
    document.body.removeChild(containerForReactComponent);
    containerForReactComponent = null;
  });

  it('t1 update', async () => {
    let incrementCount;

    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);

      incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };

      return <div>{count}</div>;
    }

    const root = ReactDOMClient.createRoot(containerForReactComponent);
    root.render(<App />);
    await __queue(1);
    Scheduler.unstable_flushUntilNextPaint();
    console.log(document.body.innerHTML);
    await __queue(2);
    global.__matrixnorm_force_concurrent_render = true;
    incrementCount();
    await __queue(3);
    Scheduler.unstable_flushUntilNextPaint();
    await __queue(4);
    Scheduler.unstable_flushUntilNextPaint();
    await __queue(5);
    console.log(document.body.innerHTML);
    console.log('end of test');
  });

  it('t2 update interrupt render', async () => {
    let incrementCount;

    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);
      const [sum, setSum] = React.useState(0);

      incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };

      const incrementSum = () => {
        console.log('=== incrementSum ===');
        setSum(prev => prev + 1);
      };

      return (
        <div>
          <button onClick={incrementSum}></button>
          <div>{sum}</div>
          <div>{count}</div>
        </div>
      );
    }

    const root = ReactDOMClient.createRoot(containerForReactComponent);
    root.render(<App />);
    await __queue(1);
    Scheduler.unstable_flushUntilNextPaint();
    console.log(document.body.innerHTML);
    await __queue(2);

    console.log('=== /// === UPDATE COUNT === /// ===');
    global.__matrixnorm_force_concurrent_render = true;
    global.__matrixnorm_enableFiberTreeTracing = true;
    incrementCount();
    await __queue(3);
    Scheduler.unstable_flushUntilNextPaint();
    await __queue(4);
    Scheduler.unstable_flushUntilNextPaint();
    await __queue('4.1');
    console.log(Scheduler.getTaskQueue());
    console.log(document.body.innerHTML);
    //global.__matrixnorm_enableFiberTreeTracing = false;

    console.log('=== /// === UPDATE SUM === /// ===');
    containerForReactComponent
      .querySelector('button')
      .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await __queue(5);
    console.log(Scheduler.getTaskQueue());
    console.log(document.body.innerHTML);

    // global.__matrixnorm_force_concurrent_render = false;
    // Scheduler.unstable_flushUntilNextPaint();
    // await __queue(6);
    // console.log(document.body.innerHTML);
    console.log('end of test');
  });
});
