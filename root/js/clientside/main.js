// Contains JS relavent to ALL pages!
onReady(hookNavToggler);

/**
 * Adds an click event listener to the nav toggler element.
 * @returns Early if there is no nav toggler element
 */
function hookNavToggler() {
  let toggler = document.getElementById("nav_toggler");
  if (!toggler) return;
  
  document.getElementById("nav_toggler").addEventListener("click", () => {
    document.getElementById("nav_links_group").classList.toggle("hidden");
  });
}

/**
 * Calls a function when the DOMs content is fully loaded into memory.
 * @param {*} callback - function to run once DOM is loaded.
 */
function onReady(callback) {
  if (document.readyState != "loading") callback();
  else document.addEventListener("DOMContentLoaded", callback);
}