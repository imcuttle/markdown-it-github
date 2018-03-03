/**
 * @file mention
 * @author Cuttle Cong
 * @date 2018/3/3
 * @description
 */

module.exports = function plugin(md, name, options) {
  md.inline.ruler.before('emphasis', 'gh-mention', mention)
  // md.inline.ruler2.before('emphasis', 'mention', postProcess)
}

function mention(state, silent) {
  if (silent) {
    return false
  }

  let token,
      start  = state.pos,
      md     = state.md,
      src    = state.src,
      marker = src.charCodeAt(start),
      next   = src.charCodeAt(start + 1),
      ch     = String.fromCharCode(marker)

  function isEnd(code) {
    return md.utils.isMdAsciiPunct(code) || md.utils.isWhiteSpace(code)
  }
  if (ch !== '@' || isEnd(next)) {
    return false
  }

  let end = start + 1, code, str = ch
  while (end < src.length) {
    code = src.charCodeAt(end)
    if (isEnd(code)) {
      break
    }
    str += String.fromCharCode(code)
    end++
  }

  token = state.push('gh_mention_open', 'a', 1)
  token.markup = '@'
  token.content = ''
  token.attrs = [
    ['href', `https://github.com/${str.substring(1)}`],
    ['class', 'user-mention']
  ]
  // state.push('text', '', 1)
  // let tkStart = state.tokens.length - 1

  state.pos = start + 1
  state.posMax = end
  state.md.inline.ruler.disable('gh-mention')
  state.md.inline.tokenize(state)
  state.md.inline.ruler.enable('gh-mention')

  // state.push('text', '', 1)
  // state.delimiters.push({
  //   type: 'mention',
  //   content: str,
  //   tkStart,
  //   level: state.level,
  //   end: -1,
  //   tkEnd: state.tokens.length - 1
  // })
  state.push('gh_mention_close', 'a', -1)

  state.pos = end
  state.posMax = src.length
  return true
}


// Walk through delimiter list and replace text tokens with tags
//
function postProcess(state) {
  var i, j,
      placeholder,
      token,
      loneMarkers = [],
      delimiters  = state.delimiters,
      max         = state.delimiters.length

  for (i = 0; i < max; i++) {
    placeholder = delimiters[i]
    if (placeholder.type !== 'mention'/* = */) {
      continue
    }
    if (!placeholder.content.startsWith('@')) {
      continue
    }

    token = state.tokens[placeholder.tkStart]
    token.type = 'mention_open'
    token.tag = 'a'
    token.nesting = 1
    token.markup = '@'
    token.content = ''
    token.attrs = [
      ['href', `https://github.com/${placeholder.content.substring(1)}`],
      ['class', 'user-mention']
    ]

    token = state.tokens[placeholder.tkEnd]
    token.type = 'mention_close'
    token.tag = 'a'
    token.nesting = -1
    token.markup = ''
    token.content = ''

    // if (state.tokens[endDelim.token - 1].type === 'text' &&
    //     state.tokens[endDelim.token - 1].content === '=') {
    //
    //   loneMarkers.push(endDelim.token - 1)
    // }
  }

  // If a marker sequence has an odd number of characters, it's splitted
  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
  // start of the sequence.
  //
  // So, we have to move all those markers after subsequent s_close tags.
  //
  while (loneMarkers.length) {
    i = loneMarkers.pop()
    j = i + 1

    while (j < state.tokens.length && state.tokens[j].type === 'mark_close') {
      j++
    }

    j--

    if (i !== j) {
      token = state.tokens[j]
      state.tokens[j] = state.tokens[i]
      state.tokens[i] = token
    }
  }
}
