import { marked } from 'marked'

// Configure marked with sensible defaults
marked.setOptions({
  breaks: true, // Treat newlines as <br>
})

/**
 * Render full markdown (block + inline) to an HTML string.
 * Content is trusted (org-controlled Google Sheet), not user input.
 */
export function renderMarkdown(text: string): string {
  if (!text)
    return ''
  return marked(text) as string
}

/**
 * Render inline-only markdown (bold, italic, links, code) to an HTML string.
 * Wrapping block elements like <p> are stripped so the result can be placed
 * inside an existing heading or paragraph element.
 */
export function renderInlineMarkdown(text: string): string {
  if (!text)
    return ''
  return marked.parseInline(text) as string
}
