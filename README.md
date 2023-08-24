The Session Tunelist to Tunetable Converter [v.1.5]
===================================================

## Overview

Generate handy tunetables from [thesession.org](https://thesession.org/) tunebooks and lists of 
tagged tunes using a simple web app with a URL input and sorting options that makes use of [The Session API](https://thesession.org/api).

## TO DO:

- Collect initial feedback, fix more bugs.
- Make menu elements more accessible.
- Brainstorm additional sorting options.

## DONE: 

[v.1.5]

+ Experimental: Fetches ABC incipit and tune keys for each tune, adds them to importJson.
+ Checkboxes with Type, Keys, ABC options added to Sort menu.
+ Help menu updated with more instructions on sorting options.
+ Button-like divs replaced with buttons, tab focus indicators now appear for each button.

[v.1.4]

+ Experimental: Accordion help menu with subheaders finished using grid transitions.
+ New, expanded help menu items added (accepted links, how to sort, how to save).
+ Adjusted transition durations, removed performance-killing table transition.

[v.1.3]

+ Icons moved to a single sprite file icons.svg to clean up HTML.
+ Animations added for menus, buttons, table wrapping and unwrapping.
+ Prototype accordion help menu made, headers / sections to be added.

[v.1.2]

+ Added basic protection against click interference during Fetch.
+ Input form buttons are now disabled during Fetch until its completion.
+ User will now be notified about connection problem if network error gets thrown.

[v.1.1]

+ Fixed handling of HTTP response errors during Fetch, they now get thrown properly.
+ User will now get several distinct error messages depending on Fetch error.
+ URLs starting with http will now be replaced with https to avoid SOP error. 
+ Added another check to the Fetch function to catch empty tune/set arrays.
+ Fixed the timing of clearing data during Fetch, error won't result in broken Tunetable.

[v.1.0]

+ Now supports Sets. Accepted TSO links may now end with: 
/tunebook || /tunes || /sets || /tunesets
+ Sets are generated and sorted with tune keys.
+ Download button now exports Tunetable in plain text format.
+ Index # button now exports Tune data in .json format.
+ ID / Meter button now works with Sets, shows M of 1st tune.
+ Expanded Help menu, added auto-fill links for Setbook / Setlist.

[v.0.9]

+ Experimental: Click on Tunetable '#' to export Tunetable in plain text format.
+ Indentations in myTuneTable.txt are relative, calculated from the longest cell.
+ Tune ID / Tune Meter toggle function now directly changes Tunetable cell values.

[v.0.8]

+ Added Tune ID / Tune Meter toggle button for the Tunetable. 
+ Tune Meter is deducted from the tune type value saved in JSON data.
+ Tune type is not displayed to avoid classifying airs as reels etc.
+ Clear and Sort buttons updated, default sorting style is now None. 
+ Generate button doesn't delete user-picked sorting style while Clear does.

[v.0.7]

+ Example links to a Tunebook / Tunelist can now be inserted on click from the help menu.
+ Revised the Sort function, got rid of redundant createTextNode lines.
+ Sort menu now opens on click and is hidden by default. Additional close button added.
+ Menu and buttons behavior revised, opening Help Menu closes Sort and vice versa (mobile friendly).
+ Added a button reverting the Tunetable and tune data to their original order.

[v.0.6]

+ Refactored the fetch request function using async-await syntax.
+ Bonus messages now run in parallel to the asynchronous fetch loop.
+ Fine-tested and corrected the calculation of delay that triggers them.
+ Got rid of innerHTML in favour of createElement / appendChild everywhere.

[v.0.5]

+ Redesigned the upper half of the page, navigation button/icons added.
+ Save button exports currently exports Tunetable as a JSON object file.
+ Help button displays instructions, which are now wrapped up by default.
+ Light theme: picked colors, added toggle button with alternating icons.

[v.0.4]

+ Fixed fetching and sorting logic. Custom JSON will now be used for all operations. 
+ Fixed delay calculation after changing the /tunes URL being fetched to 50 tunes per page. 
+ Displays grumpy messages with async-await if list will take more than 3 seconds to load.
+ Separated clear data functions to make order of operations more flexible.
+ Clear button now deletes links and Infobox messages if pressed again.
+ Generate button clears JSON data at the start of the fetch request, waits before clearing Tunetable.
+ Turned off annoying autocomplete in input form until finding ways to style it.

[v.0.3]

+ Fetches JSON from thesession.org via Fetch API.
+ Multi-page lists and tunebooks from The Session supported. 
+ Calculates Tunetable generation delay depending on number of pages.

[v.0.2]

+ Validates inputted links via RegExp, only TSO tunebooks and lists pass.
+ Some infobox messages and styling added.

[v.0.1]

+ Offline version tested on TSO JSON via local server.
+ Four algorithms for handling articles in tune names added.
+ Scripts for sorting through and reordering JSON tunelist.
+ Script for creating and filling in Tunetable from TSO JSON.
+ Script for radio buttons (NB: btn values are always string).
+ UI elements added: buttons, radio inputs, input form.
+ Basic mobile-friendly layout with flexboxes tested in dev tools.
+ Expanding table behavior via disabling negative margins (hacky!)


