import { Plugins } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { default as React } from 'react';
import ReactDOM from 'react-dom';
import App from 'App';
import * as serviceWorker from 'serviceWorker';

const { Device } = Plugins;

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

const startApp = (info) => {
  ReactDOM.render(<App deviceInfo={info} />, document.getElementById('root'));

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
};

if (window['cordova']) {
  // start app on mobile
  // must wait for 'deviceready' before starting
  document.addEventListener(
    'deviceready',
    async () => {
      const info = await Device.getInfo(); // TODO move this into a context provider
      startApp(info);
    },
    false
  );
} else {
  // start app on web
  startApp(null);
}
