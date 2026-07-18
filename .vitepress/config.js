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
        // Safe AST-level inline rule to parsing #num and repo#num links
        md.inline.ruler.push('github_autolink', (state, silent) => {
          const src = state.src;
          const pos = state.pos;
          
          // 1. Single hash link: #num
          const matchHash = src.slice(pos).match(/^#(\d+)\b/);
          if (matchHash) {
            // Prevent matching in link contexts already
            if (state.linkLevel > 0) return false;
            
            if (!silent) {
              const num = matchHash[1];
              let defaultRepo = "masuda-masuo/shiori";
              const relativePath = state.env.relativePath || "";
              if (relativePath.includes("43") || relativePath.includes("649") || relativePath.includes("history") || relativePath.includes("sunaba")) {
                defaultRepo = "masuda-masuo/sunaba";
              }
              
              const token_o = state.push('link_open', 'a', 1);
              token_o.attrs = [
                ['href', `https://github.com/${defaultRepo}/issues/${num}`],
                ['target', '_blank'],
                ['class', 'autolink']
              ];
              
              const token_t = state.push('text', '', 0);
              token_t.content = `#${num}`;
              
              const token_c = state.push('link_close', 'a', -1);
            }
            state.pos += matchHash[0].length;
            return true;
          }
          
          // 2. Repo hash link: repo#num or owner/repo#num
          const matchRepo = src.slice(pos).match(/^([a-zA-Z0-9\-_\/]+)#(\d+)\b/);
          if (matchRepo) {
            if (state.linkLevel > 0) return false;
            
            const fullMatch = matchRepo[0];
            const repoPath = matchRepo[1];
            const num = matchRepo[2];
            
            // Skip syntax keywords to avoid breaking plugins
            if (repoPath === 'sequenceDiagram' || repoPath.includes('Diagram')) {
              return false;
            }
            
            let targetRepo = repoPath;
            const repoMap = {
              "shiori": "masuda-masuo/shiori",
              "sunaba": "masuda-masuo/sunaba",
              "opencode-plugin-cc": "masuda-masuo/opencode-plugin-cc",
              "opencode": "anomalyco/opencode",
              "claude-code": "anthropics/claude-code",
              "onyx": "onyx-dot-app/onyx"
            };
            
            if (repoMap[repoPath]) {
              targetRepo = repoMap[repoPath];
            } else if (!repoPath.includes('/')) {
              // Skip arbitrary single words to avoid breaking code context
              return false;
            }
            
            if (!silent) {
              const token_o = state.push('link_open', 'a', 1);
              token_o.attrs = [
                ['href', `https://github.com/${targetRepo}/issues/${num}`],
                ['target', '_blank'],
                ['class', 'autolink']
              ];
              
              const token_t = state.push('text', '', 0);
              token_t.content = fullMatch;
              
              const token_c = state.push('link_close', 'a', -1);
            }
            state.pos += fullMatch.length;
            return true;
          }
          
          return false;
        });
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
        useMaxWidth: true
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
