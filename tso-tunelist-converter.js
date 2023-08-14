////////////////////////////////////////////////
// Declare global variables, create local JSONs
///////////////////////////////////////////////

let noThe = 0;
let tDelay = 0;
let showMeter = 0;
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
const tuneTableHeaders = document.querySelector('#t-headers');
const saveTuneTableBtn = document.querySelector('#t-head-no');

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
      
      const myTunesIdMeter = showMeter? getTuneMeter(myTunes[i].type) : myTunes[i].id;

      let cellContent =
        j === 0 ? i + 1 :
        j === 1 ? myTunes[i].name :
        j === 2 ? myTunesIdMeter : myTunes[i].url;
      
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

function checkIfEmptyTable() {

  if (tuneTable.textContent === "") {

    return true;
  } 

  return false;
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

  if (noThe > 0) {

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
  }
  
  return newTitle;
}

function getTuneMeter(tuneType) {

  if (tuneType === "reel" || tuneType === "hornpipe" || 
  tuneType === "barndance" || tuneType === "strathspey" || 
  tuneType === "march") {
    
    return "4/4";

  } else if (tuneType === "jig") {

    return "6/8";

  } else if (tuneType === "polka") {

    return "2/4";

  } else if (tuneType === "slide") {

    return "12/8";

  } else if (tuneType === "waltz" || tuneType === "mazurka") {

    return "3/4";

  } else if (tuneType === "slip jig") {

    return "9/8";

  } else if (tuneType === "three-two" || "mazurka") {

    return "3/2";
  }
}

// Toggle & fill in cell values of ID / Meter column

