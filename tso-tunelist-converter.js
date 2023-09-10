import { cleanTsoAbc } from './modules/abc-cleaner.js';

///////////////////////////////////////////////
// Declare global variables, create user JSONs
//////////////////////////////////////////////

let noThe = 0;
let noAn = 0;
let sortStyle = 0;
let tDelay = 0;
let appBusy = 0;
let showMeter = 0;
let showType = 0;
let showKeys = 0;
let showAbc = 0;
let tsoJson = {};
let importJson = {};
let sortedJson = {};

// Navigation menu elements

const saveBtn = document.querySelector('.n-save-btn');
const helpBtn = document.querySelector('.n-help-btn');
const themeBtn = document.querySelector('.n-theme-btn');
const saveIcon = saveBtn.querySelector('.n-save-icon');
const helpIcon = helpBtn.querySelector('.n-help-icon');
const sunIcon = themeBtn.querySelector('.n-theme-icon-sun');
const moonIcon = themeBtn.querySelector('.n-theme-icon-moon');
const allBtn = document.querySelectorAll('.t-btn');
const exampleTunebook = document.querySelector('.example-tunebook');
const exampleTunelist = document.querySelector('.example-tunelist');
const exampleSetbook = document.querySelector('.example-setbook');
const exampleSetlist = document.querySelector('.example-setlist');

// Accordion menu elements

const accMainWrapper = document.querySelector('#acc-main-wrapper');
const accMainHeader = document.querySelector('#acc-main-wrapper h2');
const accSubHeader = document.querySelectorAll('.help-menu-subhead');
const accHelpMenu = document.querySelector('.acc-help-menu');
const accMenuIntro = document.querySelector('.acc-menu-intro');
const accWrappers = document.querySelectorAll('.acc-wrapper');

// Input form elements

const inputForm = document.querySelector('#input-form');
const generateTunetableBtn = document.querySelector('.t-gen-btn');
const clearTunetableBtn = document.querySelector('.t-clr-btn');
const sortTunetableBtn = document.querySelector('.t-sort-btn');
const goSortBtn = document.querySelector('.r-go-sort-btn');
const hideSortMenuBtn = document.querySelector('.r-hide-sort-btn');
const sortMenu = document.querySelector('.sort-menu-container');
const radioBox = document.querySelector('.radio-container');
const inputLabel = document.querySelector('.input-label');
const radioBtnOrder = document.querySelectorAll('input[name="sortstyle"]');
const radioBtnNoThe = document.querySelectorAll('input[name="nothestyle"]');
const radioBtnNoAn = document.querySelectorAll('input[name="noanstyle"]');
const showTypeBox = document.querySelector('#add-type');
const showKeysBox = document.querySelector('#add-keys');
const showAbcBox = document.querySelector('#add-abc');

// Tunetable elements

const tableWrapper = document.querySelector('#tunetable');
const tuneTable = tableWrapper.querySelector('#t-tunes');
const tuneTableHeaders = tableWrapper.querySelector('#t-headers');
const saveJsonBtn = tableWrapper.querySelector('#t-head-no');
const tuneTableNameBtn = tableWrapper.querySelector(".t-head-name-btn");
const tuneTableIdBtn = tableWrapper.querySelector("#t-head-id");
const idMeterTxt = tableWrapper.querySelector("#t-head-id > button");
const tuneTableUrlBtn = tableWrapper.querySelector("#t-head-url");
const urlAbcTxt = tableWrapper.querySelector("#t-head-url > button");
const revertBtn = tableWrapper.querySelector('.t-revert-btn');

// Infobox elements

const infoBox = document.querySelector('.info-box');

//////////////////////////////////////////////////////////
// Functions: Messages, checks, fetching, sorting, saving
/////////////////////////////////////////////////////////

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

  let tsoUrl = inputForm.value.trim();

  const validTunelist = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btags\b\/.+\/\btunes\b\/?$/;
  const validTunebook = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btunebook\b\/?$/;
  const validSetbook = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\bsets\b\/?$/;
  const validSetlist = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btags\b\/.+\/\btunesets\b\/?$/;

  if (validTunelist.test(tsoUrl) || validTunebook.test(tsoUrl) || 
  validSetbook.test(tsoUrl) || validSetlist.test(tsoUrl)) {

    console.log('URL passed validation');
    return true;
  }
  
  console.log('URL failed validation');
  return false;
}

// Check if The Session URL contains sets of tunes

