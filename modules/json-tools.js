// Check if a nested JSON array of tunes is missing or empty

export function checkIfJsonHasTunes(checkJson) {

  if (Array.isArray(checkJson.tunes) && checkJson.tunes.length > 0) { 

    return true; 
  } 

  return false; 
}

// Check if a nested JSON array of sets is missing or empty

export function checkIfJsonHasSets(checkJson) {

  if (Array.isArray(checkJson.sets) && checkJson.sets.length > 0) { 

    return true; 
  } 

  return false; 
}

// Check if a nested JSON array of tunes / sets has ABC incipits

export function checkIfJsonHasAbc(checkJson) {

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

export function createDeepCopyJson(rawJson) {

  return JSON.parse(JSON.stringify(rawJson));

}