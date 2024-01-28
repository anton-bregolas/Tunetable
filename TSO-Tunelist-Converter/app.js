///////////////////////////////////////////////////////////////////////
// Tunetable main module v.1.9.1 
// 
// Currently deployed version: 
// https://github.com/anton-bregolas/TSO-Tunelist-Converter/tree/deploy
//
// Latest Tunetable version: 
// https://github.com/anton-bregolas/TSO-Tunelist-Converter/tree/main
// 
///////////////////////////////////////////////////////////////////////

import { fetchTheSessionJson, loadAbcIncipits } from './modules/abc-fetcher.js';
import { toggleAriaExpanded, toggleAriaHidden, toggleTabIndex } from './modules/aria-tools.js';
import { checkIfJsonHasAbc, checkIfJsonHasSets, checkIfJsonHasTunes, createDeepCopyJson } from './modules/json-tools.js';
import { validateTsoUrl } from './modules/url-validator.js';

//////////////////////////////////////////////////////////////////
// Declare global variables and constants, set default user JSONs
/////////////////////////////////////////////////////////////////

const CACHE_NAME = 'tunetable-cache-v.1.9.1.4';

let noThe = 0;
let noAn = 0;
let sortStyle = 0;
let appBusy = 0;
let showMeter = 0;
let importJson = {};
let sortedJson = {};

// Navigation menu elements

const logoLnk = document.querySelectorAll('.logo-link');
const saveBtn = document.querySelector('.n-save-btn');
const helpBtn = document.querySelector('.n-help-btn');
const themeBtn = document.querySelector('.n-theme-btn');
const saveIcon = saveBtn.querySelector('.n-save-icon');
const helpIcon = helpBtn.querySelector('.n-help-icon');
const sunIcon = themeBtn.querySelector('.n-theme-icon-sun');
const moonIcon = themeBtn.querySelector('.n-theme-icon-moon');
const githubDark = document.querySelector('.github-icon-dark');
const githubLight = document.querySelector('.github-icon-light');
const allBtn = document.querySelectorAll('.t-btn');

// Accordion help menu elements

const accMainWrapper = document.querySelector('#acc-main-wrapper');
const accMainHeader = accMainWrapper.querySelector('#help-menu-opener');
const accHelpMenu = accMainWrapper.querySelector('#help-menu-accordion');
const accMenuIntro = accMainWrapper.querySelector('.acc-menu-intro');
const accMenuIntroText = accMainWrapper.querySelector('#help-menu-intro-content');
const accWrappers = accMainWrapper.querySelectorAll('.acc-wrapper');
const accSubHeaders = accMainWrapper.querySelectorAll('.help-menu-subhead');
const exampleTunebook = accMainWrapper.querySelector('#example-tunebook');
const exampleTunelist = accMainWrapper.querySelector('#example-tunelist');
const exampleSetbook = accMainWrapper.querySelector('#example-setbook');
const exampleSetlist = accMainWrapper.querySelector('#example-setlist');
const accWrapBtn = accMainWrapper.querySelector('#help-menu-close');

// Input form elements

export const inputForm = document.querySelector('#input-form');
const generateTunetableBtn = document.querySelector('.t-gen-btn');
const clearTunetableBtn = document.querySelector('.t-clr-btn');
const sortTunetableBtn = document.querySelector('.t-sort-btn');
const goSortBtn = document.querySelector('.r-go-sort-btn');
const sortMenu = document.querySelector('#sort-menu-options');
const radioBtnOrder = document.querySelectorAll('input[name="sortstyle"]');
const radioBtnNoThe = document.querySelectorAll('input[name="nothestyle"]');
const radioBtnNoAn = document.querySelectorAll('input[name="noanstyle"]');
const showTypeBox = document.querySelector('#add-type');
const showKeysBox = document.querySelector('#add-keys');
const showAbcBox = document.querySelector('#add-abc');
const advOptionsBtn = document.querySelector('#sort-more-button');
const advOptionsBox = document.querySelector('#sort-more-options');
const useShorterAbcBox = document.querySelector('#use-shorter-abc');
export const alwaysUseAbcBox = document.querySelector('#use-abc-default');
export const alwaysUseKeysBox = document.querySelector('#use-keys-default');
const alwaysUseTypeBox = document.querySelector('#use-type-default');