function checkIfSetsUrl(url) {

  if (url.endsWith("/sets") || url.endsWith("/sets/") ||
  url.endsWith("/tunesets") || url.endsWith("/tunesets/")) {

    return true;
  }

  return false;
}

// Disable input form buttons

function disableButtons() {

  generateTunetableBtn.setAttribute("disabled", '');
  clearTunetableBtn.setAttribute("disabled", '');
  sortTunetableBtn.setAttribute("disabled", '');
  goSortBtn.setAttribute("disabled", '');
  showTypeBox.setAttribute("disabled", '');
  showKeysBox.setAttribute("disabled", '');
  showAbcBox.setAttribute("disabled", '');
}

// Reactivate input form buttons

function enableButtons() {

  generateTunetableBtn.removeAttribute("disabled");
  clearTunetableBtn.removeAttribute("disabled");
  sortTunetableBtn.removeAttribute("disabled");
  goSortBtn.removeAttribute("disabled");
  showTypeBox.removeAttribute("disabled");
  showKeysBox.removeAttribute("disabled");
  showAbcBox.removeAttribute("disabled");
}

// Make a standard fetch request, throw an error if it fails

async function fetchData(url, type) {
  try {
    const response = await fetch(url);

    let data;

    if (!response.ok) {

      let errorMessage;

      if (response.status < 500) {

        errorMessage = "Broken link or else, check URL!";

      } else {

        errorMessage = "Server error. Give TSO a break!";
      }

      console.error("HTTP error code:", response.status);

      showInfoMsg(errorMessage, 1);

      throw new Error(errorMessage);
    }

    if (type === "json") {

      data = await response.json();

    } else if (type === "text") {

      data = await response.text();

    } else {

      console.error("Invalid data type passed to Fetch!");
      throw error;
    }

    return data;

  } catch (error) {

    console.error("Fetching data failed! Error rethrown.");
    throw error;
  }
}

// Retrieve JSON data from The Session using async fetch requests
// Display bonus messages if tDelay > 3s, then call createTuneTable()

async function fetchTheSessionJson(url) {

  let jsonUrl;
  let errorMessage;

  appBusy = 1;
  disableButtons();

  jsonUrl = url.endsWith("/tunes") || url.endsWith("/tunes/") || checkIfSetsUrl(url) ?
  `${url}?format=json&perpage=50` :
  `${url}?format=json`;

  if (url.startsWith("http:")) {

    jsonUrl = jsonUrl.replace("http:", "https:");
  }

  showInfoMsg("Fetching tunes from TSO...");
  console.log(`Fetching ${jsonUrl}`);

  try {

    const tsoData = await fetchData(jsonUrl, "json");

    if (checkIfJsonHasTunes(tsoData) || checkIfJsonHasSets(tsoData)) {

      clearJsonData();
      clearTunetable();
      clearCheckboxData();

      if (!checkIfSetsUrl(url)) {
      
        importJson = { "tunes": [] };
        
        for (const tune of tsoData.tunes) {

          const { id, name, url, type } = tune;
          importJson.tunes.push({ id, name, url, type });
        } 

        console.log("Fetched page #1 of Tunes JSON");

      } else if (checkIfSetsUrl(url)) {

        importJson = { "sets": [] };

        for (const set of tsoData.sets) {

          const { id, name, url, settings } = set;
          importJson.sets.push({ id, name, url, settings });
        } 

        console.log("Fetched page #1 of Sets JSON");

      } else {

        errorMessage = "No tunes or sets found! Check URL";
        throw new Error(errorMessage);
      }

    } else {

      console.error("Found empty tune/set array, link corrupted or list missing:", jsonUrl);
      errorMessage = "No tune data found! Check URL";
      throw new Error(errorMessage);
    }

    const timeStamp1 = Date.now();
    tDelay = tsoData.pages > 1 ? Math.floor((+tsoData.pages - 1) / 2.6 * 1000) : 0;
    console.log(`Table processing delay estimated at ${tDelay} ms`);

    if (tsoData.pages > 1) {

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
          tunePages.push(fetchData(pageUrl, "json"));
        }
      
        const pageResponses = await Promise.all(tunePages);
      
        for (const pageData of pageResponses) {

          if (checkIfJsonHasTunes(pageData)) {

            for (const tune of pageData.tunes) {

              const { id, name, url, type } = tune;
              importJson.tunes.push({ id, name, url, type });
            } 

          } else if (checkIfJsonHasSets(pageData)) {

            for (const set of pageData.sets) {

              const { id, name, url, settings } = set;
              importJson.sets.push({ id, name, url, settings });
            }
          }
        }
      })();
      
      await Promise.all([messagePromise, fetchingPromise]);
    }

    const timeStamp2 = Date.now();
    console.log(`Estimated delay: ${tDelay}ms, actual delay: ${timeStamp2 - timeStamp1}ms`);
    createTuneTable(importJson);

    inputForm.value = "";
    saveIcon.setAttribute("style", "opacity: 1");

    appBusy = 0;
    enableButtons();
  } 

  catch (error) {

    errorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
     error.message || "Fetching data failed, try again!";

    console.error("Error fetching JSON from The Session:", error);
    
    showInfoMsg(errorMessage, 1);

    appBusy = 0;

    enableButtons();
    
    return;
  }
}

