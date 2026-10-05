# rerun-filter
Chrome extension to filter Rebroadcasts on Twitch.

Available at https://chrome.google.com/webstore/detail/twitch-rerun-filter/ggjnccbdidpaainpegpepolnjjonijjm

## Historical prototype and local checks

This repository contains a Manifest V2 Twitch extension. Browser/store compatibility and current Twitch selectors are unverified; these repairs do not migrate it to Manifest V3. The existing store URL above is a historical reference.

Build tools now have a committed private npm manifest and lockfile. Chrome types retain the previously locked version; the compiler is pinned for the historical source. Use Node18+ for the built-in regression runner:

```bash
npm ci --ignore-scripts
npm test
npm run build
```

The build terminates and writes ignored `out/filter.js` and `out/background.js` alongside the tracked manifest/icons. Use `npm run watch` explicitly for development. The manifest no longer requests an absent, unused jQuery file. Real-source regression fixtures verify that repeated singleton lookups retain one filter/timer and navigation clears that active filter. Browser integration, tab isolation and selector behavior still need a separate compatibility milestone.
