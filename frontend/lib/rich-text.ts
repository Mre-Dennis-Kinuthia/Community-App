const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "div",
  "span",
  "img",
])

const SEMANTIC_BLOCK_RE = /<(ul|ol|li|h[1-6]|blockquote)\b/i

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

/** Unescape HTML that was stored as entities (e.g. &lt;p&gt;). */
export function decodeStoredRichText(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || looksLikeHtml(trimmed)) return trimmed
  if (!/&lt;\/?[a-z]/i.test(trimmed)) return trimmed
  return trimmed
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function looksLikeMarkdown(value: string): boolean {
  const text = value.trim()
  if (!text || looksLikeHtml(text)) return false

  return (
    /^#{1,6}\s+/m.test(text) ||
    /^\s*[-*+]\s+/m.test(text) ||
    /^\s*\d+\.\s+/m.test(text) ||
    /\*\*[^*\n]+\*\*/.test(text) ||
    /(?:^|[^*])\*[^*\n]+\*(?:[^*]|$)/.test(text) ||
    /\[[^\]]+\]\([^)]+\)/.test(text) ||
    /^>\s+/m.test(text) ||
    /`[^`\n]+`/.test(text) ||
    /^```/m.test(text)
  )
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inlineMarkdown(text: string): string {
  let html = escapeHtml(text)
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>")
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>")
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const href = String(url).trim()
    if (!/^https?:\/\//i.test(href)) return label
    return `<a href="${href}" rel="noopener noreferrer" target="_blank">${label}</a>`
  })
  return html
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim().startsWith("```")) {
      const codeLines: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(escapeHtml(lines[index]))
        index += 1
      }
      blocks.push(`<pre><code>${codeLines.join("\n")}</code></pre>`)
      index += 1
      continue
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^(#{1,6})/)?.[1].length ?? 1
      const tag = `h${Math.min(level, 3)}`
      blocks.push(
        `<${tag}>${inlineMarkdown(line.replace(/^#{1,6}\s+/, ""))}</${tag}>`
      )
      index += 1
      continue
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(
          `<li>${inlineMarkdown(lines[index].replace(/^\s*[-*+]\s+/, ""))}</li>`
        )
        index += 1
      }
      blocks.push(`<ul>${items.join("")}</ul>`)
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(
          `<li>${inlineMarkdown(lines[index].replace(/^\s*\d+\.\s+/, ""))}</li>`
        )
        index += 1
      }
      blocks.push(`<ol>${items.join("")}</ol>`)
      continue
    }

    if (/^>\s+/.test(line)) {
      const quoteLines: string[] = []
      while (index < lines.length && /^>\s+/.test(lines[index])) {
        quoteLines.push(inlineMarkdown(lines[index].replace(/^>\s+/, "")))
        index += 1
      }
      blocks.push(`<blockquote><p>${quoteLines.join("<br />")}</p></blockquote>`)
      continue
    }

    if (!line.trim()) {
      index += 1
      continue
    }

    const paragraphLines: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^>\s+/.test(lines[index]) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraphLines.push(inlineMarkdown(lines[index]))
      index += 1
    }
    blocks.push(`<p>${paragraphLines.join("<br />")}</p>`)
  }

  return blocks.join("")
}

export function plainTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

function styleWrappers(style: string): string[] {
  const value = style.toLowerCase()
  const wrappers: string[] = []
  if (/font-weight\s*:\s*(bold|[6-9]00)/.test(value)) wrappers.push("strong")
  if (/font-style\s*:\s*italic/.test(value)) wrappers.push("em")
  if (/text-decoration[^;]*underline/.test(value)) wrappers.push("u")
  return wrappers
}

function wrapWith(tags: string[], inner: string): string {
  return tags.reduceRight((html, tag) => `<${tag}>${html}</${tag}>`, inner)
}

