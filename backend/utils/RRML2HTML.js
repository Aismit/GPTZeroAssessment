const rrmlElementToHtmlElement = {
  body: "p",
  header: "h1",
  subheader: "h2",
  card: "div",
};

const rrmlElementToStyles = {
  card: "style='border: 1px solid black; padding: 20px; margin: 10px 0px; border-radius: 10px;'",
};

const RRML2HTML = (rrml) => {
  if (typeof rrml !== 'string') {
    console.error('Expected a string input to RRML2HTML, but got:', typeof rrml);
    return '';
  }

  let htmlString = rrml;

  // Handle regular RRML tags
  for (const [rrmlTag, htmlTag] of Object.entries(rrmlElementToHtmlElement)) {
    const style = rrmlElementToStyles[rrmlTag];
    const tagRegex = new RegExp(`<${rrmlTag}>([\\s\\S]*?)</${rrmlTag}>`, "g");
    const replacement = style ? `<${htmlTag} ${style}>$1</${htmlTag}>` : `<${htmlTag}>$1</${htmlTag}>`;
    htmlString = htmlString.replace(tagRegex, replacement);
  }

  // Handle link tags
  const linkRegex = /<link\s+href="([^"]+)">([\s\S]*?)<\/link>/g;
  htmlString = htmlString.replace(linkRegex, (match, href, content) => {
    return `<a href="${href}">${content.trim()}</a>`;
  });

  // Handle any remaining unclosed tags
  for (const [rrmlTag, htmlTag] of Object.entries(rrmlElementToHtmlElement)) {
    const unclosedTagRegex = new RegExp(`<${rrmlTag}>([\\s\\S]*?)(?=<${rrmlTag}>|$)`, "g");
    const replacement = style ? `<${htmlTag} ${style}>$1</${htmlTag}>` : `<${htmlTag}>$1</${htmlTag}>`;
    htmlString = htmlString.replace(unclosedTagRegex, replacement);
  }

  return htmlString;
};

module.exports = RRML2HTML;