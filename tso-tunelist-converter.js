// Declare global variables, create local JSONs

let noThe = 1;
let tDelay = 0;
let tsoJson = {};
let importJson = {};
let sortedJson = {};

const tuneTable = document.querySelector('#t-tunes');
const infoBox = document.querySelector('.info-box');
const inputForm = document.querySelector('#input-form');

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

// Retrieve JSON data from The Session using Fetch API
// Set delay depending on tunebook size then call createTuneTable()

function fetchTheSessionJson(url) {
  
  clearJsonData();

  let jsonUrl;

  if (url.endsWith("/tunes") || url.endsWith("/tunes/")) {

    jsonUrl = url + `?format=json&perpage=50`
  } else {

    jsonUrl = url + `?format=json`;
  }

  infoBox.innerHTML = `Fetching tunes from TSO...`;

  console.log(`Fetching ${jsonUrl}`);

  fetch(jsonUrl)
    .then((response) => {
      return response.json();
    })
      .then((data) => {
        
        tDelay = 0;
        tsoJson = data;
        importJson = {"tunes": []};

        for (const tune of data.tunes) {
          const { id, name, url, type } = tune;
          importJson.tunes.push({ id, name, url, type });
        }

        if (data.pages > 1) {

          tDelay = (+data.pages / 2.5) * 1000;

          for (let p = 2; p <= data.pages; p++) {

            let newPageUrl = jsonUrl + `&page=${p}`;
            console.log(`Fetching ${newPageUrl}`);

            fetch(newPageUrl)
              .then((pageResponse) => {
                return pageResponse.json();
              })
                .then((pageData) => {
                  
                  tsoJson.tunes = [...tsoJson.tunes, ...pageData.tunes];

                  for (const tune of pageData.tunes) {
                    const { id, name, url, type } = tune;
                    importJson.tunes.push({ id, name, url, type });
                  }
                }) 
                
              .catch(() => {
                console.error('Error fetching multi-page JSON from The Session');
                infoBox.innerHTML = `<span style="color: coral">Fetching data failed, try again!</span>`
              });
            }

          return importJson;
        }

        return importJson;
      }) 
      
      .then((resultJson) => { 

        console.log(`Table processing delay set to ${tDelay} ms`);
        clearTunetable();

        if (tDelay > 3000) {

          (async () => {
            infoBox.innerHTML = 'Jaysus, that’s a long list!';
            await msgDelay(1250);
            infoBox.innerHTML = 'Be patient now.';
            await msgDelay(1250);
            infoBox.innerHTML = 'Creating Tunetable...';
          })()
          
          async function msgDelay(duration) {
            return new Promise((resolve) => {
              setTimeout(resolve, duration);
            });
          }

        } else {
          
          infoBox.innerHTML = 'Creating Tunetable...';
        }

        setTimeout(function() {
          createTuneTable(resultJson);
          inputForm.value = "";
        }, tDelay)
      }) 

    .catch(() => {
      console.error('Error fetching JSON from The Session');
      infoBox.innerHTML = `<span style="color: coral">Fetching data failed, try again!</span>`
    });
}

// Create Tunetable from nested JSON array of tunes

function createTuneTable(myJson) {

  const myTunes = myJson.tunes;

  tuneTable.innerHTML = "";
  console.log('Creating tunetable');

  for (let i = 0; i < myTunes.length; i++) {

    const tuneRow = document.createElement("tr");

    for (let j = 0; j < 4; j++) {

      let cellId = j == 0? (i + 1) : 
      j == 1? myTunes[i].name : 
      j == 2? myTunes[i].id : myTunes[i].url;

      const tuneCell = document.createElement("td");
      const tuneText = document.createTextNode(cellId);
      const cellSpan = document.createElement("span");

      tuneCell.appendChild(cellSpan);

      cellSpan.setAttribute("class", "t-cell");

      if (j === 3) {
        const cellLink = document.createElement("a");
        cellLink.setAttribute("href", cellId);
        cellLink.setAttribute("target", "_blank");
        cellSpan.appendChild(cellLink).appendChild(tuneText);
      } else {
        cellSpan.appendChild(tuneText);
      }

      tuneRow.appendChild(tuneCell);
    }

    tuneTable.appendChild(tuneRow);
  }

  infoBox.innerHTML = "Hup!";
  console.log('Tunetable created');

}

// Check if a nested JSON array of tunes is empty

function checkIfEmptyJson(checkJson) {

  // Check tunelist object via JSON.stringify (slow)...
  
  // let checkString = JSON.stringify(checkJson);

  // if (checkString == "{}") {
  //   return true;
  // } 
  // return false;

  // Check nested tunes array via array.length (faster)...

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

// Clear local JSONs with tunes

function clearJsonData() {

  importJson = {};
  sortedJson = {};

  console.log("Tune data cleared");

}

// Clear Tunetable if it exists, else clear Infobox

function clearTunetable() {

  if (!checkIfEmptyJson(importJson)) {

    tuneTable.innerHTML = "";
    infoBox.innerHTML = "Tunetable cleared!";
    console.log("Tunetable cleared");

  } else {
    infoBox.innerHTML = "";
  }

  inputForm.value = "";

}

// Add listeners to buttons and radio buttons

function initButtons() {

  const generateTunetableBtn = document.querySelector('.t-gen-btn');

  generateTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (inputForm.value) {

      if (validateTsoUrl()) {

        fetchTheSessionJson(inputForm.value);
  
      } else {
  
        infoBox.innerHTML = `<span style="color: coral">It’s not a link we’re looking for!</span>`;
      }

    } else {
      infoBox.innerHTML = `<span style="color: coral">Don’t be shy, input a link!</span>`;
    }
  });

  const clearTunetableBtn = document.querySelector('.t-clr-btn');
  
  clearTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    clearTunetable();
    clearJsonData();
    
  });

  const sortTunetableBtn = document.querySelector('.t-sort-btn');

  sortTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (checkIfEmptyJson(importJson)) {

      infoBox.innerHTML = `<span style="color: coral">No tunes to sort!</span>`;
      return;
    }

    createTuneTable(sortTunetable(importJson));

    infoBox.innerHTML = "Sorted!";

  });

  const radioBtn = document.querySelectorAll('input[name="t-radio-btn"]');

  for (let k = 0; k < 4; k++) {
    radioBtn[k].addEventListener("change", function() {
      infoBox.innerHTML = `Sorting style #${this.value} picked`;
      return noThe = +this.value;
    });
  }

  const tuneTableHeaderBtn = document.querySelector("#t-headers");
  const tuneCells = document.querySelector("#t-tunes");

  tuneTableHeaderBtn.addEventListener('click', () => {

    tuneCells.querySelectorAll(".t-cell").forEach(cell => {

      cell.hasAttribute("style")? 
        cell.removeAttribute("style") :
          cell.setAttribute("style", "margin-right: 0");
    });
  });
}

// Initiate necessary functions on page load

document.addEventListener("DOMContentLoaded", () => {
  
  initButtons();

});
