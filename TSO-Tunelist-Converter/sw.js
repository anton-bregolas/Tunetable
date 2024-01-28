const CACHE_NAME = 'tunetable-cache-v.1.9.1.4';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'assets/icons/icons.svg',
        'modules/abc-cleaner.js',
        'modules/abc-fetcher.js',
        'modules/aria-tools.js',
        'modules/json-tools.js',
        'modules/url-validator.js',
        'app.js',
        'index.html',
        'offline.html',
        'styles.css'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => { 
                console.log(`Service worker:\n` +
                `Clearing outdated cached files\n` +
                `Cached version: ${cacheName.slice(16)}\n` +
                `Current version: ${CACHE_NAME.slice(16)}`);
                caches.delete(cacheName);
            })
        );
      })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Activate new service worker on page reload
        self.clients.claim().then(() => {
            // Stop the old service worker, notify about version change in console 
            console.log(`Service worker: Cache version updated to ${CACHE_NAME.slice(16)}`);
            self.registration.unregister().then(() => {
                self.skipWaiting();
            });
        })
    );
});

self.addEventListener('fetch', (event) => {

    // Cache and retrieve ABC JSON files

    if (event.request.url.endsWith('abc.json') || event.request.url.endsWith('abc-settings.json')) {
        event.respondWith(
          // Check if the file is already cached
          caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
              // If found in cache and not older than 7 days, retrieve it from cache
              if (cachedResponse && !isCacheExpired(cachedResponse, 7)) {
                console.log(`Service worker:\n\n` + `Retrieving saved ABC JSON from cache`);
                return cachedResponse;
              }
              // If not found in cache or outdated, try to retrieve a fresh copy
              console.warn(`Service worker: ABC JSON missing or outdated.\n\n` + `Trying to fetch a fresh version`);
              return fetchWithTimeout(event.request, 60000)
                .then((networkResponse) => {
                  if (navigator.onLine && networkResponse && networkResponse.ok) {
                    // Clone the network response without accessing its body
                    const responseHeaders = new Headers(networkResponse.headers);
                    responseHeaders.set('Date', new Date().toUTCString());
                    // Create a new Response object with the cloned headers and the body stream
                    const responseWithDateHeader = new Response(networkResponse.body, {
                      status: networkResponse.status,
                      statusText: networkResponse.statusText,
                      headers: responseHeaders,
                    });
                    // Update cache with the fresh response
                    cache.put(event.request, responseWithDateHeader.clone());
                    console.log(`Service worker:\n\n` + `ABC JSON successfully updated`);
                    return responseWithDateHeader;
                  }
    
                  // If fetch fails or navigator is offline, fall back to cached version
                  console.warn(`Service worker: Fetch error caught.\n\n` + `Retrieving saved ABC JSON from cache`);
                  return cachedResponse;
                })
                .catch((error) => {
                  console.error(`Service worker: Fetch error caught.\n\n` + error);
                  // Fall back to cached version if fetch throws an error
                  if (cachedResponse) {
                    console.warn(`Service worker: Falling back to cached ABC JSON due to fetch error`);
                    return cachedResponse;
                  }
                  // If no cached response, return an error response
                  return new Response('Fetch error: No cached ABC file available', {
                    status: 400,
                    statusText: 'Fetch error and no cached ABC file available. User may need to clear settings.',
                  });
                });
            });
          })
        );

    // Cache TSO page fetch responses, retrieve from cache if error caught

    } else if (event.request.url.startsWith('https://thesession.org/')) {
        event.respondWith(
        fetchWithTimeout(event.request, 30000)
            .then((response) => {
                // If the fetch is successful, store cloned response in the cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch((error) => {
                // If the fetch fails, attempt to respond with a cached version
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.warn(`Service worker: Fetch error caught.\n\n` + `Retrieving saved tune data from cache`);
                        return cachedResponse;
                    } else if (error.message === "Request timed out") {
                        return new Response('Fetch is taking too long! Check connection', { status: 408, statusText: 'Fetch error: No cached version available' });
                    } else {
                        return new Response('Fetch error: No cached version available', { status: 503, statusText: 'Fetch error: No cached version available' });
                    }
                });
            })
        );

    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                // console.log("Service worker: Loading cached version of the file");
                return response || fetch(event.request);
            })
        );
    }
  });

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {

    const cacheDateHeader = cachedResponse.headers.get('date');

    if (cacheDateHeader) {
      const cacheDate = new Date(cacheDateHeader);
      const currentDate = new Date();
      const differenceInDays = (currentDate - cacheDate) / (1000 * 60 * 60 * 24);
      console.log(`Date of cached ABC file:\n\n` + cacheDate);
      return differenceInDays >= maxAgeInDays;
    }

    return false;
  }

  // Helper function preventing infinite loading if connection is lost during fetch request

  function fetchWithTimeout(request, timeout) {
    return Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out`)), timeout)
      ),
    ]);
  }