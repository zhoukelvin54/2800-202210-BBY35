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
  loadHTMLComponent,
  craftInsertUpdateQueryFromRequest,
  redirectToLogin
};