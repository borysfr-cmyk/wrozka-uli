// Podsumowanie: PDF, obraz PNG i link do udostępnienia.
// Link zawiera całą wróżbę zakodowaną w adresie, więc nie potrzeba serwera ani bazy danych.

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Reading } from './types'

const PREFIX = '#wrozba='

export function readingLink(r: Reading): string {
  const base = location.href.split('#')[0]
  return base + PREFIX + compressToEncodedURIComponent(JSON.stringify(r))
}

export function readingFromLocation(): Reading | null {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const json = decompressFromEncodedURIComponent(location.hash.slice(PREFIX.length))
    return json ? (JSON.parse(json) as Reading) : null
  } catch {
    return null
  }
}

function fileName(r: Reading, ext: string) {
  const d = new Date(r.createdAt)
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `wrozba-ayleny-${stamp}.${ext}`
}

async function renderCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas')
  await document.fonts.ready
  return html2canvas(el, { scale: 2, backgroundColor: '#2b1b10', useCORS: true, logging: false })
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

async function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Nie udało się utworzyć obrazu'))), 'image/png'))
}

export async function downloadImage(el: HTMLElement, r: Reading) {
  downloadBlob(await canvasBlob(await renderCanvas(el)), fileName(r, 'png'))
}

export async function downloadPdf(el: HTMLElement, r: Reading) {
  const [{ jsPDF }, canvas] = await Promise.all([import('jspdf'), renderCanvas(el)])
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  // tniemy długi obraz na strony A4
  const pxPerMm = canvas.width / pageW
  const sliceH = Math.floor(pageH * pxPerMm)
  for (let y = 0, page = 0; y < canvas.height; y += sliceH, page++) {
    const part = document.createElement('canvas')
    part.width = canvas.width
    part.height = Math.min(sliceH, canvas.height - y)
    const ctx = part.getContext('2d')!
    ctx.fillStyle = '#2b1b10'
    ctx.fillRect(0, 0, part.width, part.height)
    ctx.drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height)
    if (page > 0) pdf.addPage()
    pdf.setFillColor(43, 27, 16)
    pdf.rect(0, 0, pageW, pageH, 'F')
    pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, part.height / pxPerMm)
  }
  pdf.setProperties({ title: 'Wróżba Ayleny – Tajemnice Magii' })
  pdf.save(fileName(r, 'pdf'))
}

/** Udostępnia obraz wróżby i link przez systemowe menu (telefon) albo kopiuje link */
export async function shareReading(el: HTMLElement, r: Reading): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = readingLink(r)
  const text = `Moja wróżba od Ayleny (Tajemnice Magii): ${r.message}`
  try {
    if (navigator.share) {
      const blob = await canvasBlob(await renderCanvas(el))
      const file = new File([blob], fileName(r, 'png'), { type: 'image/png' })
      const data: ShareData = navigator.canShare?.({ files: [file] })
        ? { files: [file], title: 'Wróżba Ayleny', text: `${text}\n${url}` }
        : { title: 'Wróżba Ayleny', text, url }
      await navigator.share(data)
      return 'shared'
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
  }
  await copyLink(r)
  return 'copied'
}

export async function copyLink(r: Reading) {
  const url = readingLink(r)
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    prompt('Skopiuj link do wróżby:', url)
  }
}
