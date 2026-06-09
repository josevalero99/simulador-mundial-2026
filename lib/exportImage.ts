import { toPng } from 'html-to-image'

/**
 * Renders a DOM element to a PNG and triggers a browser download.
 *
 * Uses a solid dark background because backdrop-blur ("glass") surfaces aren't
 * captured by html-to-image — the solid bg lets the translucent layers
 * composite onto something instead of rendering transparent/black.
 */
export async function exportElementToPng(el: HTMLElement, filename: string): Promise<void> {
  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#0a0a0a',
      pixelRatio: 2,
      cacheBust: true,
    })

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    // Let the caller surface an error state.
    throw error
  }
}