function toggleIdMeter() {

  let cellValue;
  let tableRows = tuneTable.getElementsByTagName('tr');
  let myJson = !checkIfEmptyJson(sortedJson)? sortedJson : importJson;

  for (let i = 0; i < tableRows.length; i++) {

    let tuneRow = tableRows[i];
    let tuneCell = tuneRow.getElementsByTagName('td')[2];
    let textSpan = tuneCell.querySelector('.t-cell');

    cellValue = showMeter === 0? myJson.tunes[i].id : getTuneMeter(myJson.tunes[i].type);

    textSpan.textContent = cellValue;
  }
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

// Export Tunetable in plain text format, adding relative indentation

function exportTuneTable() {

  const tableRows = tuneTable.getElementsByTagName('tr');
  const tableWidths = new Array(tuneTable.rows[0].cells.length).fill(0);

  let tableHeaders = "";
  let headersList = !showMeter? ["#", "Name", "ID", "URL"] : ["#", "Name", "M", "URL"];

  tableWidths[2] = 2;

  for (let f = 0; f < tableRows.length; f++) {

    const tableCells = tableRows[f].getElementsByTagName('td');

    for (let g = 0; g < tableCells.length; g++) {

      tableWidths[g] = Math.max(tableWidths[g], tableCells[g].textContent.length);
    }
  }

  for (let h = 0; h < headersList.length; h++) {

    const headerText = headersList[h];
    const spacesToAdd = tableWidths[h] - headerText.length + 1;
    tableHeaders += h === (headersList.length - 1)? headerText : 
    headerText + ' '.repeat(spacesToAdd) + '\t\t';
  }

  let tableContent = tableHeaders + '\n\n';

  for (let i = 0; i < tableRows.length; i++) {

    const tableCells = tableRows[i].getElementsByTagName('td');

    for (let j = 0; j < tableCells.length; j++) {

      const cellText = tableCells[j].textContent;
      const spacesToAdd = tableWidths[j] - cellText.length + 1;
      tableContent += j === tableCells.length - 1? cellText : 
      cellText + ' '.repeat(spacesToAdd) + '\t\t';
    }

    tableContent += '\n';
  }

  const txtName = "myTuneTable.txt";
  let tuneTableBlob = new Blob([tableContent], { type: "text/plain" });
  let tuneTableLink = document.createElement("a");

  tuneTableLink.href = URL.createObjectURL(tuneTableBlob);
  tuneTableLink.download = txtName;
  document.body.appendChild(tuneTableLink);

  tuneTableLink.click();
  document.body.removeChild(tuneTableLink);

}

// Clear Tunetable if it exists, else clear Infobox

function clearTunetable() {

  if (!checkIfEmptyTable()) {

    tuneTable.textContent = "";
    showInfoMsg("Tunetable cleared!");
    console.log("Tunetable cleared");

  } else {
    infoBox.textContent = "";
  }

  inputForm.value = "";

}

// Clear checked radio button and sorting style value

function clearSortMenu() {

  if (noThe > 0) {
    noThe = 0;
    document.querySelector('input[name="t-radio-btn"]:checked').checked = false;
    console.log("Sorting menu cleared");
  }
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

  // Create Tunetable button

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

  // Clear Tunetable and all data button

  const clearTunetableBtn = document.querySelector('.t-clr-btn');
  
  clearTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    hideSortMenu();
    clearSortMenu();
    clearTunetable();
    clearJsonData();
    
  });

  // Sort Tunetable with Sort menu options button

  const sortTunetableBtn = document.querySelector('.t-sort-btn');

  sortTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (inputLabel.classList.contains("displayed")) {
      toggleHelpMenu();
    }

    if (checkIfEmptyTable()) {

      return showInfoMsg("No tunes to sort!", 1);

    } else if (radioBox.classList.contains("displayed-flex") && noThe > 0) {

      hideSortMenu();
      createTuneTable(sortTunetable(importJson));
      showInfoMsg("Sorted!");
      return;

    } else if (radioBox.classList.contains("displayed-flex") && noThe === 0) {
    
      showInfoMsg("Select sorting method!");
      return;

    } else {

      radioBox.classList.add("displayed-flex");
      return;
    }

  });

  // Toggle Sort menu options with radio buttons

  const radioBtn = document.querySelectorAll('input[name="t-radio-btn"]');

  for (let k = 0; k < 4; k++) {
    radioBtn[k].addEventListener("change", function() {
      showInfoMsg(`Sorting style #${this.value} picked`);
      return noThe = +this.value;
    });
  }

  // Hide Sort menu options

  const hideSortMenuBtn = document.querySelector('.r-hide-sort-btn');

  hideSortMenuBtn.addEventListener('click', () => {

    hideSortMenu();
  });

  // Expand / shrink Tunetable URL button

  const tuneCells = document.querySelector("#t-tunes");
  const tuneTableUrlBtn = document.querySelector("#t-head-url");

  tuneTableUrlBtn.addEventListener('click', () => {

    if (!checkIfEmptyTable()) {

      if (window.screen.width >= 720) {
        tuneCells.querySelectorAll(".t-cell").forEach(cell => {

          cell.hasAttribute("style")? 
            cell.removeAttribute("style") :
              cell.setAttribute("style", "margin-right: 0");
        });
      }
    }
  });

  // Show Tune ID / Meter toggle button
  
  const tuneTableIdBtn = document.querySelector("#t-head-id");

  tuneTableIdBtn.addEventListener('click', () => {

    showMeter = !showMeter? 1 : 0;
    tuneTableIdBtn.textContent = !showMeter? "ID" : "M";

    if (!checkIfEmptyTable()) {
      
      toggleIdMeter();
      return;
    } 
  });

  // Save Tune data in JSON format button

  saveBtn.addEventListener('click', () => {

    if (!checkIfEmptyJson(sortedJson)) {

      showInfoMsg("Tune data exported!");
      exportTuneData(sortedJson);
      console.log("Tune data exported");

    } else if (!checkIfEmptyJson(importJson)) {

      showInfoMsg("Tune data exported!");
      exportTuneData(importJson);
      console.log("Tune data exported");
    } else {
      showInfoMsg("No tune data to export!", 1);
    }
  });

  // Save Tunetable data in plain text format button

  saveTuneTableBtn.addEventListener('click', () => {

    if (!checkIfEmptyTable()) {

      showInfoMsg("Tunetable exported!");
      console.log("Tunetable exported");
      exportTuneTable();

    } else {

      showInfoMsg("No Tunetable to export!", 1);
    }
  });


  // Light / dark theme toggle button

  themeBtn.addEventListener('click', () => {
    
    document.body.classList.toggle("light");
    sunIcon.classList.toggle("hidden");
    moonIcon.classList.toggle("displayed");

  });

  // Show / hide help menu button

  helpBtn.addEventListener('click', () => {

    toggleHelpMenu();
  });

  // Input example Tunebook button

  exampleTunebook.addEventListener('click', () => {

    inputForm.value = "https://thesession.org/members/1/tunebook";
    toggleHelpMenu();
  });

  // Input example Tunelist of tagged tunes button

  exampleTunelist.addEventListener('click', () => {

    inputForm.value = "https://thesession.org/members/1/tags/SliabhLuachra/tunes";
    toggleHelpMenu();
  });

  // Revert Tunetable & JSON data to unsorted original button

  revertBtn.addEventListener('click', () => {

    if (!checkIfEmptyTable()) {

      clearSortMenu();
      sortedJson = {};
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
