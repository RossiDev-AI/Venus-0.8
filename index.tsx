import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- KERNEL LOG SUPPRESSION PROTOCOL ---
// Este bloco deve rodar antes de qualquer biblioteca de IA/Visão
(function() {
    const suppressedKeywords = [
        'gl_context_webgl.cc',
        'gl_context.cc',
        'Successfully created a WebGL context',
        'OpenGL error checking is disabled',
        'GL version',
        'NGL_LOG'
    ];

    const filterConsole = (originalFn: any) => {
        return function(...args: any[]) {
            const message = args.join(' ');
            const shouldSuppress = suppressedKeywords.some(keyword => message.includes(keyword));
            if (!shouldSuppress) {
                originalFn.apply(console, args);
            }
        };
    };

    console.log = filterConsole(console.log);
    console.warn = filterConsole(console.warn);
    console.info = filterConsole(console.info);
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);