'use strict';

let React;
let ReactDOM;
let ReactDOMClient
let ReactTestUtils;

describe('fiber tree general', () => {
  let containerForReactComponent = null;

  beforeEach(() => {
    jest.resetModules(); // ???
    React = require('react');
    ReactDOM = require('react-dom');
    // TODO
    ReactDOMClient = require('react-dom/client');
    ReactTestUtils = require('react-dom/test-utils');

    containerForReactComponent = document.createElement('div');
    document.body.appendChild(containerForReactComponent);
  });

  afterEach(() => {
    document.body.removeChild(containerForReactComponent);
    containerForReactComponent = null;
  });

  function renderIt(reactElem) {
    ReactTestUtils.act(() => {
      ReactDOM.render(reactElem, containerForReactComponent);
    });
  }

  describe('case1', () => {
    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);
  
      const incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };
  
      return (
        <main>
          <button onClick={incrementCount}></button>
          <span>{count}</span>
        </main>
      );
    }
  
    it('mount', () => {
      renderIt(<App />);
    });
  
    it('update', () => {
      let __log = console.log;
      console.log = () => { };
  
      renderIt(<App />);
  
      console.log = __log;
      console.log('=== START UPDATE ===');
  
      ReactTestUtils.act(() => {
        containerForReactComponent
          .querySelector('button')
          .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    });
  });
  
  describe('case2', () => {
    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);

      const incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };

      return (
        <main>
          <section>
            <button onClick={incrementCount}></button>
            <span>{count}</span>
          </section>
          <footer><p>bear</p></footer>
        </main>
      );
    }

    it('mount', () => {
      renderIt(<App />);
    });

    it('update', () => {
      let __log = console.log;
      console.log = () => { };
  
      renderIt(<App />);
  
      console.log = __log;
      console.log('=== START UPDATE ===');
  
      ReactTestUtils.act(() => {
        containerForReactComponent
          .querySelector('button')
          .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    });
  });

  describe('delete1', () => {
    function App() {
      console.log('=== App ===');
      const [count, setCount] = React.useState(0);
  
      const incrementCount = () => {
        console.log('=== incrementCount ===');
        setCount(prev => prev + 1);
      };
  
      return (
        <main>
          <button onClick={incrementCount}></button>
          {count === 0 ? <span>hi</span> : null}
        </main>
      );
    }
  
    it('update', () => {
      let __log = console.log;
      console.log = () => { };
  
      renderIt(<App />);
  
      console.log = __log;
      console.log('=== START UPDATE ===');
  
      ReactTestUtils.act(() => {
        containerForReactComponent
          .querySelector('button')
          .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    });
  });

  describe('xxx', () => {
    function Left() {
      const [count, setCount] = React.useState(0);
  
      const incrementCount = () => {
        setCount(prev => prev + 1);
      };
  
      return (
        <main id="left">
          <button onClick={incrementCount}></button>
          <span>{count}</span>
        </main>
      );
    }

    function Right() {
      const [count, setCount] = React.useState(0);
  
      const incrementCount = () => {
        setCount(prev => prev + 1);
      };
  
      return (
        <main id="right">
          <button onClick={incrementCount}></button>
          <span>{count}</span>
        </main>
      );
    }

    function App() {
      return (
        <div>
          <Left />
          <Right />
        </div>
      );
    }
  
    it('update', () => {
      let __log = console.log;
      console.log = () => { };
  
      renderIt(<App />);
  
      console.log = __log;
      console.log('=== START UPDATE ===');
  
      ReactTestUtils.act(() => {
        containerForReactComponent
          .querySelector('#right button')
          .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    });
  });
  
});
