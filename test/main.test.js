/**
 * @file main
 * @author Cuttle Cong
 * @date 2018/3/3
 * @description
 */
import Markdown from 'markdown-it'
import mark from '../src/mark'
import mention from '../src/plugins/mention'

describe('main', function () {
  let md
  beforeEach(() => {
    md = new Markdown()
  })
  test('mark example', () => {
    // const ast = new Markdown()
    //   .use(mark)
    //   .parse('# abc\nsds ==asd==')

    expect(
      md.use(mark)
        .render('# abc\nsds ==asd==')
        .trim()
    ).toBe('<h1>abc</h1>\n<p>sds <mark>asd</mark></p>')
  })

  it('should mention works', function () {
    expect(
      md.use(mention)
        .render('asds @xssd @asd')
        .trim()
    )
      .toBe('<p>asds <a href="https://github.com/xssd" class="user-mention">xssd</a> <a href="https://github.com/asd" class="user-mention">asd</a></p>')
  })

  it('test', () => {
    console.log(
      md.use(mention)
      .render('asds **@@sss *')
    )

    // md.use(mention)
    //   .render('asds @@#^%')
  })
})
