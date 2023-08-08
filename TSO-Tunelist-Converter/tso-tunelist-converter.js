import tsoJson from './polkas202-1.json' assert {type: 'json'};

let noThe = 1;

let customJson = {};

const tuneTable = document.querySelector('#t-tunes');
const infoBox = document.querySelector('.info-box');
const inputForm = document.querySelector('#input-form');

// Validate The Session URL

function validateTsoUrl() {

  let tsoUrl = inputForm.value;

  const validTunelist = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btags\b\/.+\/\btunes\b\/?$/;
  const validTunebook = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btunebook\b\/?$/;

  if (validTunelist.test(tsoUrl) || validTunebook.test(tsoUrl)) {

    return true;
  }    

  return false;
}

// Create Tunetable from JSON array of tunes

function createTuneTable(myJson) {

  const myTunes = myJson.tunes;

  tuneTable.innerHTML = "";
  infoBox.innerHTML = "Hup!";

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

}

// Check if customJson is empty

function checkIfEmptyJson(checkJson) {
  
  let checkString = JSON.stringify(checkJson);

  if (checkString == "{}") {
    return true;
  } 
  return false;
}

// Create a deep copy of the fetched JSON

function createDeepCopyJson(rawJson) {

  return JSON.parse(JSON.stringify(rawJson));

}

// Sort Tunetable: Move articles or cut articles then reorder tunes by name

function sortTunetable() {

  let myJson = createDeepCopyJson(tsoJson);

  let myTunes = myJson.tunes;

  for (let i of myTunes) {
    i.name = processTuneTitle(i.name);
  }
    
  myTunes.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return myJson;
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

    return newTitle = title.slice(2) + ', A';
                         
  }
  
  return newTitle;
}

// Add listeners to buttons and radio buttons

function initButtons() {

  const generateTunetableBtn = document.querySelector('.t-gen-btn');

  generateTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (inputForm.value) {

      if (validateTsoUrl()) {

      infoBox.innerHTML = "Hup!";

      createTuneTable(tsoJson); 
      customJson = tsoJson;
  
      } else {
  
        infoBox.innerHTML = `<span style="color: coral">It's not a link we're looking for!</span>`;
      }
    }
  });

  const clearTunetableBtn = document.querySelector('.t-clr-btn');
  
  clearTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (!checkIfEmptyJson(customJson)) {

      customJson = {};

      tuneTable.innerHTML = "";
      infoBox.innerHTML = "Tunetable cleared!";
    }
  });

  const sortTunetableBtn = document.querySelector('.t-sort-btn');

  sortTunetableBtn.addEventListener('click', (event) => {

    event.preventDefault();

    if (checkIfEmptyJson(customJson)) {

      infoBox.innerHTML = "No tunes to sort!";
      return;
    }

    customJson = sortTunetable();

    createTuneTable(customJson);

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
