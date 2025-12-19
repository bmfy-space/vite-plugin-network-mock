export function escapeHtml(str: string): string {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function syntaxHighlight(json: any): string {
  const str = JSON.stringify(json, null, 2)
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key'
          match = match.slice(0, -1) + '</span>:'
          return '<span class="' + cls + '">' + escapeHtml(match.slice(0, -8)) + match.slice(-8)
        } else {
          cls = 'json-string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean'
      } else if (/null/.test(match)) {
        cls = 'json-null'
      }
      return '<span class="' + cls + '">' + escapeHtml(match) + '</span>'
    }
  )
}

export function formatJSON(data: any): string {
  if (!data) return '<span class="json-null">null</span>'
  if (typeof data === 'string') {
    try { data = JSON.parse(data) }
    catch { return escapeHtml(data) }
  }
  return syntaxHighlight(data)
}
