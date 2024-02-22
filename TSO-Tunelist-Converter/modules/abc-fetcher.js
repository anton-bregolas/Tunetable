import { 
  alwaysUseAbcBox,
  alwaysUseKeysBox,
  clearCheckboxData, 
  clearJsonData, 
  clearSortStyle, 
  clearTunetable,
  inputForm,
  showInfoMsg
} from '../app.js';

import { cleanTsoAbc } from './abc-cleaner.js';
import { checkIfJsonHasSets, checkIfJsonHasTunes } from './json-tools.js';
import { checkIfSetsUrl } from './url-validator.js';

// Make a standard fetch request, throw an error if it fails

export async function fetchData(url, type) {

  try {

    const response = await fetch(url);

    let data;

    if (!response.ok) {

      let errorMessage;

      if ((response.status === 408)) {

        errorMessage = "You seem to be offline. Try using cached data";

      } else if (response.status < 500) {

        errorMessage = "Tune data not loading. Clear settings or use cached data";

      } else {

        errorMessage = "Tunetable is offline. Pick a cached link instead";
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

    // console.error("Fetching data failed! Error rethrown.");
    throw error;
  }
}

// Process TSO link and add a necessary JSON query variant depending on the content

function makeJsonQueryLink(url) {

  if (url.startsWith("http:")) {

    url = url.replace("http:", "https:");
  }

  if (url.endsWith("/tunebook") || url.endsWith("/tunebook/")) {

    return `${url}?format=json`;

  } else if (url.endsWith("/tunes") || url.endsWith("/tunes/") ||
      url.endsWith("/sets") || url.endsWith("/tunesets") || 
        url.endsWith("/sets/") || url.endsWith("/tunesets/")) {

    return `${url}?format=json&perpage=50`;

  } else if (url.includes("/tunebook")) {

    return `${url}&format=json`;

  } else {

    return `${url}&format=json&perpage=50`;
  }
}

// Retrieve JSON data from The Session using async fetch requests
// Display bonus messages if tDelay > 3s, then call createTuneTable()

export async function fetchTheSessionJson(url) {

  let jsonUrl;
  let importJson = {};
  let errorMessage;
  let tDelay = 0;

  jsonUrl = makeJsonQueryLink(url);

  showInfoMsg("Fetching tunes from TSO...");
  console.log(`Fetching URL:\n\n` + `${jsonUrl}`);

  try {

    const tsoData = await fetchData(jsonUrl, "json");

    if (checkIfJsonHasTunes(tsoData) || checkIfJsonHasSets(tsoData)) {

      inputForm.value = "";
      clearJsonData();
      clearTunetable();
      clearSortStyle();
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

      console.error(`Found empty tune/set array! Incorrect link or data missing:\n\n` + jsonUrl);
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
          console.log(`Fetching URL:\n\n` + `${jsonUrl}`);
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

    if (alwaysUseAbcBox.checked || alwaysUseKeysBox.checked) {

      await loadAbcIncipits(importJson);
    }

    return importJson;
  } 

  catch (error) {

    errorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
     error.message || "Fetching data failed, try again!";

    console.error("Error fetching JSON from The Session:", error);

    throw new Error(errorMessage);

  }
}

// Delay the display of bonus messages using new Promise

export async function msgDelay(duration) {

  await new Promise(resolve => setTimeout(resolve, duration));
}

// Retrieve JSON data from The Session using async fetch requests
// Display bonus messages if tDelay > 3s, then call createTuneTable()

export async function fetchAbcIncipit(tuneId, settingId) {

  let tuneUrl = `https://thesession.org/tunes/${tuneId}?format=json`

  let errorMessage;

  try {

    showInfoMsg(`Fetching data from TSO...`);
    console.log(`Fetching ABC from:\n\n` + `${tuneUrl}`);

    const tsoTuneData = await fetchData(tuneUrl, "json");

    if (Array.isArray(tsoTuneData.settings) && tsoTuneData.settings.length > 0) {

      console.log("Extracting ABC incipit and key from TSO tune...");

      let abc;
      let key;

      // If settingId is specified, look for specific tune setting and get ABC from that setting
      // If only tuneId is specified or matching settingId is not found, get the first tune setting

      if (settingId) {

        abc = tsoTuneData.settings[0].abc;
        key = tsoTuneData.settings[0].key.slice(0, 4);

        for (let s = 0; s < tsoTuneData.settings.length; s++) {

          if (tsoTuneData.settings[s].id === settingId) {

            abc = tsoTuneData.settings[s].abc;
            key = tsoTuneData.settings[s].key.slice(0, 4);
          }
        }

      } else {

        abc = tsoTuneData.settings[0].abc;
        key = tsoTuneData.settings[0].key.slice(0, 4);
      }

      const abcBars = cleanTsoAbc(abc);
      const incipit = `[${key}] ${abcBars}`;
      console.log("Done fetching ABC incipit and tune key");

      return incipit;

    } else {

      errorMessage = "Tune ABC missing or empty!";
      throw new Error(errorMessage);
    }
  }

  catch (error) {

    errorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
     error.message || "Fetching data failed, try again!";

    console.error(`Error fetching ABC incipits and keys from The Session:\n\n` + error);
    
    throw new Error(errorMessage);
  }
}

// Preload ABC incipits into Tune JSON based on Tune ID and JSON type

export async function loadAbcIncipits(importJson) {

  try {
    
    let dataType;
    
    if (checkIfJsonHasTunes(importJson)) {

      dataType = importJson.tunes;

    } else if (checkIfJsonHasSets(importJson)) {

      dataType = importJson.sets;

    } else {

      throw new Error("No tune data found! Re-generate Tunetable");
    }

    let abcUrl;
    
    if (checkIfJsonHasTunes(importJson)) {

      abcUrl = "https://raw.githubusercontent.com/anton-bregolas/Tunetable/deploy/data/abc.json";

    } else if (checkIfJsonHasSets(importJson)) {

      abcUrl = "https://raw.githubusercontent.com/anton-bregolas/Tunetable/deploy/data/abc-settings.json"
    }

    showInfoMsg("Loading ABC incipits...");

    const abcJson = await fetchData(abcUrl, "json");

    if (checkIfJsonHasTunes(importJson)) {

      console.log("Loading incipits and keys from ABC incipit JSON...");

      for (let l = 0; l < importJson.tunes.length; l++) {

        const tune = importJson.tunes[l];
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

    } else if (checkIfJsonHasSets(importJson)) {

      console.log("Loading incipits from ABC incipit JSON...");

      for (let m = 0; m < importJson.sets.length; m++) {

        for (let n = 0; n < importJson.sets[m].settings.length; n++) {

            const setting = importJson.sets[m].settings[n];
            const settingId = setting.id;
            const tuneId = setting.url.split("/")[4].split("#")[0];

            let incipit = abcJson[settingId] === undefined? await fetchAbcIncipit(tuneId, settingId) : abcJson[settingId];
            let abcSetBars = incipit.slice(7);

            if (!setting.abc) {
              setting["abc"] = abcSetBars;
            }
            if (!setting.key) {
              setting["key"] = incipit.slice(1, 5);
            }
        }
      }

      console.log("ABC incipits added to Set JSON");

    } else {

      throw new Error("No tune data found! Re-generate Tunetable");
    }
  
  } catch (error) {
    
    let errorMessage = error.message === "Failed to fetch"? "Network error, check your connection!" :
     error.message || "Fetching data failed, try again!";

    console.error("Error fetching ABC incipits and keys from The Session:", error);

    throw new Error(errorMessage);

  }
}
