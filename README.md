Tunetable: Convert The Session tunebooks, tunelists and sets to compact tables [v.1.9.1] 
========================================================================================

## Overview

Generate handy tunetables from [thesession.org](https://thesession.org/) tunebooks and lists of 
tagged tunes using a simple web app with a URL input and sorting options that makes use of [The Session API](https://thesession.org/api).

Tunetable is a free and open source software licensed under the terms of the GPL v.3.0 license.

It contains [information](https://github.com/adactio/TheSession-data) from The Session, which is made available here under the Open Database License (ODbL).

See Tunetable Help menu for detailed instructions.

Tunetable is being developed by Anton Zille aka Bregolas.

- [Launch Tunetable on Anton Zille’s GitHub](https://github.com/anton-bregolas/Tunetable/)
- [Discuss Tunetable on The Session](https://thesession.org/discussions/48665)

## TO DO:

- Collect initial feedback, fix more bugs.
- Expand capabilities of service worker.

## DONE: 

[v.1.9.1]

+ Current service worker settings should allow falling back to cached index.html on page reload.
+ Fallback offline.html page added for PWA in case cached index.html doesn't work.
+ Accessibility: 
  - Regrouped Infobox and made Tunetable body selectable to fix accessibility issues
  - Tunetable content can now be vertically expanded on hitting space bar key
  - Low-contrast colors changed to recommended contrast ratio
  - Added ARIA labels to elements missing accessible names
+ Experimental: Slightly delayed logo-links transitions for mobile devices to show logos.

[v.1.9.0]

+ Tunetable is now a Progressive Web App (PWA) and can be installed to an Android or Apple device via a browser.
+ Service worker capabilities included so far:
  - Caching of TSO fetch responses for offline use (live versions priority, only for failed fetch requests)
  - Caching of ABC incipits jsons for offline use and instant loading (cached versions priority)
  - Re-caching of ABC incipits jsons if file aged >=7 days (upon new fetch request)
+ List of offline links to pick from gets generated below Infobox if fetch request fails.
+ Clicking on Infobox displays the Offline menu. It automatically unwraps if a fetch error is thrown.
+ Major refactoring of scripts, entry point script split into separate functional modules.

[v.1.8.9]

+ Favicons added with several fallbacks for browsers and operating systems (SVG, .ico, Chromium/Android, Apple Touch).
+ Web app manifest added with initial basic info about the website and paths to backup favicons.

[v.1.8.8]

+ Mobile hints added to Help menu.
+ More ARIA fixes after VoiceOver tests.

[v.1.8.7]

+ ARIA group labels for radio buttons added for easier screen reader navigation.
+ Toggling Tune ID/M and Dark/Light theme buttons now changes aria-label, triggering screen readers to announce new state.
+ Workaround for some screen readers announcing names of all elements in each cell, rendering Name + Revert button column unusable.
  Revert button had to be assigned aria-label "Reset" so that the affected screen readers read "Name Reset column" and not
  "Name Revert Tunetable & data to unsorted original column" due to button title. When tabbing to the button, full title is read.
+ Selection inside a Tunetable no longer triggers a click event, a single click with no selection expands rows as usual.

[v.1.8.6]

+ ARIA labels added, some attributes fixed after testing the page with screen readers.
+ Infobox now has aria-live attribute, enabling it to announce messages via screen readers.
+ Close help menu button added to accordion menu for easier keyboard controls.
+ Cut unnecessary links in Help menu, refactored example links input.
+ On-focus outline styles further tweaked in selectable elements.

[v.1.8.5]

+ Both Help and Sort menus can now be fully navigated with default keyboard controls (Tab, Space, Enter, Arrows).
+ Added functions for making wrapped up links and buttons (non-)selectable with Tab key using TabIndex. 
+ Made main elements of the Sort menu ARIA-ready (redundant at this stage with display:none).
+ Added functions for bulk-changing ARIA-states.

[v.1.8.4]

+ ARIA-states added to the accordion Help menu for accessibility. Full arrow-control is work in progress.
+ Checkboxes fully restyled for better accessibility and easier key control using modern CSS.
+ Outlines for selected elements partly restyled with improved visibility.
+ Buttons fixed to conform with modern HTML model requirements.

[v.1.8.3]

+ Checkboxes rewritten, variables ditched in favour of simple checks.
+ Sticky settings for checkboxes added under Show more options.
+ ABC preload function now chooses between tunes .json (< 1MB) and settings .json (2 MB) for sets.
+ ABC tunes/settings .json is now preloaded if sticky ABC / Keys settings are enabled.

[v.1.8.2]

+ TSO URL validation tweaked to include queries such as ?orderby=newest.
+ TSO JSON fetching function is now able to fetch .jsons with queries such as ?orderby=newest.
+ Sort menu expanded with Show advanced options button and hidden menu.
+ Help menu has been further expanded (some sections are a work in progress).

[v.1.8.1]

+ Fixed Keys not loading for tunelists (no keys in TSO .json, need to be created from ABC incipits).

[v.1.8]

+ Sort menu has been rewritten and is now made up of clear groups of settings: 
sorting style (required), handling The/An articles in tune names (optional, kept by default)
and checkbox options for adding extra content to the Tunetable (ABCs, keys, tune type).
+ Sorting and title processing functions have been adjusted accordingly.
+ Help menu has been expanded (some sections are a work in progress).

[v.1.7.2]

+ Added basic animations for buttons and their elements on mouse over and focus events.
+ Minor HTML / CSS changes and optimizations.

[v.1.7.1]

+ Added new icons for buttons and help menu sections.
+ Tunetable row expand / shrink event listener tweaked.

[v.1.7]

+ Added an apply Sort settings button (‘Work away!’) to make sorting more intuitive.
+ Rewrote column expand / collapse functions, got rid of negative margins.
+ Revisited Tunetable column widths, increased minimum width for ABCs.
+ Added row expand / shrink event listener, to be combined with media queries.

[v.1.6.3]

+ Adjusted ABC column width and expand / collapse behavior.

[v.1.6.2]

+ Fixed async function fetching missing tune ABC from The Session.
+ Added ABC cleaning module for processing the fetched ABC incipits.

[v.1.6.1]

+ Fixed async function fetching the "local" abc.json from GitHub repository.

[v.1.6]

+ Created a thoroughly filtered JSON containing ABC incipits of all the current TSO tunes.
+ Rewrote ABC incipit fetching that checks abc.json before attempting to fetch from TSO.
+ Newly-added tunes will be fetched from The Session if ABC is missing from abc.json
+ Initial testing of checkboxes / sorting behavior done, ABC is added in place of URLs.

[v.1.5]

+ Experimental: Fetches ABC incipit and tune keys for each tune, adds them to importJson.
+ Checkboxes with Type, Keys, ABC options added to Sort menu.

[v.1.4.1]

+ Help menu updated with more instructions on sorting options.
+ Button-like divs replaced with buttons, tab focus indicators now appear for each button.
+ Rolled back ABC incipit fetching and checkboxes, attempting to fix CORS policy error.

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


