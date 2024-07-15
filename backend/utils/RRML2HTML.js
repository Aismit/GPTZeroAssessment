function RRML2HTML(rrml) {
  // Replace RRML tags with HTML tags
  let html = rrml
    .replace(/<header>/g, '<h1>')
    .replace(/<\/header>/g, '</h1>')
    .replace(/<subheader>/g, '<h2>')
    .replace(/<\/subheader>/g, '</h2>')
    .replace(/<body>/g, '<p>')
    .replace(/<\/body>/g, '</p>')
    .replace(/<card>/g, '<div class="card">')
    .replace(/<\/card>/g, '</div>');

  // Handle link tags
  html = html.replace(/<link\s+href="([^"]+)">/g, (match, p1) => {
    const closingTagIndex = html.indexOf('</link>', html.indexOf(match));
    if (closingTagIndex !== -1) {
      const linkText = html.slice(html.indexOf('>') + 1, closingTagIndex);
      return `<a href="${p1}">${linkText}</a>`;
    }
    return match; // If no closing tag found, return the original match
  });

  // Remove any remaining </link> tags
  html = html.replace(/<\/link>/g, '');

  return html;
}

module.exports = RRML2HTML;