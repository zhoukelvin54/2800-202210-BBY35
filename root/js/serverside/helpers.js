import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';

/**
 * Uses {@link loadHTMLComponent} to inject the header and footer into their tags.
 * @param { jsdom.JSDOM } baseDOM - DOM object to place template into.
 * @returns { jsdom.JSDOM } The original DOM object, modified.
 */
async function injectHeaderFooter(baseDOM) {
  // Inject the header navigation
  baseDOM = await loadHTMLComponent(baseDOM, "header", "/common/navbar.html");
  // Inject the footer navigation
  baseDOM = await loadHTMLComponent(baseDOM, "footer", "/common/footer.html");
}

/**
 * Loads an HTML component from the filesystem into a DOM object using a selector.
 * @param { jsdom.JSDOM } baseDOM - DOM object to modify.
 * @param { String } templateSelector - CSS selector of the template element.
 * @param { String } templateLocation - File path to template element location.
 * @returns { jsdom.JSDOM } The original DOM object, modified.
 */
async function loadHTMLComponent(baseDOM, templateSelector, templateLocation) {
  // Get the placeholder element to replace.
  const placeholderElement = baseDOM.window.document.querySelector(templateSelector) ;
  // Load and parse the requested component.
  const componentFile = await readFile(templateLocation, "utf-8");
  const componentDoc = JSDOM.parse(componentFile).window.document;

  placeholderElement.innerHTML = componentDoc.firstElementChild.innerHTML;
  return baseDOM;
}

export { injectHeaderFooter, loadHTMLComponent };