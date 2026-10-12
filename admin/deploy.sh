#!/bin/bash
# Khalihan Admin + Firestore rules → Firebase (run on the Mac).
#   bash admin/deploy.sh          → panel + rules
#   bash admin/deploy.sh hosting  → only the panel
#   bash admin/deploy.sh rules    → only the rules
#
# The panel lives at its own address, https://khalihan-admin.web.app (made
# by this script the first time). The project's first address
# (https://<project>.web.app) only forwards there, keeping ?demo.
set -e
cd "$(dirname "$0")/.."
MODE="${1:-all}"

if ! command -v firebase >/dev/null 2>&1; then
  echo "❌ Firebase CLI nahi mila. Pehle ye chalao (ek baar):"
  echo "   curl -sL https://firebase.tools | bash"
  exit 1
fi

# One-time: log in with the Google account that owns the Firebase project.
if ! firebase projects:list >/dev/null 2>&1; then
  firebase login
fi

# One-time: pick the Khalihan project (saved in .firebaserc, not in git).
if [ ! -f .firebaserc ]; then
  echo "👉 Khalihan wala Firebase project chuno:"
  firebase use --add
fi

# The project's ID: the first "alias": "project-id" pair in .firebaserc.
PROJECT=$(sed -n 's/.*"[^"]*"[[:space:]]*:[[:space:]]*"\([a-z0-9-]*\)".*/\1/p' .firebaserc | head -n 1)
if [ -z "$PROJECT" ]; then
  echo "❌ .firebaserc me project nahi mila. 'firebase use --add' chalakar Khalihan wala project chuno, phir dobara."
  exit 1
fi

admin_site() {
  grep -A 2 '"admin"' .firebaserc 2>/dev/null \
    | sed -n 's/^[[:space:]]*"\([a-z0-9-]*\)"[[:space:]]*,\{0,1\}[[:space:]]*$/\1/p' | head -n 1
}

if [ "$MODE" != "rules" ]; then
  # One-time: the panel's own address + the old address forwarding to it.
  if [ -z "$(admin_site)" ]; then
    echo ""
    echo "🔧 Ek baar ka kaam: panel ka naya pata bana rahe hain…"
    APP_ID=$(firebase apps:list WEB --json 2>/dev/null \
      | sed -n 's/.*"appId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
    SITE=""
    for NAME in khalihan-admin khalihan-admin-panel khalihan-team; do
      if firebase hosting:sites:get "$NAME" >/dev/null 2>&1; then SITE="$NAME"; break; fi
      if [ -n "$APP_ID" ] && firebase hosting:sites:create "$NAME" --app "$APP_ID" --non-interactive >/dev/null 2>&1; then
        SITE="$NAME"; break
      fi
      if firebase hosting:sites:create "$NAME" --non-interactive >/dev/null 2>&1; then SITE="$NAME"; break; fi
      echo "   '$NAME' nahi mila (shayad kisi aur ka hai) — agla naam try…"
    done
    if [ -z "$SITE" ]; then
      echo "⚠️  Khud nahi ban paya. Firebase console → Hosting → 'Add another site' →"
      echo "   naam likho (jaise khalihan-admin) → bana lo."
      read -r -p "   Jo naam banaya wo yahan likho: " SITE
      [ -n "$SITE" ] || { echo "❌ Naam nahi diya — ruk gaya."; exit 1; }
    fi
    firebase target:apply hosting admin "$SITE"
    firebase target:apply hosting moved "$PROJECT"
    echo ""
    echo "👉 ZAROORI — warna naye pate pe Google login nahi chalega:"
    echo "   Firebase console → Authentication → Settings → Authorized domains"
    echo "   → Add domain → $SITE.web.app → Add"
    read -r -p "   Add kar diya? Enter dabao… " _
  fi
  SITE="$(admin_site)"
  SITE="${SITE:-khalihan-admin}"

  # The old address: a one-line page that sends everyone to the new one.
  mkdir -p admin/moved
  cat > admin/moved/index.html <<EOF
<!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Khalihan Admin</title>
<script>location.replace('https://$SITE.web.app/' + location.search + location.hash);</script>
<meta http-equiv="refresh" content="1; url=https://$SITE.web.app/">
</head>
<body style="font-family:system-ui,sans-serif;padding:32px;color:#16222c">
<p>Khalihan Admin ab naye pate pe hai:</p>
<p><a href="https://$SITE.web.app/" style="font-size:20px;font-weight:700;color:#20405E">$SITE.web.app</a></p>
</body>
</html>
EOF
fi

case "$MODE" in
  hosting) firebase deploy --only hosting ;;
  rules)   firebase deploy --only firestore:rules ;;
  *)       firebase deploy --only hosting,firestore:rules ;;
esac

echo ""
if [ "$MODE" = "rules" ]; then
  echo "✅ Ho gaya — naye Firestore rules lag gaye."
else
  echo "✅ Ho gaya. Admin panel: https://$SITE.web.app"
  echo "   Purana …web.app link khud naye pe le jata hai (?demo bhi)."
  echo "   Computer pe app: link Chrome/Edge me kholo → address bar ke right me"
  echo "   Install icon → Install (ya panel me ⚙️ Settings → Install)."
fi
