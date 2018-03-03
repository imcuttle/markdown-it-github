/**
 * @file mention
 * @author Cuttle Cong
 * @date 2018/3/3
 * @description
 */
import MD from 'markdown-it'

const join = require('url-join')

module.exports = function plugin(md, options) {
  // md.inline.ruler.push('gh-issue', getGhIssue(options))
  md.inline.ruler.before('text', 'gh-hash', getCommitId(options))
  // md.inline.ruler2.before('emphasis', 'mention', postProcess)
}
console.log(
  new MD().use(module.exports, { repo: 'markdown-it/markdown-it' })
          .render('`Gh-2` #1x2  sds')
          .trim()
)

function getCommitId(options = {}) {
  const { repo = '' } = options
  if (!repo) {
    throw new Error('[github] commit Id\'s option requires `repo` like `markdown-it/markdown-it`')
  }

  return function ghIssue(state, silent) {
    if (silent) {
      return false
    }

    let token,
        start  = state.pos,
        md     = state.md,
        src    = state.src,
        marker = src.charCodeAt(start),
        next   = src.charCodeAt(start + 1),
        ch     = String.fromCharCode(marker),
        startStr = src.substring(start)

    function isEnd(code) {
      return md.utils.isMdAsciiPunct(code) || md.utils.isWhiteSpace(code)
    }

    if ((ch !== '#' && !/^gh-\d/i.test(startStr)) || isEnd(next)) {
      return false
    }
    if (ch === '#' && isNaN(String.fromCharCode(next))) {
      return false
    }

    let end = start + 1, code, str = '', markup = ch
    if (ch !== '#') {
      markup = startStr.substring(0, 3)
      end += 2
    }


    while (end < src.length) {
      code = src.charCodeAt(end)
      if (isEnd(code) || isNaN(String.fromCharCode(code))) {
        break
      }
      str += String.fromCharCode(code)
      end++
    }

    token = state.push('gh_hash_open', 'a', 1)
    token.markup = markup
    token.content = ''
    token.attrs = [
      ['href', join('https://github.com', repo, 'issues', str)],
      ['class', 'issue-link']
    ]

    state.pos = start
    state.posMax = end
    state.md.inline.ruler.disable('gh-hash')
    state.md.inline.tokenize(state)
    state.md.inline.ruler.enable('gh-hash')

    state.push('gh_hash_close', 'a', -1)

    state.pos = end
    state.posMax = src.length
    return true
  }
}
