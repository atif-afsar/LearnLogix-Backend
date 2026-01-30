import app from '../server.js';

const routes = [];

if (app._router && app._router.stack) {
  app._router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach((l) => {
        if (l.route) {
          const methods = Object.keys(l.route.methods).join(',').toUpperCase();
          routes.push(`${methods} ${l.route.path}`);
        }
      });
    }
  });
}

console.log('Registered routes:');
routes.forEach(r => console.log(r));
