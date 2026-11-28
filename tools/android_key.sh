#!/usr/bin/env bash
# A second Firebase key for the Android app that works ONLY from the real
# Khalihan app (package in.khalihan.app, signed by Play or by our upload key)
# — for the next app version (owner, 28 Nov 2026: "Haa"). The old key stays
# as it is, so the ~850 phones on older versions keep working; it is locked
# later, when those versions are gone.
#
# Run in Cloud Shell (project owner):
#   bash <(curl -s https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/android-key/tools/android_key.sh)
#
# It copies the API list of Firebase's own "Android key" and never prints a
# key: the new key is copied into the app by the owner (tool/use_android_key.sh
# in the app repo). Safe to run again: an existing key of the same name is
# kept, not doubled.
set -euo pipefail
P=mandi-price-tracker-756ea
NAME="Khalihan Android app only (28 Nov 2026)"
PKG=in.khalihan.app
# SHA-1 of: Play's app signing key in use for today's installs, Play's new
# key (not used yet), its post-quantum key, and our upload key (also the test builder's).
SHA1S="D3:F4:41:A4:04:5F:EE:CF:31:F1:CA:C8:FE:A7:4E:05:48:A5:28:EF 43:47:2E:A3:BD:D7:03:4D:A2:89:F3:96:AA:76:3F:53:55:5C:AE:23 07:89:04:5F:C0:F1:EC:16:5A:F0:77:75:6E:38:11:FE:35:A7:0C:C1 2F:05:C4:1D:F8:75:F5:AE:C5:2B:C4:BA:EE:D9:E5:80:A0:1B:37:E5"

gcloud services enable apikeys.googleapis.com --project "$P" >/dev/null
if [ -n "$(gcloud services api-keys list --project "$P" --filter="displayName=\"$NAME\"" --format='value(uid)')" ]; then
  echo "== Already there: $NAME"
else
  OLD=$(gcloud services api-keys list --project "$P" --filter='displayName~"^Android key"' --format='value(uid)' | head -1)
  [ -n "$OLD" ] || { echo "Firebase's Android key not found"; exit 1; }
  TARGETS=$(gcloud services api-keys describe "$OLD" --project "$P" --format=json \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(' '.join('--api-target=service='+t['service'] for t in d.get('restrictions',{}).get('apiTargets',[])))")
  [ -n "$TARGETS" ] || { echo "The old key has no API list to copy"; exit 1; }
  APPS=""; for s in $SHA1S; do APPS="$APPS --allowed-application=sha1_fingerprint=$s,package_name=$PKG"; done
  # --format=none: the new key's value is never printed here.
  gcloud services api-keys create --project "$P" --display-name="$NAME" $APPS $TARGETS --format=none
  echo "== Made: $NAME"
fi
NEW=$(gcloud services api-keys list --project "$P" --filter="displayName=\"$NAME\"" --format='value(uid)')
gcloud services api-keys describe "$NEW" --project "$P" \
  --format='table[box](displayName, restrictions.androidKeyRestrictions.allowedApplications.len():label=APPS, restrictions.apiTargets.len():label=APIS)'
echo "Next: in the app repo, tool/use_android_key.sh on the Mac (the owner pastes the key once)."
