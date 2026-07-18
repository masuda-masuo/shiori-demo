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
      ['link', { rel: 'icon', href: '/shiori-demo/favicon.ico' }],
      ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }]
    ],
    markdown: {
      config: (md) => {
        md.renderer.rules.text = function(tokens, idx, options, env, self) {
          let text = tokens[idx].content;
          
          const escapeHtml = (str) => str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
            
          text = escapeHtml(text);
          
          // 1. Full repository format: owner/repo#num
          text = text.replace(/([a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+)#(\d+)/g, (match, repo, num) => {
            return `<a href="https://github.com/${repo}/issues/${num}" target="_blank" class="autolink">${match}</a>`;
          });
          
          // 2. Short repository format: (shiori|sunaba|...)#num
          const repoMap = {
            "shiori": "masuda-masuo/shiori",
            "sunaba": "masuda-masuo/sunaba",
            "opencode-plugin-cc": "masuda-masuo/opencode-plugin-cc",
            "opencode": "anomalyco/opencode",
            "claude-code": "anthropics/claude-code",
            "onyx": "onyx-dot-app/onyx"
          };
          const keys = Object.keys(repoMap).join("|");
          const regexShort = new RegExp(`\\b(${keys})#(\\d+)`, "g");
          text = text.replace(regexShort, (match, name, num) => {
            const repo = repoMap[name];
            return `<a href="https://github.com/${repo}/issues/${num}" target="_blank" class="autolink">${match}</a>`;
          });
          
          // 3. Plain format: #num
          text = text.replace(/(^|\s)#(\d+)\b/g, (match, space, num) => {
            let defaultRepo = "masuda-masuo/shiori";
            const relativePath = env.relativePath || "";
            if (relativePath.includes("43") || relativePath.includes("649") || relativePath.includes("history") || relativePath.includes("sunaba")) {
              defaultRepo = "masuda-masuo/sunaba";
            }
            return `${space}<a href="https://github.com/${defaultRepo}/issues/${num}" target="_blank" class="autolink">#${num}</a>`;
          });
          
          return text;
        };
      }
    },
    mermaid: {
      theme: 'dark',
      themeVariables: {
        fontSize: '18px',
        actorFontSize: '18px',
        noteFontSize: '16px',
        messageFontSize: '16px',
        fontFamily: 'Outfit, Inter, var(--vp-font-family-base)'
      },
      sequence: {
        width: 240,       // Wide actor boxes
        height: 65,
        actorMargin: 180, // Generous spacing to spread diagram out
        messageMargin: 45,
        boxMargin: 10,
        useMaxWidth: false // Do NOT force scaling down to container width
      }
    },
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
