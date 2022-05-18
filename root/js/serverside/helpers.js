import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';

/**
 * Redirects non-logged-in users to the `'/login'` route.
 * @param {Response} res - Response object, may get redirected
 * @returns `true` if the user was redirected, `false` otherwise.
 */
 function redirectToLogin(req, res) {
	if (!req.session || !req.session.loggedIn) {
		res.redirect("/login");
		return true;
	}
	return false;
}


/**
 * Uses {@link loadHTMLComponent} to inject the header and footer into their tags.
 * @param { JSDOM } baseDOM - DOM object to place template into.
 * @returns { JSDOM } The original DOM object, modified.
 */
async function injectHeaderFooter(baseDOM) {
  const headerSelector  = "header";
  const footerSelector = "footer";

  // Inject the header navigation
  baseDOM = await loadHTMLComponent(baseDOM, headerSelector, headerSelector, "./root/common/navbar.html");
  // Inject the footer navigation
  baseDOM = await loadHTMLComponent(baseDOM, footerSelector, footerSelector, "./root/common/footer.html");
  return baseDOM;
}

/**
 * Loads an HTML component's innerHTML from the filesystem into a DOM object using a selector.
 * @param { JSDOM } baseDOM - DOM object to modify.
 * @param { String } templateSelector - CSS selector of the template element.
 * @param { String } templateSelector - CSS selector of the component element.
 * @param { String } templateLocation - File path to template element location.
 * @returns { JSDOM } The original DOM object, modified.
 */
async function loadHTMLComponent(baseDOM, templateSelector, componentSelector, templateLocation) {
  // Get the placeholder element to replace.
  const placeholderElement = baseDOM.window.document.querySelector(templateSelector) ;
  // Load and parse the requested component.
  const componentFile = await readFile(templateLocation, "utf-8");

  if (componentFile && placeholderElement) {
    const componentDoc = new JSDOM(componentFile).window.document;
    placeholderElement.innerHTML = componentDoc.querySelector(componentSelector).innerHTML;
  }
  return baseDOM;
}

/**
 * Injects a provided script into the given DOM's head.
 * @param { JSDOM } baseDOM - DOM to inject script into
 * @param { String } scriptLocation - Location of script resource
 * @param { String } type - Sets whether the script should be deferred or loaded asynchronously
 */
function injectScript(baseDOM, scriptLocation, type) {
  const doc = baseDOM.window.document;
  let script = doc.createElement("script");
  script.setAttribute("src", scriptLocation);
  if (type) {
    // Default to using async loading if type isn't defined properly.
    type = type.toLowerCase() == "defer" ? "defer" : "async";
    script.toggleAttribute(type);
  }

  doc.head.appendChild(script);
}

/**
 * Injects a stylesheet into the provided DOM.
 * @param { JSDOM } baseDOM - DOM to modify
 * @param { String } stylesheetLocation - Location of stylesheet
 */
function injectStylesheet(baseDOM, stylesheetLocation) {
  const doc = baseDOM.window.document;
  let style = doc.createElement("link");
  style.setAttribute("rel", "stylesheet");
  style.setAttribute("href", stylesheetLocation);

  doc.head.appendChild(style);
}

/**
 * Crafts an SQL query in the format of 
 * "INSERT INTO table (`key_column`, `Recieved fields`, [...]) VALUES (?, [...])
 * ON DUPLICATE KEY UPDATE `recievedFields`}=VALUES(`recievedFields`), [...]"
 * 
 * @author Dakaro Mueller
 * @param {Request} req Request object with a body containing the JSON values under the columns to update.
 * @param {String[]}expectedFields Array of strings matching the expected updatable database columns.
 * @param {String} table Table name to insert / update into.
 * @param {String} key_column Identifying field column name from database.
 * @param {*} key_value Value of key column to insert into or update.
 * @throws Exception if any parameter is "truthy" false.
 */
 function craftInsertUpdateQueryFromRequest(req, expectedFields, table, key_column, key_value) {
  if (!req || !expectedFields || !table || !key_column || !key_value) throw "Null or empty parameter!";
  console.log(req.body);
  
  let query = `INSERT INTO \`${table}\` (\`${key_column}\`, \``;
  
  let fields = getFieldsFromRequest(req, expectedFields);
  let fieldValues = fields.fieldValues;
  let recievedFields = fields.recievedFields;

  query += ") VALUES (?";
  // Append the amount of question marks for the prepared statement from recieved fields
  for (let i = 0; i < recievedFields.length; i++) query += ",?";
  query += ") ON DUPLICATE KEY UPDATE ";

  // Append actually recieved fields to update as {field_name}=VALUES({field_name})
  for (let i = 0; i < recievedFields.length; i++) {
      query += recievedFields[i] +"=VALUES(" + recievedFields[i] + ")";
      query += (i == recievedFields.length - 1) ? ";" : ",";
  }

  console.log(query);
  return query;
}

/**
 * Parses a request for fields from the request body and formats it into a JSON object
 * containing arrays of the fields and their data.
 * @param {*} req 
 * @param {*} expectedFields 
 * @returns JSON object containing a recievedFields array and a fieldValues array.
 */
function getFieldsFromRequest(req, expectedFields) {
  let recievedFields, fieldValues = [];

  // Parse through the req.body for expected props and append like so "[...], `{prop}`[...]";
  for (let prop in req.body) {
    if (expectedFields.includes(prop)) {
      recievedFields.push(prop);
      query += ", `" + prop + "`";
      fieldValues.push(req.body[prop]);
    }
  }
  return { "recievedFields": recievedFields, "fieldValues": fieldValues }
}

// Functions to export out
export {
  injectHeaderFooter,
  injectScript,
  injectStylesheet,
  loadHTMLComponent,
  craftInsertUpdateQueryFromRequest,
  redirectToLogin
};