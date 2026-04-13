import tracerPlugin from '@eggjs/tracer';

export default {
  // enable tracer plugin
  ...tracerPlugin(),
  validate: { enable: true, package: 'egg-validate' },
};
