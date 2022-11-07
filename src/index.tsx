import '@releaseband/rowan/dist/style.css';

import { Preloader } from '@releaseband/rowan';
import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';

const App = lazy(() => import('./components/App'));

const root = document.getElementById('root');

ReactDOM.render(
  <Suspense fallback={<Preloader />}>
    <App />
  </Suspense>,
  root,
);
