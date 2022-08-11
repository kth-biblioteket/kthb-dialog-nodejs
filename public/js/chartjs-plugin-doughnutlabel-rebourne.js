(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js/helpers'), require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['chart.js/helpers', 'chart.js'], factory) :
	(global.DoughnutLabel = factory(global.Chart.helpers,global.Chart));
}(this, (function (helpers,Chart) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

/**
 * @module Options
 */

'use strict';

var defaults = {
  /**
   * The font options used to draw the label text.
   * @member {Object|Array|Function}
   * @prop {String} font.family - defaults to Chart.defaults.global.defaultFontFamily
   * @prop {Number} font.lineHeight - defaults to 1.2
   * @prop {Number} font.size - defaults to Chart.defaults.global.defaultFontSize
   * @prop {String} font.style - defaults to Chart.defaults.global.defaultFontStyle
   * @prop {Number} font.weight - defaults to 'normal'
   * @default Chart.defaults.font.*
   * @prop {Number} paddingPercentage - how much padding to add when scaling very large text (value in percentage of 100)
   * @prop {Bool} display - show label or not
   * @prop {String} api - specify which plugin core api to use to draw labels
   */
  font: {
    family: undefined,
    lineHeight: 1.2,
    size: undefined,
    style: undefined,
    weight: null,
  },
  paddingPercentage: 10,
  display: true,
  api: 'beforeDatasetDraw',
  color: '#000000',
};

'use strict';

var utils = {
  parseFont: function (value) {
    var defaults = Chart.defaults;
    var size = helpers.valueOrDefault(value.size, defaults.font.size);
    var font = {
      family: helpers.valueOrDefault(value.family, defaults.font.family),
      lineHeight: helpers.toLineHeight(value.lineHeight, size),
      size: size,
      style: helpers.valueOrDefault(value.style, defaults.font.style),
      weight: helpers.valueOrDefault(value.weight, null),
      string: '',
    };

    font.string = utils.toFontString(font);
    return font;
  },

  toFontString: function (font) {
    if (!font || helpers.isNullOrUndef(font.size) || helpers.isNullOrUndef(font.family)) {
      return null;
    }

    const strOnly = new RegExp('^[0-9]+$');

    if (!strOnly.test(font.size) && typeof font.size !== 'number') {
      throw 'Invalid font size value! Only pixels allowed!';
    }

    return (
      (font.style ? font.style + ' ' : '') +
      (font.weight ? font.weight + ' ' : '') +
      font.size +
      'px ' +
      font.family
    );
  },

  textSize: function (ctx, labels) {
    var items = [].concat(labels);
    var ilen = items.length;
    var prev = ctx.font;
    var width = 0;
    var height = 0;
    var i;

    for (i = 0; i < ilen; ++i) {
      ctx.font = items[i].font.string;
      width = Math.max(ctx.measureText(items[i].text).width, width);
      height += items[i].font.lineHeight;
    }

    ctx.font = prev;

    var result = {
      height: height,
      width: width,
    };
    return result;
  },
};

'use strict';

var plugin = {
  id: 'doughnutlabel',
  beforeInit: function (chart, args, options) {
    var ctx = chart.ctx;
    var api = helpers.resolve([options.api, defaults.api], ctx, 0);
    this[api] = this._drawLabels;
  },
  _drawLabels: function (chart, args, options) {
    if (options && options.labels && options.labels.length > 0) {
      var ctx = chart.ctx;

      var displayThis = (label) => {
        return helpers.resolve(
          [label.display, options.display, defaults.display],
          ctx,
          0
        );
      };

      var innerLabels = [];
      options.labels.forEach((label) => {
        if (!displayThis(label)) {
          return;
        }
        var text =
          typeof label.text === 'function' ? label.text(chart) : label.text;
        var innerLabel = {
          text: text,
          // this custom function will eventually call Charts.default
          font: utils.parseFont(
            helpers.resolve([label.font, options.font, defaults.font], ctx, 0)
          ),
          color: helpers.resolve([label.color, options.color, defaults.color], ctx, 0),
        };
        innerLabels.push(innerLabel);
      });

      var textAreaSize = utils.textSize(ctx, innerLabels);

      var paddingPercentage = helpers.resolve(
        [options.paddingPercentage, defaults.paddingPercentage],
        ctx,
        0
      );

      // add "padding" between inner circle and text area
      var padding = 1 - paddingPercentage / 100;

      // Calculate the adjustment ratio to fit the text area into the doughnut inner circle
      var hypotenuse = Math.sqrt(
        Math.pow(textAreaSize.width, 2) + Math.pow(textAreaSize.height, 2)
      );
      var innerDiameter = args.meta.controller.innerRadius * 2;
      var fitRatio = (innerDiameter / hypotenuse) * padding;

      // Adjust the font if necessary and recalculate the text area after applying the fit ratio
      if (fitRatio < 1) {
        innerLabels.forEach(function (innerLabel) {
          innerLabel.font.size = Math.floor(innerLabel.font.size * fitRatio);
          innerLabel.font.lineHeight = undefined;
          innerLabel.font = utils.parseFont(innerLabel.font);
        });

        textAreaSize = utils.textSize(ctx, innerLabels);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // The center of the inner circle
      var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

      // The top Y coordinate of the text area
      var topY = centerY - textAreaSize.height / 2;

      var i;
      var ilen = innerLabels.length;
      var currentHeight = 0;
      for (i = 0; i < ilen; ++i) {
        ctx.fillStyle = innerLabels[i].color;
        ctx.font = innerLabels[i].font.string;

        // The Y center of each line
        var lineCenterY =
          topY + innerLabels[i].font.lineHeight / 2 + currentHeight;
        currentHeight += innerLabels[i].font.lineHeight;

        // Draw each line of text
        ctx.fillText(innerLabels[i].text, centerX, lineCenterY);
      }
    }
  },
};

return plugin;

})));