// Delay the display of bonus messages using new Promise

async function msgDelay(duration) {

  await new Promise(resolve => setTimeout(resolve, duration));
}

// Retrieve JSON data from The Session using async fetch requests
// Display bonus messages if tDelay > 3s, then call createTuneTable()

async function fetchAbcIncipit(tuneId) {

  let tuneUrl = `https://thesession.org/tunes/${tuneId}?format=json`

  let errorMessage;

  appBusy = 1;
  disableButtons();
  saveIcon.setAttribute("style", "opacity: 0.5");

  try {

    showInfoMsg(`Fetching data from TSO...`);
    console.log(`Fetching ABC from ${tuneUrl}...`);

    const tsoTuneData = await fetchData(tuneUrl, "json");

    if (Array.isArray(tsoTuneData.settings) && tsoTuneData.settings.length > 0) {

      console.log("Extracting ABC incipit and key from TSO tune...");

      const abc = tsoTuneData.settings[0].abc;
      const key = tsoTuneData.settings[0].key.slice(0, 4);
      const abcBars = cleanTsoAbc(abc);
      const incipit = `[${key}] ${abcBars}`;
      console.log("Done fetching ABC incipit and tune key");

      appBusy = 0;
      enableButtons();
      saveIcon.removeAttribute("style");

      return incipit;

    } else {

      errorMessage = "Tune ABC missing or empty!";
      throw new Error(errorMessage);
    }
  }

  catch (error) {

    errorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
     error.message || "Fetching data failed, try again!";

    console.error("Error fetching ABC incipits and keys from The Session:", error);
    
    showInfoMsg(errorMessage, 1);

    appBusy = 0;
    enableButtons();
    saveIcon.removeAttribute("style");

    return;
  }
}

// Preload ABC incipits into Tune JSON based on Tune ID and JSON type

async function loadAbcIncipits() {

  let myJson;
  let dataType;
  
  if (checkIfJsonHasTunes(importJson)) {

    myJson = importJson;
    dataType = myJson.tunes;

  } else if (checkIfJsonHasSets(importJson)) {

    myJson = importJson;
    dataType = myJson.sets;

  } else {

    showInfoMsg("No tune data found! Re-generate Tunetable", 1);
    return;
  }

  appBusy = 1;
  disableButtons();

  const abcJson = await fetchData("https://raw.githubusercontent.com/anton-bregolas/TSO-Tunelist-Converter/deploy/abc.json", "json");

  if (checkIfJsonHasTunes(myJson)) {

    if (!myJson.tunes[0].abc) {

      console.log("Loading incipits and keys from local ABC JSON...");

      for (let l = 0; l < myJson.tunes.length; l++) {

        let tune = myJson.tunes[l];
        const tuneId = tune.id;
        let incipit = abcJson[tuneId] === undefined? await fetchAbcIncipit(tuneId) : abcJson[tuneId];
        const key = incipit.slice(1, 5);
        const abcBars = incipit.slice(7);

        if (!tune.key) {
          tune["key"] = key;
        }
        if (!tune.abc) {
          tune["abc"] = abcBars;
        }
      }

      console.log("ABC incipits and keys added to Tune JSON");
    }

  } else if (checkIfJsonHasSets(myJson)) {

    if (!myJson.sets[0].settings[0].abc) {

      console.log("Loading incipits from local ABC JSON...");

      for (let m = 0; m < myJson.sets.length; m++) {

        for (let n = 0; n < myJson.sets[m].settings.length; n++) {

            let tune = myJson.sets[m].settings[n];
            const setTuneUrl = tune.url.split("#", 1)[0];
            const tuneId = setTuneUrl.split("/")[4];
            const incipit = abcJson[tuneId] === undefined? await fetchAbcIncipit(tuneId) : abcJson[tuneId];
            const abcSetBars = incipit.slice(7);

            if (!tune.abc) {
              tune["abc"] = abcSetBars;
            }
            if (!tune.key) {
              tune["key"] = incipit.slice(1, 5);
            }
        }
      }

      console.log("ABC incipits added to Set JSON");
    }

  } else {

    showInfoMsg("No tune data found!", 1);
    console.error("Failed to preload ABC incipits!");
    appBusy = 0;
    enableButtons();
    return;
  }

  if (showKeys === 1 && checkIfJsonHasTunes(myJson)) {

    showInfoMsg("ABC incipits & keys preloaded");

  } else {

    showInfoMsg("ABC incipits preloaded");
  }

  appBusy = 0;
  enableButtons();
  return;
}

