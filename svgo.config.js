export default {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: true
  },
  plugins: [
    'preset-default',
    'removeDimensions',
    'sortAttrs',
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          '*:(stroke|fill):((?!^none$).)*',
          'path:stroke-width',
          'aria-hidden'
        ]
      }
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          'fill="currentColor"',
          'aria-hidden="true"'
        ]
      }
    }
  ],
};
