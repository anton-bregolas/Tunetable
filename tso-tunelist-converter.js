////////////////////////////////////////////////
// Declare global variables, create local JSONs
///////////////////////////////////////////////

let noThe = 1;
let tDelay = 0;
let tsoJson = {};
let importJson = {};
let sortedJson = {};

const tuneTable = document.querySelector('#t-tunes');
const infoBox = document.querySelector('.info-box');
const radioBox = document.querySelector('.radio-container');
const inputForm = document.querySelector('#input-form');
const saveBtn = document.querySelector('.n-save-btn');
const helpBtn = document.querySelector('.n-help-btn');
const themeBtn = document.querySelector('.n-theme-btn');
const revertBtn = document.querySelector('.t-revert-btn');
const saveIcon = saveBtn.querySelector('.n-save-icon');
const helpIcon = helpBtn.querySelector('.n-help-icon');
const sunIcon = themeBtn.querySelector('.n-theme-icon-sun');
const moonIcon = themeBtn.querySelector('.n-theme-icon-moon');
const exampleTunebook = document.querySelector('.example-tunebook');
const exampleTunelist = document.querySelector('.example-tunelist');
const inputLabel = document.querySelector('.input-label');

// Display Infobox message or warning

function showInfoMsg(msg, err) {

  let infoMsg = document.createElement("span");
  infoMsg.textContent = msg;
  
  if (err) {
    infoMsg.classList.add("info-error");
  }

  infoBox.textContent = "";
  infoBox.appendChild(infoMsg);

}

// Validate The Session URL

function validateTsoUrl() {

  let tsoUrl = inputForm.value;

  const validTunelist = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btags\b\/.+\/\btunes\b\/?$/;
  const validTunebook = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btunebook\b\/?$/;

  if (validTunelist.test(tsoUrl) || validTunebook.test(tsoUrl)) {

    console.log('URL passed validation');
    return true;
  }    
  console.log('URL failed validation');
  return false;
}

// Make a standard fetch request, throw an error if it fails

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching JSON:', error);
    throw error;
  }
}

// Retrieve JSON data from The Session using async fetch requests
// Display bonus messages if tDelay > 3s, then call createTuneTable()

async function fetchTheSessionJson(url) {
  
  clearJsonData();

  let jsonUrl;

  jsonUrl = url.endsWith("/tunes") || url.endsWith("/tunes/") ?
  `${url}?format=json&perpage=50` :
  `${url}?format=json`;

  showInfoMsg("Fetching tunes from TSO...");
  console.log(`Fetching ${jsonUrl}`);

  try {

    const tsoData = await fetchData(jsonUrl);

    console.log("Fetched page #1 of tune JSON");
    
    importJson = { "tunes": [] };
    
    for (const tune of tsoData.tunes) {
      const { id, name, url, type } = tune;
      importJson.tunes.push({ id, name, url, type });
    } 
    
    const timeStamp1 = new Date();
    tDelay = tsoData.pages > 1 ? Math.floor((+tsoData.pages - 1) / 2.6 * 1000) : 0;
    console.log(`Table processing delay estimated at ${tDelay} ms`);

    if (tsoData.pages > 1) {

      clearTunetable();

      const messagePromise = (async () => {

        if (tDelay > 3000) {
          showInfoMsg("Jaysus, that’s a long list!");
          await msgDelay(1250);
          showInfoMsg("Be patient now.");
          await msgDelay(1250);
          showInfoMsg("Creating Tunetable...");
        } else {
          showInfoMsg("Creating Tunetable...");
        }
      })();
      
      const fetchingPromise = (async () => {

        const tunePages = [];
      
        for (let p = 2; p <= tsoData.pages; p++) {
          let pageUrl = `${jsonUrl}&page=${p}`;
          console.log(`Fetching ${jsonUrl}`);
          tunePages.push(fetchData(pageUrl));
        }
      
        const pageResponses = await Promise.all(tunePages);
      
        for (const pageData of pageResponses) {

          for (const tune of pageData.tunes) {

            const { id, name, url, type } = tune;
            importJson.tunes.push({ id, name, url, type });
          }
        }
      })();
      
      await Promise.all([messagePromise, fetchingPromise]);
    }

    const timeStamp2 = new Date();
    console.log(`Estimated delay: ${tDelay}ms, actual delay: ${timeStamp2 - timeStamp1}ms`);
    createTuneTable(importJson);

    inputForm.value = "";
    saveIcon.setAttribute("style", "opacity: 1");
  } 
    
  catch (error) {

    console.error('Error fetching JSON from The Session:', error);
    showInfoMsg("Fetching data failed, try again!", 1);
  }
}

