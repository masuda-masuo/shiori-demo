import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  watch: ['./*.md'],
  load() {
    const dirPath = path.resolve(__dirname)
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
        
        // Extract raw text for summary
        const summary = content
          .replace(/^#\s+.+$/m, '') // Remove title
          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
          .replace(/<[\s\S]*?>/g, '') // Remove HTML tags
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Clean links
          .replace(/[#*`>_\-]/g, '') // Clean formatting chars
          .replace(/\s+/g, ' ') // Collapse whitespaces
          .trim()
          .slice(0, 150) + '...'
          
        return {
          title,
          url: `/shiori-demo/history/${path.basename(file, '.md')}.html`,
          id,
          summary
        }
      })
      .sort((a, b) => b.id - a.id)
  }
}
