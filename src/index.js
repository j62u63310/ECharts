/* global kintone */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Calendar from './Calendar.js';

// 判斷是否在Kintone環境中
const isKintone = () => {
  return window.location.href.includes('cybozu.com');
};

if (isKintone()) {
  // 在Kintone環境中
  (() => {
    kintone.events.on('app.record.index.show', (event) => {
      console.log('loaded');
      const customView = Number(8252375); // 替換為你的自定義視圖 ID
      if (event.viewId === customView) {
        let rootElement = document.querySelector('.root');
        if (!rootElement) {
          rootElement = document.createElement('div');
          rootElement.class = 'root';
          document.body.appendChild(rootElement);
        }
        const root = ReactDOM.createRoot(rootElement);
        root.render(
          <React.StrictMode>
            <Calendar />
          </React.StrictMode>
        );
      }
      return event;
    });
  })();
} else {
  // 在非Kintone環境中
  let rootElement = document.querySelector('.root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.class = 'root';
    document.body.appendChild(rootElement);
  }
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Calendar />
    </React.StrictMode>
  );
}