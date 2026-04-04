import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import IndexRoute from './routes/index';
import GitRoute from './routes/git';
import '../app/styles/tailwind.css';
import '../app/styles/index.scss';
import 'react-toastify/dist/ReactToastify.css';
import '@xterm/xterm/css/xterm.css';

const router = createBrowserRouter(
  [
    { path: '/', element: <IndexRoute /> },
    { path: '/git', element: <GitRoute /> },
    { path: '/chat/:id', element: <IndexRoute /> },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  },
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
