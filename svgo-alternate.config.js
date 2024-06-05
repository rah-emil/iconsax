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
          'aria-hidden'
        ],
        preserveCurrentColor: true
      }
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attribute: {
          stroke: 'currentColor',
          elements: ['path']
        }
      }
    }
  ],
};
