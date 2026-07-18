import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getSidebarItems(dirName) {
  const dirPath = path.resolve(__dirname, '..', dirName)
  if (!fs.existsSync(dirPath)) return []
  
  const files = fs.readdirSync(dirPath)
  return files
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .map(file => {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : path.basename(file, '.md')
      
      const idMatch = file.match(/^(\d+)/)
      const id = idMatch ? parseInt(idMatch[1], 10) : 999
      
      return {
        text: `#${id} ${title}`,
        link: `/${dirName}/${path.basename(file, '.md')}`,
        id
      }
    })
    .sort((a, b) => b.id - a.id)
    .map(({ text, link }) => ({ text, link }))
}

export default withMermaid(
  defineConfig({
    title: "Shiori Demo",
    description: "AIエージェントとShiori（検索MCP）による自律執筆コラムデモギャラリー",
    base: "/shiori-demo/",
    head: [
      ['link', { rel: 'icon', href: '/shiori-demo/favicon.ico' }]
    ],
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Columns', link: '/columns/index' },
        { text: 'History', link: '/history/index' },
        { text: 'About Shiori', link: '/about' }
      ],
      sidebar: {
        '/columns/': [
          {
            text: '技術コラム (自律執筆)',
            items: getSidebarItems('columns')
          }
        ],
        '/history/': [
          {
            text: 'Sunaba実走履歴',
            items: getSidebarItems('history')
          }
        ]
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/masuda-masuo/shiori' }
      ],
      search: {
        provider: 'local'
      },
      footer: {
        message: 'Shiori pointer-RAG automation experiment.',
        copyright: 'Copyright © 2026 masuda-masuo'
      }
    }
  })
)