// Delay the display of bonus messages using new Promise

async function msgDelay(duration) {

  await new Promise(resolve => setTimeout(resolve, duration));
}

// Create Tunetable from nested JSON array of tunes

function createTuneTable(myJson) {

  const myTunes = myJson.tunes;

  tuneTable.textContent = "";
  console.log('Creating tunetable');

  for (let i = 0; i < myTunes.length; i++) {

    const tuneRow = document.createElement("tr");

    for (let j = 0; j < 4; j++) {

      const tuneCell = document.createElement("td");
      const cellSpan = document.createElement("span");
      cellSpan.classList.add("t-cell");

      let cellContent =
        j === 0 ? i + 1 :
        j === 1 ? myTunes[i].name :
        j === 2 ? myTunes[i].id : myTunes[i].url;
      
      if (j === 3) {

        const cellLink = document.createElement("a");
        cellLink.setAttribute("href", cellContent);
        cellLink.setAttribute("target", "_blank");
        cellLink.textContent = cellContent;
        cellSpan.appendChild(cellLink);
      
      } else {

        cellSpan.textContent = cellContent;
      }

      tuneCell.appendChild(cellSpan);
      tuneRow.appendChild(tuneCell);
    }

    tuneTable.appendChild(tuneRow);
  }

  showInfoMsg("Hup!");
  console.log('Tunetable created');
}

// Check if a nested JSON array of tunes is missing or empty

function checkIfEmptyJson(checkJson) {

  if (Array.isArray(checkJson.tunes) && checkJson.tunes.length) { 

    return false 
  } 

  return true 
}

// Create a deep copy of the JSON specified

function createDeepCopyJson(rawJson) {

  return JSON.parse(JSON.stringify(rawJson));

}

// Sort Tunetable: Iterate through a nested JSON array of tunes, call processTuneTitle()
// After it moves or cuts articles, reorder tunes by name and return sorted JSON.

function sortTunetable(myJson) {

  console.log("Sorting tune JSON");

  sortedJson = createDeepCopyJson(myJson);

  let myTunes = sortedJson.tunes;

  for (let i of myTunes) {
    i.name = processTuneTitle(i.name);
  }
    
  myTunes.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return sortedJson;
}

// Process tune titles according to the selected Sort setting

function processTuneTitle(title) {

  let newTitle = title;

  if (title.startsWith("The ")) {

    if (noThe === 1 || noThe === 3) {

      return newTitle = title.slice(4) + ', The';
    } 

    return newTitle = title.slice(4);

  } else if (title.startsWith("An ") && (noThe > 2)) {

    return newTitle = noThe < 4? title.slice(3) + ', An' : title.slice(3);

  } else if (title.startsWith("A ")) {

    if (noThe === 1 || noThe === 3) {

      return newTitle = title.slice(2) + ', A';
    } 

    return title.slice(2);
                         
  }
  
  return newTitle;
}

// Export tune data in JSON format

function exportTuneData(myJson) {

  const currentJson = JSON.stringify(myJson, null, 2);
  const fileName = "myTuneData.json"
  let tuneBlob = new Blob([currentJson], { type: "application/json" });
  let tuneLink = document.createElement("a");

  tuneLink.href = URL.createObjectURL(tuneBlob);
  tuneLink.download = fileName;
  document.body.appendChild(tuneLink);

  tuneLink.click();
  document.body.removeChild(tuneLink);

}

// Clear local JSONs with tunes

function clearJsonData() {

  importJson = {};
  sortedJson = {};
  saveIcon.setAttribute("style", "opacity: 0.5");
  console.log("Tune data cleared");

}

// Clear Tunetable if it exists, else clear Infobox