// Tunetable elements

const tableWrapper = document.querySelector('#tunetable');
const tuneTable = tableWrapper.querySelector('#t-tunes');
const saveJsonBtn = tableWrapper.querySelector('#t-head-no');
const tuneTableNameBtn = tableWrapper.querySelector(".t-head-name-btn");
const tuneTableIdBtn = tableWrapper.querySelector("#t-head-id");
const idMeterTxt = tableWrapper.querySelector("#t-head-id > button");
const tuneTableUrlBtn = tableWrapper.querySelector("#t-head-url");
const urlAbcTxt = tableWrapper.querySelector("#t-head-url > button");
const revertBtn = tableWrapper.querySelector('.t-revert-btn');

// Infobox elements

const infoBox = document.querySelector('.info-box');
const infoBoxBtn = document.querySelector('.info-box-btn');

// Cached link box elements

const offlineBox = document.querySelector('.offline-links-box');

////////////////////////////////////////////////////
// General functions: Button actions, info messages
///////////////////////////////////////////////////

// Display Infobox message or warning

export function showInfoMsg(msg, err) {

  let infoMsg = document.createElement("span");
  infoMsg.textContent = msg;
  
  if (err) {
    infoMsg.classList.add("info-error");
  }

  infoBox.textContent = "";
  infoBox.appendChild(infoMsg);

}

// Disable input form buttons

export function disableButtons() {

  generateTunetableBtn.setAttribute("disabled", '');
  clearTunetableBtn.setAttribute("disabled", '');
  sortTunetableBtn.setAttribute("disabled", '');
  goSortBtn.setAttribute("disabled", '');
  showTypeBox.setAttribute("disabled", '');
  showKeysBox.setAttribute("disabled", '');
  showAbcBox.setAttribute("disabled", '');
  useShorterAbcBox.setAttribute("disabled", '');
  alwaysUseAbcBox.setAttribute("disabled", '');
  revertBtn.setAttribute("disabled", '');
  saveIcon.removeAttribute("style");
}

// Reactivate input form buttons

export function enableButtons() {

  generateTunetableBtn.removeAttribute("disabled");
  clearTunetableBtn.removeAttribute("disabled");
  sortTunetableBtn.removeAttribute("disabled");
  goSortBtn.removeAttribute("disabled");
  useShorterAbcBox.removeAttribute("disabled");
  alwaysUseAbcBox.removeAttribute("disabled");
  revertBtn.removeAttribute("disabled");

  if (!alwaysUseTypeBox.checked) {

    showTypeBox.removeAttribute("disabled");
  }

  if (!alwaysUseKeysBox.checked) {

    showKeysBox.removeAttribute("disabled");
  }

  if (!alwaysUseAbcBox.checked) {

    showAbcBox.removeAttribute("disabled");
  }
}

// Make fetch request, then create Tunetable on successful Generate button click

async function generateTunetableSequence() {

  try {

    disableButtons();

    importJson = await fetchTheSessionJson(inputForm.value.trim());

    enableButtons();

    inputForm.value = "";

    if (checkIfJsonHasTunes(importJson) || checkIfJsonHasSets(importJson)) {

      createTuneTable(importJson);

      await generateOfflineLinks();

      sortTunetableBtn.focus();

    }

  } catch (error) {
    
    console.error("Generate Tunetable sequence failed");
    showInfoMsg(error.message || "No tunes loaded! Try again", 1);
    displayOfflineMenu();
    enableButtons();
  }
}

// Preload ABC incipits as soon as ABC or Keys checkbox is checked