/** Convert Docs/Word inline styles to semantic tags before sanitizing. */
export function normalizePastedHtml(html: string): string {
  let out = html
    .replace(/<!--StartFragment-->/gi, "")
    .replace(/<!--EndFragment-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?meta[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?head[^>]*>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "")
    .replace(/<\/?o:[^>]*>/gi, "")
    .replace(/<b\b[^>]*font-weight:\s*normal[^>]*>([\s\S]*?)<\/b>/gi, "$1")
    .replace(/<strong\b[^>]*font-weight:\s*normal[^>]*>([\s\S]*?)<\/strong>/gi, "$1")

  for (let i = 0; i < 8; i++) {
    const next = out.replace(
      /<span\b([^>]*)>([\s\S]*?)<\/span>/gi,
      (_match, attrs: string, inner: string) => {
        const style = /style\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? ""
        const wrappers = styleWrappers(style)
        return wrappers.length ? wrapWith(wrappers, inner) : inner
      }
    )
    if (next === out) break
    out = next
  }

  return out
}

function isSafeHref(href: string): boolean {
  if (!href) return false
  if (/^(javascript|vbscript|data):/i.test(href)) return false
  return /^https?:\/\//i.test(href) || href.startsWith("/") || href.startsWith("#")
}

function isSafeImageSrc(src: string): boolean {
  if (!src) return false
  if (/^(javascript|vbscript):/i.test(src)) return false
  return (
    /^https?:\/\//i.test(src) ||
    src.startsWith("/api/images/") ||
    src.startsWith("data:image/")
  )
}

function walkSanitized(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent ?? "")
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ""

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  if (tag === "br") return "<br />"
  if (tag === "script" || tag === "style" || tag === "iframe") return ""

  if (tag === "img") {
    const src = el.getAttribute("src")?.trim() ?? ""
    if (!isSafeImageSrc(src) || src.startsWith("data:")) return ""
    const alt = escapeHtml(el.getAttribute("alt") ?? "")
    return `<img src="${escapeHtml(src)}" alt="${alt}" />`
  }

  const style = el.getAttribute("style") ?? ""
  if (
    (tag === "b" || tag === "strong") &&
    /font-weight\s*:\s*normal/i.test(style)
  ) {
    return Array.from(el.childNodes).map(walkSanitized).join("")
  }

  const inner = Array.from(el.childNodes).map(walkSanitized).join("")
  const wrappers = styleWrappers(style)
  const wrapped = wrapWith(wrappers, inner)

  if (!ALLOWED_TAGS.has(tag) || tag === "span" || tag === "div") {
    return wrapped
  }

  if (tag === "a") {
    const href = el.getAttribute("href")?.trim() ?? ""
    if (!isSafeHref(href)) return wrapped
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${wrapped}</a>`
  }

  return `<${tag}>${wrapped}</${tag}>`
}

export function sanitizeRichTextHtml(html: string): string {
  const normalized = normalizePastedHtml(html)
  if (!normalized.trim()) return ""

  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(normalized, "text/html")
    return Array.from(doc.body.childNodes).map(walkSanitized).join("")
  }

  return normalized
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
}

export function isEmptyRichText(value: string | null | undefined): boolean {
  return !richTextToPlainText(value)
}

/** Normalize stored copy (HTML, markdown, or plain text) for safe display. */
export function prepareRichTextContent(value: string | null | undefined): string {
  const raw = decodeStoredRichText(value ?? "").trim()
  if (!raw) return ""
  if (looksLikeHtml(raw)) return sanitizeRichTextHtml(raw)
  if (looksLikeMarkdown(raw)) return sanitizeRichTextHtml(markdownToHtml(raw))
  return sanitizeRichTextHtml(plainTextToHtml(raw))
}

export function richTextToPlainText(value: string | null | undefined, maxLength?: number): string {
  const raw = decodeStoredRichText(value ?? "").trim()
  if (!raw) return ""
  const html = looksLikeHtml(raw)
    ? raw
    : looksLikeMarkdown(raw)
      ? markdownToHtml(raw)
      : plainTextToHtml(raw)
  const plain = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-3]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim()

  if (!maxLength || plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`
}

export function pasteClipboardToHtml(clipboardData: DataTransfer): string {
  const html = clipboardData.getData("text/html")?.trim()
  const plain = clipboardData.getData("text/plain") ?? ""

  if (html) {
    const sanitized = sanitizeRichTextHtml(html)
    if (looksLikeMarkdown(plain) && !SEMANTIC_BLOCK_RE.test(sanitized)) {
      return sanitizeRichTextHtml(markdownToHtml(plain))
    }
    return sanitized
  }

  const trimmed = plain.trim()
  if (!trimmed) return ""
  if (looksLikeMarkdown(trimmed)) {
    return sanitizeRichTextHtml(markdownToHtml(trimmed))
  }
  return sanitizeRichTextHtml(plainTextToHtml(trimmed))
}
