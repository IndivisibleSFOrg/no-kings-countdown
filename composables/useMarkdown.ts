import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

// Configure marked with sensible defaults
marked.setOptions({
  breaks: true, // Treat newlines as <br>
})

/**
 * Render full markdown (block + inline) to a sanitized HTML string.
 * Output is passed through DOMPurify to strip event handlers, javascript:
 * hrefs, and injected external resources before v-html injection.
 */
export function renderMarkdown(text: string): string {
  if (!text)
    return ''
  return DOMPurify.sanitize(marked(text) as string, { USE_PROFILES: { html: true } })
}

/**
 * Render inline-only markdown (bold, italic, links, code) to a sanitized HTML string.
 * Wrapping block elements like <p> are stripped so the result can be placed
 * inside an existing heading or paragraph element.
 */
export function renderInlineMarkdown(text: string): string {
  if (!text)
    return ''
  return DOMPurify.sanitize(marked.parseInline(text) as string, { USE_PROFILES: { html: true } })
}
