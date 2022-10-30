const { resolve } = require('path');
module.exports = {
  title: 'CodixJS',
  // base: '/codix/',
  description: 'Node Private Package Manager',
  dest: resolve(__dirname, '../../docs'),
  evergreen: true,
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    lastUpdated: true,
    smoothScroll: true,
    nextLinks: true,
    prevLinks: true,
    nav: [
      { text: '主页', link: '/' },
      { text: '指南', link: '/guide' },
      { text: 'API', link: '/apis' },
    ],
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'codixjs/core',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: 'Github',
    // 假如文档不是放在仓库的根目录下：
    docsDir: 'documents',
    // 假如文档放在一个特定的分支下：
    docsBranch: 'master',
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: '帮助我们改善此页面！'
  },
  plugins: [
    [
      'vuepress-plugin-container',
      {
        type: 'vue',
        before: '<pre class="vue-container"><code>',
        after: '</code></pre>'
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'upgrade',
        before: info => `<UpgradePath title="${info}">`,
        after: '</UpgradePath>'
      }
    ]
  ]
}