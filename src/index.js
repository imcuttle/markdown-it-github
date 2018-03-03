/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/3/3
 * @description
 */
const mention = require('./plugins/mention')

module.exports = function plugin(md, name, options) {
  md.inline.ruler.before('emphasis', 'mention', mention)
  // md.inline.ruler2.before('emphasis', 'mention', postProcess)
}
