The Session Tunelist to Tunetable Converter [v.0.5]
===================================================

## Overview

Generate handy tunetables from [thesession.org](https://thesession.org/) tunebooks and lists of 
tagged tunes using a simple page with a URL input and sorting options that makes use of [The Session API](https://thesession.org/api).

## TO DO:

- Animate transitions and buttons.
- Add show original order option. 
- Design an element inserting an example link on click.
- Export custom Tunetable in plain list format on request.
- Get rid of innerHTML in favour of appendChild.
- Consider @media requests for mobile devices.

## DONE: 

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


