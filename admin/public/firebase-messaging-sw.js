/* Khalihan Admin — alerts while the panel is closed (Admin 1.30, owner
 * 18 Nov 2026, "Part 2" approved 10:41).
 *
 * The server's alert job (tools/admin_alerts.py) sends each alert as a web
 * push with a title, a line of text and the Admin page to open. Firebase
 * shows it and opens that page when it is tapped. The project's config comes
 * from Firebase Hosting's reserved init.js — nothing secret lives here.
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
importScripts('/__/firebase/init.js');

firebase.messaging();

// A new version of this file takes over at once.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
