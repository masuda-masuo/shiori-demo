import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    if (typeof window !== 'undefined') {
      // Document level click listener to handle dynamically loaded/swapped Mermaid containers
      document.addEventListener('click', (e) => {
        // Target .mermaid directly, or its closest ancestor
        const wrapper = e.target.closest('.mermaid');
        if (wrapper) {
          wrapper.classList.toggle('zoomed');
          if (wrapper.classList.contains('zoomed')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        } else {
          // If clicked outside, close any open zoomed wrapper
          const openZoomed = document.querySelector('.mermaid.zoomed');
          if (openZoomed) {
            openZoomed.classList.remove('zoomed');
            document.body.style.overflow = '';
          }
        }
      });

      // Press Escape key to close the zoom popup
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openZoomed = document.querySelector('.mermaid.zoomed');
          if (openZoomed) {
            openZoomed.classList.remove('zoomed');
            document.body.style.overflow = '';
          }
        }
      });
    }
  }
}
