The Session Tunelist to Tunetable Converter [v.0.3]
===================================================

## Overview

Generate handy tunetables from [thesession.org](https://thesession.org/) tunebooks and lists of 
tagged tunes using a simple page with a URL input and sorting options that makes use of [The Session API](https://thesession.org/api).

## TO DO:

- See if loading longer lists requires wait dialog.
- Get rid of innerHTML in favour of appendChild.
- Pick colors for light theme, add button.
- Try adding animations for buttons etc.
- Find ways to export custom Tunetable as txt.
- Consider @media requests for mobile devices.

## DONE: 

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


