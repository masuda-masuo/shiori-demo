import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    if (typeof window !== 'undefined') {
      // Global click handler to toggle zoom on Mermaid wrappers
      window.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.mermaid-wrapper');
        if (wrapper) {
          wrapper.classList.toggle('zoomed');
          if (wrapper.classList.contains('zoomed')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        } else {
          // If clicked outside, close any open zoomed wrapper
          const openZoomed = document.querySelector('.mermaid-wrapper.zoomed');
          if (openZoomed) {
            openZoomed.classList.remove('zoomed');
            document.body.style.overflow = '';
          }
        }
      });

      // Press Escape key to close the zoom popup
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openZoomed = document.querySelector('.mermaid-wrapper.zoomed');
          if (openZoomed) {
            openZoomed.classList.remove('zoomed');
            document.body.style.overflow = '';
          }
        }
      });
    }
  }
}