async function abcPreloadSequence() {

  disableButtons();

  try {

    await loadAbcIncipits(importJson);

    if (checkIfJsonHasTunes(importJson)) {

      showInfoMsg("ABC incipits & keys preloaded");

    } else {

      showInfoMsg("ABC incipits preloaded");
    }

  } catch (error) {

    console.error("ABC preload sequence failed");
    showInfoMsg(error.message || "Something went wrong!", 1);
    displayOfflineMenu();
  }

  enableButtons();
  saveIcon.setAttribute("style", "opacity: 1");
}

// Create a list of tunelists available for offline use

async function generateOfflineLinks() {

  try {

    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const cachedLinks = new Set();

    offlineBox.textContent = '';

    console.log("Retrieving offline links from cache...")

    requests.forEach((request) => {

      const url = new URL(request.url);

      if (url.origin === "https://thesession.org" && url.pathname.startsWith("/members")) {
        cachedLinks.add(url.pathname.slice(8));
      }
    });

    cachedLinks.forEach((link) => {
      const buttonLink = document.createElement('button');
      buttonLink.classList.add("offline-link", "glowing", "wide");
      buttonLink.textContent = `\u2026${link}`;

      buttonLink.addEventListener('click', () => {
        inputForm.value = `https://thesession.org/members${link}`;
        toggleOfflineMenu();
        hideSortMenu();
        inputForm.focus();
      });

      offlineBox.appendChild(buttonLink);
    });

    console.log("Offline links inserted below Infobox");

  } catch (error) {

    console.error('Error generating offline links:', error);
  }
}

// Show or hide offline links menu

function toggleOfflineMenu() {

  if (offlineBox.hasChildNodes()) {

    if (offlineBox.classList.contains("displayed")) {

      offlineBox.classList.remove("displayed");
    
    } else {
  
      offlineBox.classList.add("displayed");
    }
  
    toggleAriaExpanded(infoBoxBtn);
    toggleAriaHidden(offlineBox);
  }
}

// Show offline links menu

function displayOfflineMenu() {

  if (offlineBox.hasChildNodes() && !offlineBox.classList.contains("displayed")) {

    offlineBox.classList.add("displayed");
    toggleAriaExpanded(infoBoxBtn);
    toggleAriaHidden(offlineBox);
  }
}

//////////////////////////////////////////////////////////////
// Tunetable functions: Creating, sorting, modifying contents
/////////////////////////////////////////////////////////////

// Create Tunetable from nested JSON array of tunes