// Create Tunetable from nested JSON array of tunes

function createTuneTable(myJson) {

  tuneTable.textContent = "";
  console.log('Creating tunetable');
  appBusy = 1;

  let myData;
  let myTuneId;

  if (checkIfJsonHasTunes(myJson)) {

    myData = myJson.tunes;

  } else if (checkIfJsonHasSets(myJson)) {

    myData = myJson.sets;

  } else {

    showInfoMsg("No tune data found!", 1);
    return;
  }

  for (let i = 0; i < myData.length; i++) {

    const tuneRow = document.createElement("tr");

    for (let j = 0; j < 4; j++) {

      const tuneCell = document.createElement("td");
      
      let cellType = 
        j === 0? "t-cell-no" :
        j === 1? "t-cell-name" :
        j === 2? "t-cell-id" : 
        showAbc === 1? "t-cell-abc" : "t-cell-url";

      tuneCell.classList.add(cellType);

      const cellSpan = document.createElement("span");
      cellSpan.classList.add("t-cell-span");
      
      let myDataId = showMeter? getTuneMeter(myJson, i) : myData[i].id;

      let myDataName;

      if (checkIfJsonHasSets(myJson) && myJson === importJson) {

        myDataName = "";
    
        for (let k = 0; k < myData[i].settings.length; k++) {
  
          let tuneName = myData[i].settings[k].name;
          let tuneKey = myData[i].settings[k].key;
  
          myDataName += k === (myData[i].settings.length - 1)? tuneName + ` (${tuneKey})` : 
          tuneName + ` (${tuneKey})` + " / ";
        }

      } else {

        myDataName = myData[i].name;
      }

      let myDataUrlAbc = '';

      if (showAbc === 1) {

        urlAbcTxt.textContent = "ABC";

        if (checkIfJsonHasTunes(myJson)) {

          myDataUrlAbc = myData[i].abc;

        } else if (checkIfJsonHasSets(myJson)) {

          for (let l = 0; l < myData[i].settings.length; l++) {
  
            myDataUrlAbc += l === (myData[i].settings.length - 1)? 
            myData[i].settings[l].abc : myData[i].settings[l].abc + ' // ';
  
          }
        }

      } else {

        urlAbcTxt.textContent = "URL";
        myDataUrlAbc = myData[i].url;
      }

      let cellContent =
        j === 0 ? i + 1 :
        j === 1 ? myDataName :
        j === 2 ? myDataId : myDataUrlAbc;
      
      if (j === 3 && showAbc === 0) {

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
    tuneTable.addEventListener('click', expandTuneNames);
  }

  showInfoMsg("Hup!");
  console.log('Tunetable created');
  appBusy = 0;
}

// Check if a nested JSON array of tunes is missing or empty

function checkIfJsonHasTunes(checkJson) {

  if (Array.isArray(checkJson.tunes) && checkJson.tunes.length > 0) { 

    return true; 
  } 

  return false; 
}

// Check if a nested JSON array of sets is missing or empty

function checkIfJsonHasSets(checkJson) {

  if (Array.isArray(checkJson.sets) && checkJson.sets.length > 0) { 

    return true; 
  } 

  return false; 
}

// Check if a nested JSON array of tunes / sets has ABC incipits

function checkIfJsonHasAbc(checkJson) {

  if (checkIfJsonHasTunes(checkJson)) {

    if (checkJson.tunes[0].abc) {
      
      return true; 
    }
  }

  else if (checkIfJsonHasSets(checkJson)) { 

    if (checkJson.sets[0].settings[0].abc) {
      
      return true; 
    }
  } 

  return false; 
}

// Create a deep copy of the JSON specified

function createDeepCopyJson(rawJson) {

  return JSON.parse(JSON.stringify(rawJson));

}

function checkIfTableEmpty() {

  if (tuneTable.textContent === "") {

    return true;
  } 

  return false;
}

// Sort Tunetable: Iterate through a nested JSON array of tunes, call processTuneTitle()
// After it moves or cuts articles, reorder tunes by name and return sorted JSON.

function sortTunetable(myJson) {

  sortedJson = createDeepCopyJson(myJson);

  let myData;
  
  if (checkIfJsonHasTunes(sortedJson)) {

    console.log("Sorting Tune JSON");

    myData = sortedJson.tunes;

    for (let i of myData) {

      i.name = processTuneTitle(i.name, i.type, i.key);
    }

  } else if (checkIfJsonHasSets(sortedJson)) {

    console.log("Sorting Set JSON");

    myData = sortedJson.sets;

    for (let j of myData) {

      j.name = "";

      for (let k = 0; k < j.settings.length; k++) {

        let tuneName = j.settings[k].name;
        let tuneType = j.settings[k].type;
        let tuneKey = j.settings[k].key;

        tuneName = processTuneTitle(tuneName, tuneType, tuneKey);
        j.name += k === j.settings.length - 1? tuneName : tuneName + " / ";
      }
    }

  } else {

    showInfoMsg("No tune data found!", 1);
    return;
  }

  if (sortStyle > 1) {

    myData.sort((a, b) => {
    
      return a.name.localeCompare(b.name);
    });
  } 
  
  if (sortStyle === 3) {

    showMeter = 1;
    idMeterTxt.textContent = "M";
    
    if (myData == sortedJson.tunes) {

    myData.sort((a, b) => {
    
      return a.type.localeCompare(b.type);
    });

    } else if (myData == sortedJson.sets) {

      myData.sort((a, b) => {
      
        return a.settings[0].type.localeCompare(b.settings[0].type);
      });
    }
  }

  return sortedJson;
}

// Process tune titles according to the selected Sort setting

function processTuneTitle(title, type, key) {

  let newTitle = title;

  if (noThe > 0) {

    if (title.startsWith("The ")) {

      if (noThe === 1) {

        newTitle = title.slice(4) + ', The';

      } else if (noThe === 2) {

        newTitle = title.slice(4);
      }
    }
  }

  if (noAn > 0) {

    if (title.startsWith("An ")) {

      if (noAn === 1) {

        newTitle = title.slice(3) + ', An' ;
      
      } else if (noAn === 2) {

        newTitle = title.slice(3);
      }
    }
  }

  if (noThe > 0 || noAn > 0) {

    if (title.startsWith("A ")) {

      if (noThe === 1 || noAn === 1) {

        newTitle = title.slice(2) + ', A';

      } else {

        newTitle = title.slice(2);
      }
    }
  }
  
  if (showType === 1) {

    newTitle += ` (${type.charAt(0).toUpperCase() + type.slice(1)})`;
  } 
  
  if (showKeys === 1) {

    newTitle += ` (${key})`;
  }
  
  return newTitle;
}

// Determine tune's meter according to its "type" property

function calcTuneMeter(tuneType) {

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

  } else if (tuneType === "three-two") {

    return "3/2";

  } else {

    return "N/A";
  }
}

// For tunes, get the specific tune's meter using calcTuneMeter()
// For sets, get the meter of the first tune in the set

function getTuneMeter(data, i) {

  if (checkIfJsonHasTunes(data)) {

    return calcTuneMeter(data.tunes[i].type);

  } else {

    return calcTuneMeter(data.sets[i].settings[0].type);
  }
}

// Toggle & fill in cell values of ID / Meter column

function toggleIdMeter() {

  let cellValue;
  let tableRows = tuneTable.getElementsByTagName('tr');
  let myJson;
  let dataType;
  
  if (checkIfJsonHasTunes(sortedJson)) {

    myJson = sortedJson;
    dataType = myJson.tunes;

  } else if (checkIfJsonHasTunes(importJson)) {

    myJson = importJson;
    dataType = myJson.tunes;

  } else if (checkIfJsonHasSets(sortedJson)){

    myJson = sortedJson;
    dataType = myJson.sets;

  } else if (checkIfJsonHasSets(importJson)) {

    myJson = importJson;
    dataType = myJson.sets;

  } else {

    return;
  }

  for (let i = 0; i < tableRows.length; i++) {

    let tuneRow = tableRows[i];
    let tuneCell = tuneRow.getElementsByTagName('td')[2];
    let textSpan = tuneCell.querySelector('.t-cell-span');

    if (showMeter === 0) {

      cellValue = dataType[i].id;
    
    } else {

      cellValue = getTuneMeter(myJson, i);
    }

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
    headerText + ' '.repeat(spacesToAdd) + '\t';
  }

  let tableContent = tableHeaders + '\n\n';

  for (let i = 0; i < tableRows.length; i++) {

    const tableCells = tableRows[i].getElementsByTagName('td');

    for (let j = 0; j < tableCells.length; j++) {

      const cellText = tableCells[j].textContent;
      const spacesToAdd = tableWidths[j] - cellText.length + 1;
      tableContent += j === tableCells.length - 1? cellText : 
      cellText + ' '.repeat(spacesToAdd) + '\t';
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

  if (!checkIfTableEmpty()) {

    tuneTable.textContent = "";
    showInfoMsg("Tunetable cleared!");
    console.log("Tunetable cleared");

  } else {
    infoBox.textContent = "";
  }

  inputForm.value = "";

}

// Check if any of the sorting styles are selected

function radioChecked() {

  let sortOptions = document.getElementsByName("sortstyle");

  for (let i = 0; i < sortOptions.length; i++) {
  
    if (sortOptions[i].checked) {

        return true;
    }
  }

  return false;
}

// Uncheck all sorting options checkboxes

function clearCheckboxData() {

  showTypeBox.checked = false;
  showKeysBox.checked = false;
  showAbcBox.checked = false;

  showType = 0;
  showKeys = 0;
  showAbc = 0;
}

// Clear checked radio button and sorting style value

function clearSortMenu() {

  if (sortStyle > 0) {
    sortStyle = 0;
    document.querySelector('input[name="sortstyle"]:checked').checked = false;
    console.log("Sorting style cleared");
  }
}

// Show or hide help menu

function toggleHelpMenu() {
  
  hideSortMenu();
  helpIcon.classList.toggle("active");
  accMainWrapper.classList.toggle("unwrapped");
}

// Hide Sort options menu

function hideSortMenu() {

  if (sortMenu.classList.contains("displayed")) {
    
    sortMenu.classList.remove("displayed");
  }
}

// Expand or collapse the Tunetable cells specified

function toggleTunetable(cells) {

  tuneTable.querySelectorAll(cells).forEach(cell => {

      cell.hasAttribute("style")? 
        cell.removeAttribute("style") :
          cell.setAttribute("style", "max-width: 65svw");
          
  });
}

// Expand the Tunetable cells specified

function expandTunetable(cells) {

  tuneTable.querySelectorAll(cells).forEach(cell => {

    if (!cell.hasAttribute("style")) {

      cell.setAttribute("style", "max-width: 65svw");  
    }
    
  });
}

// Collapse the Tunetable cells specified

function shrinkTunetable(cells) {

  tuneTable.querySelectorAll(cells).forEach(cell => {
      
    if (cell.hasAttribute("style")) {

        cell.removeAttribute("style");
    }

  });
}

// Expand tune cells vertically by toggling white-space

function expandTuneNames() {

  tuneTable.querySelectorAll('td:nth-child(even) .t-cell-span').forEach(cellspan => {

    if (cellspan.hasAttribute("style")) {

        cellspan.removeAttribute("style");

    } else {

        cellspan.setAttribute("style", "white-space: normal");
    }
  })
}

//////////////////////////////////////////////
// Add listeners to buttons and radio buttons
/////////////////////////////////////////////

function initButtons() {

  // Create Tunetable button

  generateTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    hideSortMenu();

    if (inputForm.value) {

      if (validateTsoUrl()) {

        localStorage.setItem("inputUrl", inputForm.value);
        fetchTheSessionJson(inputForm.value.trim());
  
      } else {
        
        showInfoMsg("It’s not a link we’re looking for!", 1);
      }

    } else {
      showInfoMsg("Don’t be shy, input a link!", 1);
    }
  });

  // Clear Tunetable and all data button
  
  clearTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    hideSortMenu();
    clearSortMenu();
    clearTunetable();
    clearJsonData();
    clearCheckboxData();
    
  });

  // Open Sort Tunetable menu options button

  sortTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (accMainWrapper.classList.contains("unwrapped")) {
      toggleHelpMenu();
    }

    if (!checkIfJsonHasTunes(importJson) && !checkIfJsonHasSets(importJson)) {

      return showInfoMsg("No tunes to sort!", 1);
 
    } else if (sortMenu.classList.contains("displayed")) {

      hideSortMenu();
      return;

    } else {

      sortMenu.classList.add("displayed");
    }
  });

  // Apply Sort menu settings with Go button

  goSortBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (!appBusy) {

      if (!checkIfJsonHasTunes(importJson) && !checkIfJsonHasSets(importJson)) {

        return showInfoMsg("No tunes to sort!", 1);
  
      } else if (sortStyle > 0) {

        hideSortMenu();
        createTuneTable(sortTunetable(importJson));
        showInfoMsg("Sorted!");
        return;

      } else if (sortStyle === 0) {
      
        showInfoMsg("Select sorting method!");
        return;

      } else {

        return;
      }

    } else {

      showInfoMsg("Wait for tune data to load!", 1);
    }
  });

  // Toggle Sort menu options with radio buttons

  for (let s = 0; s < 3; s++) {
    radioBtnOrder[s].addEventListener("change", function() {
      showInfoMsg(`Sorting style: #${this.value}. Sort?`);
      return sortStyle = +this.value;
    });
  }

  for (let t = 0; t < 3; t++) {
    radioBtnNoThe[t].addEventListener("change", function() {
      return noThe = +this.value;
    });
  }

  for (let u = 0; u < 3; u++) {
    radioBtnNoAn[u].addEventListener("change", function() {
      return noAn = +this.value;
    });
  }

  // Toggle tune type display option for the Tunetable 

  showTypeBox.addEventListener("change", (event) => {
  
    if (!appBusy) {

      return showType = event.currentTarget.checked? 1 : 0;

    } else {

      showInfoMsg("Wait for tune data to load!", 1);
    }
  });

  // Toggle tune key display option for the Tunetable 

  showKeysBox.addEventListener("change", (event) => {

    if (!appBusy) {   

      if (checkIfJsonHasTunes(importJson) && !checkIfJsonHasAbc(importJson)) {

        loadAbcIncipits();
      }

      showKeys = event.currentTarget.checked? 1 : 0;

      return;

    } else {

      showInfoMsg("Wait for tune data to load!", 1);
    }
  });

  // Toggle ABC incipits option for the Tunetable 

  showAbcBox.addEventListener("change", (event) => {

    if (!appBusy) {

      if (event.currentTarget.checked) {

        showAbc = 1;

        if (!checkIfJsonHasAbc(importJson)) {

          loadAbcIncipits();
        }

        return;

      } else {

        showAbc = 0;
        return;
      }

    } else {

      showInfoMsg("Wait for tune data to load!", 1);
    }
  });

  // Hide Sort menu options

  // hideSortMenuBtn.addEventListener('click', (event) => {

  //   event.preventDefault();
  //   hideSortMenu();
  // });

  // Expand / shrink Tunetable's Name column on click

  tuneTableNameBtn.addEventListener('click', () => {

    if (!checkIfTableEmpty()) {

      if (window.screen.width >= 720) {

        shrinkTunetable(`td:nth-child(4)`);
        toggleTunetable(`td:nth-child(2)`);
      } 
    }
  });

  // Expand / shrink Tunetable's URL column on click

  tuneTableUrlBtn.addEventListener('click', () => {

    if (!checkIfTableEmpty()) {

      if (window.screen.width >= 720) {
        
        shrinkTunetable(`td:nth-child(2)`);
        toggleTunetable(`td:nth-child(4)`);
      } 
    }
  });

  // Show Tune ID / Meter toggle button

  tuneTableIdBtn.addEventListener('click', () => {

    if (!appBusy) {
    
      showMeter = !showMeter? 1 : 0;
      idMeterTxt.textContent = !showMeter? "ID" : "M";

      if (!checkIfTableEmpty()) {
        
        toggleIdMeter();
      } 

      return;
    }

    showInfoMsg("Wait for Tunetable to load!", 1);
  });

  // Save Tune data in JSON format button

  saveJsonBtn.addEventListener('click', () => {

    if (!appBusy) {

      if (checkIfJsonHasTunes(sortedJson) || checkIfJsonHasSets(sortedJson)) {

        showInfoMsg("Tune data exported!");
        exportTuneData(sortedJson);
        console.log("Tune data exported");
        return;

      } else if (checkIfJsonHasTunes(importJson) || checkIfJsonHasSets(importJson)) {

        showInfoMsg("Tune data exported!");
        exportTuneData(importJson);
        console.log("Tune data exported");
        return;

      } else {
        showInfoMsg("No tune data to export!", 1);
        return;
      }
    }

    showInfoMsg("Wait for Tunetable to load!", 1);
  });

  // Save Tunetable data in plain text format button

  saveBtn.addEventListener('click', () => {

    if (!appBusy) {

      if (!checkIfTableEmpty()) {

        showInfoMsg("Tunetable exported!");
        console.log("Tunetable exported");
        exportTuneTable();
        return;

      } else {

        showInfoMsg("No Tunetable to export!", 1);
        return;
      }
    } 
    
    showInfoMsg("Wait for Tunetable to load!", 1);
  });


  // Light / dark theme toggle button

  themeBtn.addEventListener('click', () => {
    
    document.body.classList.toggle("light");
    sunIcon.classList.toggle("hidden");
    moonIcon.classList.toggle("displayed");

  });

  // Show / hide help menu button

  [accMainHeader, helpBtn].forEach(btn => {
    
    btn.addEventListener('click', () => {
      toggleHelpMenu();
    });
  });

  // Unwrap / wrap accordion menu item

  accWrappers.forEach(myWrapper => {

    const myMenuSubhead = myWrapper.querySelector(".help-menu-subhead");

    myMenuSubhead.addEventListener('click', function() {

      if (accMenuIntro.classList.contains("unwrapped")) {
        accMenuIntro.classList.remove("unwrapped");
      }

      accWrappers.forEach(wrapper => {

        const menuSubhead = wrapper.querySelector(".help-menu-subhead");

        if (wrapper.classList.contains("unwrapped") && wrapper !== myWrapper) {
          wrapper.classList.remove("unwrapped");
          menuSubhead.classList.remove("highlighted");
        }
      });

      if (!myWrapper.classList.contains("unwrapped")) {

        myWrapper.classList.add("unwrapped");
        myMenuSubhead.classList.add("highlighted");

      } else {

        myWrapper.classList.remove("unwrapped");
        myMenuSubhead.classList.remove("highlighted");
        accMenuIntro.classList.add("unwrapped");
      }
    });
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

  // Input example Setbook button

  exampleSetbook.addEventListener('click', () => {

    inputForm.value = "https://thesession.org/members/1/sets";
    toggleHelpMenu();
  });

  // Input example list of tagged sets button

  exampleSetlist.addEventListener('click', () => {

    inputForm.value = "https://thesession.org/members/1/tags/StarAboveTheGarter/tunesets";
    toggleHelpMenu();
  });

  // Revert Tunetable & JSON data to unsorted original button

  revertBtn.addEventListener('click', () => {

    if (!appBusy) {

      if (!checkIfTableEmpty()) {

        clearSortMenu();
        sortedJson = {};
        createTuneTable(importJson);
        showInfoMsg("Reverted to TSO defaults!");
        return;

      } else {

        showInfoMsg("No tune data found!", 1);
        return;
      }
    }

    showInfoMsg("Wait for Tunetable to load!", 1);

  });

  // Trigger animations / transitions of selected buttons & their elements

  ['mouseover', 'focusin'].forEach(event => {

    allBtn.forEach(btn => {

      btn.addEventListener(event, () => {

        btn.classList.add('hovered');

        let btnText = btn.querySelector('.t-btn-text');
        let btnIcon = btn.querySelector('.app-icon');

        btnText?.classList.add('enlarged');
        btnIcon?.classList.add('enlarged');

      })
    });
  });

  ['mouseout', 'focusout'].forEach(event => {

    allBtn.forEach(btn => {

      btn.addEventListener(event, () => {

        btn.classList.remove('hovered');

        let btnText = btn.querySelector('.t-btn-text');
        let btnIcon = btn.querySelector('.app-icon');

        btnText?.classList.remove('enlarged');
        btnIcon?.classList.remove('enlarged');

      })
    });
  });

  // Expand or collapse Tunetable automatically on 
  // device screen orientation change (phone rotation)

  screen.orientation.addEventListener('change', (event) => {

    if (!checkIfTableEmpty()) {

      if (event.target.type === "portrait-primary" || event.target.type === "portrait-secondary") {

        if (window.screen.width < 720) {

          shrinkTunetable("td");

        } 
        
      } else if (event.target.type === "landscape-primary" || event.target.type === "landscape-secondary") {
      
        if (window.screen.width >= 720) {

          shrinkTunetable(`td:nth-child(4)`);
          expandTunetable(`td:nth-child(2)`);
        }

      } else {

        return;
      }
    }
  });

}

//////////////////////////////////////////////
// Initiate necessary functions on page load
/////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
  inputForm.value = localStorage.getItem("inputUrl");
  initButtons();
  showInfoMsg("Hi there! Got any tunes?");
});