function clearTunetable() {

  if (!checkIfEmptyJson(importJson)) {

    tuneTable.textContent = "";
    showInfoMsg("Tunetable cleared!");
    console.log("Tunetable cleared");

  } else {
    infoBox.textContent = '';
  }

  inputForm.value = "";

}

// Show or hide help menu

function toggleHelpMenu() {
  
  hideSortMenu();
  helpIcon.classList.toggle("active");
  inputLabel.classList.toggle("displayed");
}

// Hide Sort options menu

function hideSortMenu() {

  if (radioBox.classList.contains("displayed-flex")) {
    
    radioBox.classList.remove("displayed-flex");
  }
}

//////////////////////////////////////////////
// Add listeners to buttons and radio buttons
/////////////////////////////////////////////

function initButtons() {

  const generateTunetableBtn = document.querySelector('.t-gen-btn');

  generateTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    hideSortMenu();

    if (inputForm.value) {

      if (validateTsoUrl()) {

        fetchTheSessionJson(inputForm.value);
  
      } else {
        
        showInfoMsg("It’s not a link we’re looking for!", 1);
      }

    } else {
      showInfoMsg("Don’t be shy, input a link!", 1);
    }
  });

  const clearTunetableBtn = document.querySelector('.t-clr-btn');
  
  clearTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    hideSortMenu();
    clearTunetable();
    clearJsonData();
    
  });

  const sortTunetableBtn = document.querySelector('.t-sort-btn');

  sortTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (inputLabel.classList.contains("displayed")) {
      toggleHelpMenu();
    }

    if (checkIfEmptyJson(importJson)) {

      return showInfoMsg("No tunes to sort!", 1);

    } else if (radioBox.classList.contains("displayed-flex")) {

      hideSortMenu();
      createTuneTable(sortTunetable(importJson));
      showInfoMsg("Sorted!");
      return;

    } else {

      radioBox.classList.add("displayed-flex");
      return;
    }

  });

  const radioBtn = document.querySelectorAll('input[name="t-radio-btn"]');

  for (let k = 0; k < 4; k++) {
    radioBtn[k].addEventListener("change", function() {
      showInfoMsg(`Sorting style #${this.value} picked`);
      return noThe = +this.value;
    });
  }

  const hideSortMenuBtn = document.querySelector('.r-hide-sort-btn');

  hideSortMenuBtn.addEventListener('click', () => {

    hideSortMenu();
  });

  const tuneCells = document.querySelector("#t-tunes");
  const tuneTableUrlBtn = document.querySelector("#t-head-url");

  tuneTableUrlBtn.addEventListener('click', () => {

    if (window.screen.width >= 720) {
      tuneCells.querySelectorAll(".t-cell").forEach(cell => {

        cell.hasAttribute("style")? 
          cell.removeAttribute("style") :
            cell.setAttribute("style", "margin-right: 0");
      });
    }
  });

  saveBtn.addEventListener('click', () => {

    if (!checkIfEmptyJson(sortedJson)) {

      showInfoMsg("Tune data exported!");
      exportTuneData(sortedJson);

    } else if (!checkIfEmptyJson(importJson)) {

      showInfoMsg("Tune data exported!");
      exportTuneData(importJson);
    } else {
      showInfoMsg("No tune data to export!", 1);
    }
  });

  themeBtn.addEventListener('click', () => {
    
    document.body.classList.toggle("light");
    sunIcon.classList.toggle("hidden");
    moonIcon.classList.toggle("displayed");

  });

  helpBtn.addEventListener('click', () => {

    toggleHelpMenu();
  });

  exampleTunebook.addEventListener('click', () => {

    inputForm.value = "https://thesession.org/members/1/tunebook";
    toggleHelpMenu();
  });

  exampleTunelist.addEventListener('click', () => {

    inputForm.value = "https://thesession.org/members/1/tags/SliabhLuachra/tunes";
    toggleHelpMenu();
  });

  revertBtn.addEventListener('click', () => {

    if (!checkIfEmptyJson(importJson)) {

      createTuneTable(importJson);
      showInfoMsg("Reverted to TSO defaults!");
    }
  });

}

//////////////////////////////////////////////
// Initiate necessary functions on page load
/////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
  initButtons();

});
