// Clear all the extra information until bare-bones ABC is ready for export;
// limit ABC incipit to 3 bars, including the pick-up bar (if present);
// if ABC incipit is > 32 chars long, cut the last bar;
// if ABC incipit is still > 32 chars long, cut notes until empty space;
// all the ABCs that end up empty or too short after all this should be 
// considered broken and will be exported as "N/A".

export function cleanTsoAbc(abc) {

  // Remove all inline / bracketed fields first to avoid broken lines
  abc = abc.replace(/\[[A-Z]:.*?\]/gsi, '')

  // Remove all "chords", {grace notes}, !decorations!, +decorations+
  .replace(/\".*?\"/g, '')
  .replace(/{.*?}/g, '')
  .replace(/!.*?!/g, '')
  .replace(/\+.*?\+/g, '')

  // Remove all the remaining inline fields / commands separated by newline
  .replace(/[H-Z]:.*?(\\r\\n|\r\n)/g, '')
  // Remove all the remaining inline commands such as meter change
  .replace(/\w:\s*?\d+\/\d+/g, '')
  // Remove all the words and voices
  .replace(/V|W:.*/gi, '')

  // Remove all the comments separated by newline
  .replace(/\%.*?(\\r\\n|\r\n)/, '')
  // Remove all the remaining end-of-file comments
  .replace(/\%\s*?.*$/, '')

  // Remove all newlines and tabs
  .replace(/\r\n|\r|\t/g, '')

  // Remove invisible spaces added via unicode
  .replace(/\u0000|\u0008|\u0009|\u000A|\u000B|\u000C|\u000D|\u001A|\u007F|\u0014/gi, '')
  // Replace double spaces with spaces
  .replace(/\s\s/g, ' ')
  // Remove all shorthand decoration symbols
  .replace(/[H-Y\-\+]\s*/gi, '')

  // Remove repeat symbol or bar line if no pickup present
  .replace(/^(\|:)?(^\|*)?/, '')
  // Remove all the remaining repeat symbols
  .replace(/:/g, '')

  // Take 3 bars of ABC, including pickup bars
  .split('|', 3).join('|').trim();

  // Cut the last bar of ABC if the incipit is too long
  if (abc.length > 32) {

    const match1 = abc.match(/\|[^|]*(?=[^\|]*$)/);

    if (match1) {
      abc = abc.replace(match1[0], '')
    }
  }

  // If the incipit is still too long, cut more notes until space
  if (abc.length > 32) {

    const match2 = abc.match(/\S.{1,32}(?=\s|$)/);

    if (match2) {
      abc = match2[0];
    }
  }

  // If the incipit is way too short, replace the likely erroneous line with "N/A"
  if (abc.length < 6) {

    abc = "N/A";
  }

  return abc;
}