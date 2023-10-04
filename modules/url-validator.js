import { inputForm } from "../app.js";

// Validate The Session URL

export function validateTsoUrl() {

  const inputUrl = inputForm.value.trim().split("?");
  const tsoUrl = inputUrl[0];
  const tsoUrlQuery = inputUrl[1];

  const validTunelist = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btags\b\/.+\/\btunes\b\/?$/;
  const validTunebook = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btunebook\b\/?$/;
  const validSetbook = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\bsets\b\/?$/;
  const validSetlist = /^(?:https?:\/\/)?(www\.)?\bthesession\.org\/members\/\b[0-9]+\/\btags\b\/.+\/\btunesets\b\/?$/;
  const validQuery = /^[a-z0-9&=]*$/;

  if (inputUrl.length <= 2) {
    
    if (validTunelist.test(tsoUrl) || validTunebook.test(tsoUrl) || 
      validSetbook.test(tsoUrl) || validSetlist.test(tsoUrl)) {

      if (tsoUrlQuery == null || validQuery.test(tsoUrlQuery)) {

        console.log('URL passed validation');
        return true;
      }
    }
  }
  
  console.log('URL failed validation');
  return false;
}

// Check if The Session URL contains list of tunes

export function checkIfTunesUrl(url) {

  let checkUrl = url.split("?")[0];

  if (checkUrl.endsWith("/tunes") || checkUrl.endsWith("/tunes/") ||
  checkUrl.endsWith("/tunebook") || checkUrl.endsWith("/tunebook/")) {

    return true;
  }

  return false;
}

// Check if The Session URL contains sets of tunes

export function checkIfSetsUrl(url) {

  let checkUrl = url.split("?")[0];

  if (checkUrl.endsWith("/sets") || checkUrl.endsWith("/sets/") ||
  checkUrl.endsWith("/tunesets") || checkUrl.endsWith("/tunesets/")) {

    return true;
  }

  return false;
}