export function createTuneTable(myJson) {

  tuneTable.textContent = "";
  console.log('Creating tunetable');
  appBusy = 1;

  let myData;

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
        showAbcBox.checked? "t-cell-abc" : "t-cell-url";

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
          let tuneType = myData[i].settings[k].type;
          let nameAdditions = alwaysUseTypeBox.checked? 
            ` (${tuneKey}) (${tuneType.charAt(0).toUpperCase() + tuneType.slice(1)})` : 
              ` (${tuneKey})`;
  
          myDataName += k === (myData[i].settings.length - 1)? tuneName + nameAdditions : 
          tuneName + nameAdditions + " / ";
        }

      } else if (checkIfJsonHasTunes(myJson) && myJson === importJson) {

        let tuneKey = myData[i].key;
        let tuneType = myData[i].type;
        let nameAdditions = "";

        if (alwaysUseKeysBox.checked) {

          nameAdditions += tuneKey? ` (${tuneKey})` : '';
        }

        if (alwaysUseTypeBox.checked) {

          nameAdditions += ` (${tuneType.charAt(0).toUpperCase() + tuneType.slice(1)})`;
        }

        myDataName = myData[i].name + nameAdditions;

      } else {

        myDataName = myData[i].name;
      }

      let myDataUrlAbc = '';

      if (showAbcBox.checked || alwaysUseAbcBox.checked) {

        urlAbcTxt.textContent = "ABC";

        if (checkIfJsonHasTunes(myJson)) {

          myDataUrlAbc = myData[i].abc? myData[i].abc : "N/A";

        } else if (checkIfJsonHasSets(myJson)) {

          for (let l = 0; l < myData[i].settings.length; l++) {

            if (myData[i].settings[l].abc) {

              let tuneAbc = myData[i].settings[l].abc;

              if (useShorterAbcBox.checked) {

                tuneAbc = tuneAbc?.split("|", 2).join("|");
              }
    
              myDataUrlAbc += l === (myData[i].settings.length - 1)? 
              tuneAbc : tuneAbc + ' // ';

            } else {

              myDataUrlAbc = "N/A";
            }
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
      
      if (j === 3 && !showAbcBox.checked && !alwaysUseAbcBox.checked) {

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
    tuneTable.setAttribute("tabindex", 0);
    tuneTable.addEventListener('keydown', event => {
      if (/^(32)$/.test(event.which)) {
        event.preventDefault();
        tuneTable.click();
      }
    });
  }

  showInfoMsg("Hup! Tunetable is ready");
  console.log('Tunetable created');
  saveIcon.setAttribute("style", "opacity: 1");
  appBusy = 0;
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
    idMeterTxt.setAttribute("aria-label", "Tune meter");
    
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

  if (showKeysBox.checked || alwaysUseKeysBox.checked) {

    newTitle += key? ` (${key})` : '';
  }
  
  if (showTypeBox.checked || alwaysUseTypeBox.checked) {

    newTitle += ` (${type.charAt(0).toUpperCase() + type.slice(1)})`;
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

  if (window.getSelection().toString().length === 0) {

    tuneTable.querySelectorAll('td:nth-child(even) .t-cell-span').forEach(cellspan => {

      if (cellspan.hasAttribute("style")) {

          cellspan.removeAttribute("style");

      } else {

          cellspan.setAttribute("style", "white-space: normal");
      }
    })
  }
}

///////////////////////////////////////////////////////////////////
// Export data functions: Saving Tunetable contents and JSON files
//////////////////////////////////////////////////////////////////

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

// Export Tunetable in plain text format, adding relative indentation

function exportTuneTable() {

  const tableRows = tuneTable.getElementsByTagName('tr');
  const tableWidths = new Array(tuneTable.rows[0].cells.length).fill(0);

  let tableHeaders = "";
  let idM = showMeter? "M" : "ID"; 
  let urlAbc = showAbcBox.checked? "ABC" : "URL";
  let headersList = ["#", "Name", idM, urlAbc];

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

////////////////////////////////////////////////////////////////////////
// Clear data functions: Wiping Tunetable, Sort settings and JSON files
///////////////////////////////////////////////////////////////////////

// Clear local JSONs of tunes

export function clearJsonData() {

  importJson = {};
  sortedJson = {};
  saveIcon.removeAttribute("style");
  console.log("Tune data cleared");

}

// Clear Tunetable if it exists, else clear Infobox

export function clearTunetable() {

  if (!checkIfTableEmpty()) {

    tuneTable.textContent = "";
    console.log("Tunetable cleared");
  } 
}

// Clear only sorting style in the Sort menu

export function clearSortStyle() {

  if (sortStyle > 0) {
    sortStyle = 0;
    document.querySelector('input[name="sortstyle"]:checked').checked = false;
    console.log("Sorting style cleared");
  }
}

// Uncheck sorting options checkboxes if not protected

export function clearCheckboxData() {

  if (!alwaysUseTypeBox.checked) {
    showTypeBox.checked = false;
  }

  if (!alwaysUseKeysBox.checked) {
    showKeysBox.checked = false;
  }

  if (!alwaysUseAbcBox.checked) {
    showAbcBox.checked = false;
    useShorterAbcBox.checked = false;
  }
}

// Clear sorting style and all checkbox settings

export function clearSortMenu() {

  clearSortStyle();

  if (alwaysUseAbcBox.checked) {
    alwaysUseAbcBox.click();
    // alwaysUseAbcBox.checked = false;
  }

  if (alwaysUseKeysBox.checked) {
    alwaysUseKeysBox.click();
    // alwaysUseAbcBox.checked = false;
  } 

  if (alwaysUseTypeBox.checked) {
    alwaysUseTypeBox.click();
    // alwaysUseAbcBox.checked = false;
  }

  clearCheckboxData();
}

//////////////////////////////////////////////////////////////////////////////////
// Menu accessibility: Changing visibility and ARIA states of Help and Sort menus
/////////////////////////////////////////////////////////////////////////////////

// Show or hide help menu

function toggleHelpMenu() {
  
  hideSortMenu();
  helpIcon.classList.toggle("active");
  accMainWrapper.classList.toggle("unwrapped");
  toggleAriaStatesHelp();
}

// Hide Sort options menu

function hideSortMenu() {

  if (sortMenu.classList.contains("displayed")) {
    
    sortMenu.classList.remove("displayed");
    toggleAriaStatesSort();
  }
}

// Toggle states of the visible help menu items when the menu is wrapped / unwrapped

function toggleAriaStatesHelp() {

  toggleAriaExpanded(accMainHeader);
  toggleAriaHidden(accHelpMenu);

  if (accMenuIntro.classList.contains("unwrapped")) {
    toggleAriaHidden(accMenuIntroText);
    toggleTabIndex(accMenuIntroText);
  }

  accSubHeaders.forEach(subheader => {
    
    let tabIndex = subheader.getAttribute("tabindex") === "0"? "-1" : "0";
    subheader.setAttribute("tabindex", tabIndex);
    toggleAriaHidden(subheader);
  });

  accWrappers.forEach(wrapper => {
    
    if (wrapper.classList.contains("unwrapped")) {
      toggleTabIndex(wrapper);
    }
  });

  let tabIndexWrapper = accWrapBtn.getAttribute("tabindex");

  if (tabIndexWrapper === "0") {
    
    accWrapBtn.setAttribute("disabled", '');
    accWrapBtn.setAttribute("tabindex", "-1");
    accMainHeader.focus();

  } else {
    accWrapBtn.removeAttribute("disabled");
    accWrapBtn.setAttribute("tabindex", "0");
  }

  toggleAriaHidden(accWrapBtn);
}

// Toggle states of the visible sort menu items when the menu is wrapped / unwrapped

function toggleAriaStatesSort() {

  toggleAriaExpanded(sortTunetableBtn);
  toggleAriaHidden(sortMenu);

  if (advOptionsBox.classList.contains("displayed-flex")) {
    toggleAriaHidden(advOptionsBox);
  }
}

/////////////////////////////////////////////////////////////////////////////
// Event listeners: Setting events for buttons, radio buttons and checkboxes
////////////////////////////////////////////////////////////////////////////

function initButtons() {

  // Create Tunetable button

  generateTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    hideSortMenu();

    if (accHelpMenu.parentElement.classList.contains("unwrapped")) {

      toggleHelpMenu();
    }

    if (inputForm.value) {

      if (validateTsoUrl()) {

        localStorage.setItem("inputUrl", inputForm.value);

        generateTunetableSequence();
  
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

    inputForm.value = "";
    clearCheckboxData();
    clearSortMenu();

    if (!checkIfJsonHasTunes(importJson) && !checkIfJsonHasSets(importJson)) {

      return showInfoMsg("Settings cleared");
    }

    hideSortMenu();
    clearTunetable();
    clearJsonData();

    showInfoMsg("Tunetable cleared!");
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
      toggleAriaStatesSort();
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
        sortTunetableBtn.focus();
        return;

      } else if (sortStyle === 0) {
      
        showInfoMsg("Select sorting style!", 1);
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
      showInfoMsg(`Sorting style picked: #${this.value}`);
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

  // Preload ABC incipits with keys when Keys box is ticked for the first time (only for tune jsons)

  showKeysBox.addEventListener("change", (event) => {

    if (event.target.checked && !alwaysUseKeysBox.checked) {

      if (checkIfJsonHasTunes(importJson) && !checkIfJsonHasAbc(importJson)) {

        abcPreloadSequence();
      }
    }
  });

  // Preload ABC incipits with keys when ABC box is ticked for the first time

  showAbcBox.addEventListener("change", (event) => {

    if (event.target.checked && !alwaysUseAbcBox.checked) {
  
      if (!checkIfJsonHasAbc(importJson)) {

        abcPreloadSequence();
      }
    }
  });

  // Set Type display option to default (always show)

  alwaysUseTypeBox.addEventListener("change", (event) => {

    if (event.target.checked) {

      showTypeBox.setAttribute("disabled", '');
      showTypeBox.setAttribute("style", "border-color: var(--highlight-color)");

      if (!showTypeBox.checked) {

        showTypeBox.checked = true;
      }

    } else {
      
      showTypeBox.removeAttribute("disabled");
      showTypeBox.removeAttribute("style");
      showTypeBox.checked = false;
    }
  });

  // Set ABC incipits option to default (always show)

  alwaysUseAbcBox.addEventListener("change", (event) => {

    if (event.target.checked) {

      showAbcBox.setAttribute("disabled", '');
      showAbcBox.setAttribute("style", "border-color: var(--highlight-color)");

      if (!showAbcBox.checked) {

        if (!checkIfJsonHasAbc(importJson)) {

          abcPreloadSequence();
        }

        showAbcBox.checked = true;
      }

    } else {
      
      showAbcBox.removeAttribute("disabled");
      showAbcBox.removeAttribute("style");
      showAbcBox.checked = false;
    }
  });

  // Set Keys display option to default (always show)

  alwaysUseKeysBox.addEventListener("change", (event) => {

    if (event.target.checked) {

      showKeysBox.setAttribute("disabled", '');
      showKeysBox.setAttribute("style", "border-color: var(--highlight-color)");

      if (!showKeysBox.checked) {

        if (!checkIfJsonHasAbc(importJson)) {

          abcPreloadSequence();
        }

        showKeysBox.checked = true;
      }

    } else {
      
      showKeysBox.removeAttribute("disabled");
      showKeysBox.removeAttribute("style");
      showKeysBox.checked = false;
    }
  });

  // Unwrap Offline menu when Infobox clicked

  infoBoxBtn.addEventListener('click', () => {

    toggleOfflineMenu();
  });

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
      let ariaLabel = !showMeter? "Tune ID" : "Tune meter";
      idMeterTxt.textContent = !showMeter? "ID" : "M";

      idMeterTxt.setAttribute("aria-label", ariaLabel);

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
    
    let ariaLabel = document.body.classList.contains("light")? "Dark theme is on" : "Light theme is on";

    themeBtn.setAttribute("aria-label", ariaLabel);
    document.body.classList.toggle("light");
    sunIcon.classList.toggle("hidden");
    moonIcon.classList.toggle("displayed");
    githubDark.classList.toggle("hidden");
    githubLight.classList.toggle("displayed");
  });

  // Show / hide help menu button

  [accMainHeader, helpBtn].forEach(btn => {
    
    btn.addEventListener('click', () => {

      toggleHelpMenu();

      if (accMainWrapper.classList.contains("unwrapped")) {

        accMainHeader.focus();
      }
    });
  });

  // Wrap / unwrap accordion menu item and toggle states of its elements

  accWrappers.forEach(myWrapper => {

    const myMenuSubhead = myWrapper.querySelector(".help-menu-subhead");

    myMenuSubhead.addEventListener('click', function() {

      if (accMenuIntro.classList.contains("unwrapped")) {
        accMenuIntro.classList.remove("unwrapped");
        toggleAriaHidden(accMenuIntroText);
        toggleTabIndex(accMenuIntroText);
      }

      accWrappers.forEach(wrapper => {

        const menuSubhead = wrapper.querySelector(".help-menu-subhead");

        if (wrapper.classList.contains("unwrapped") && wrapper !== myWrapper) {
          wrapper.classList.remove("unwrapped");
          menuSubhead.classList.remove("highlighted");
          toggleTabIndex(wrapper);
          toggleAriaExpanded(wrapper.getElementsByClassName("help-menu-subhead")[0]);
          toggleAriaHidden(wrapper.getElementsByClassName("help-menu-text")[0]);
        }
      });

      if (!myWrapper.classList.contains("unwrapped")) {

        myWrapper.classList.add("unwrapped");
        myMenuSubhead.classList.add("highlighted");
        toggleTabIndex(myWrapper);
        toggleAriaExpanded(myWrapper.getElementsByClassName("help-menu-subhead")[0]);
        toggleAriaHidden(myWrapper.getElementsByClassName("help-menu-text")[0]);

      } else {

        myWrapper.classList.remove("unwrapped");
        myMenuSubhead.classList.remove("highlighted");
        accMenuIntro.classList.add("unwrapped");
        toggleTabIndex(myWrapper);
        toggleTabIndex(accMenuIntroText);
        toggleAriaExpanded(myWrapper.getElementsByClassName("help-menu-subhead")[0]);
        toggleAriaHidden(myWrapper.getElementsByClassName("help-menu-text")[0]);
        toggleAriaHidden(accMenuIntro.getElementsByClassName("help-menu-text")[0]);
      }
    });
  });

  // Wrap accordion menu button

  accWrapBtn.addEventListener('click', () => {

    toggleHelpMenu();
  });

  // Show / hide advanced options button

  advOptionsBtn.addEventListener('click', (event) => {

    event.preventDefault();

    advOptionsBox.classList.toggle("displayed-flex");
    toggleAriaExpanded(advOptionsBtn);
    toggleAriaHidden(advOptionsBox);

    if (advOptionsBox.classList.contains("displayed-flex")) {

      useShorterAbcBox.focus();

    } else {

      goSortBtn.focus();
    }
  });

  // Input example Tunebook / Tunelist / Setbook / Setlist buttons

  [exampleTunebook, exampleTunelist, exampleSetbook, exampleSetlist].forEach(btn => {

    btn.addEventListener('click', () => {

      inputForm.value = 
      btn === exampleTunebook? "https://thesession.org/members/1/tunebook" :
      btn === exampleTunelist? "https://thesession.org/members/1/tags/SliabhLuachra/tunes" :
      btn === exampleSetbook? "https://thesession.org/members/1/sets" :
      btn === exampleSetlist? "https://thesession.org/members/1/tags/StarAboveTheGarter/tunesets" : '';

      toggleHelpMenu();
      inputForm.focus();
    });
  });

  // Revert Tunetable & JSON data to unsorted original button

  revertBtn.addEventListener('click', () => {

    if (!checkIfTableEmpty()) {

      hideSortMenu();
      clearSortStyle();
      sortedJson = {};
    
      if (alwaysUseKeysBox.checked) {
        alwaysUseKeysBox.click();
      } 
    
      if (alwaysUseTypeBox.checked) {
        alwaysUseTypeBox.click();
      }

      createTuneTable(importJson);
      showInfoMsg("Reverted to TSO defaults!");
      sortTunetableBtn.focus();
      return;

    } else {

      showInfoMsg("No tune data found!", 1);
      return;
    }
  });

  // Set delay for logo-links for animation to finish before new page opens
  // but only if the click seems to be coming from a mobile device

  logoLnk.forEach(link => {

    if (window.screen.width < 720) {

      link.addEventListener('click', (event) => {

        event.preventDefault();

        console.log(location);

        setTimeout(() => { location.assign(link.href) }, 500);
      });
    }
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

///////////////////////////////////////////////
// Initialize necessary functions on page load
//////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  
  inputForm.value = localStorage.getItem("inputUrl");
  initButtons();
  generateOfflineLinks();
  console.log("Tunetable GUI initialized");
  showInfoMsg("Hi there! Got any tunes?");
});

//////////////////////////////////////////
// Register service worker on window load
/////////////////////////////////////////

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log(`Service Worker:\n\n` + `Registered with scope:\n` + registration.scope);
      })
      .catch((error) => {
        console.error(`Service Worker:\n\n` + `Registration failed!\n` + error);
      });
  });
}