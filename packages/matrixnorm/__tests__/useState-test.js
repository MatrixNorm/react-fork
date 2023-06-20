'use strict';

let React;
let ReactDOM;
let ReactTestUtils;

let container = null;

describe('useState hook', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    ReactTestUtils = require('react-dom/test-utils');

    container = document.createElement('div');
    document.body.appendChild(container);
    window.__matrixnorm_container = container;
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('mount', () => {
    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);

      const incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };

      return (
        <div>
          <button onClick={incrementCount}>+</button>
          <span>{count}</span>
        </div>
      );
    }

    console.log('=== START INITIAL RENDER ===');
    
    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });
    console.log('=== DONE INITIAL RENDER ===');
  });

  it('update', () => {
    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);

      const incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };

      return (
        <div>
          <button onClick={incrementCount}></button>
          <div>{count}</div>
        </div>
      );
    }

    let __log = console.log;
    console.log = () => {};

    ReactTestUtils.act(() => {
      ReactDOM.render(<App />, container);
    });

    console.log = __log;
    window.__MATRIX_NORM_LOG_NAMESPACES = ['fiber_tree'];
    console.log('=== UPDATE ===');

    ReactTestUtils.act(() => {
      container
        .querySelector('button')
        .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });
  });


});
