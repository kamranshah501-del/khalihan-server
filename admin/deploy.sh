#!/bin/bash
# Khalihan Admin + Firestore rules → Firebase. Runs on the Mac, or from a
# phone in Google Cloud Shell (shell.cloud.google.com — no typing of lists,
# no arrow keys needed):
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
  if command -v npm >/dev/null 2>&1; then
    echo "⏳ Firebase CLI install ho raha hai (ek baar, 1–2 minute)…"
    npm install -g firebase-tools >/dev/null 2>&1 || true
  fi
fi
if ! command -v firebase >/dev/null 2>&1; then
  echo "❌ Firebase CLI nahi mila. Pehle ye chalao (ek baar):"
  echo "   curl -sL https://firebase.tools | bash"
  exit 1
fi

# One-time: log in with the Google account that owns the Firebase project.
# In Cloud Shell or over SSH the browser can't call back: the CLI shows a
# link, you log in there and paste the code back.
if ! firebase projects:list >/dev/null 2>&1; then
  if [ -n "$CLOUD_SHELL" ] || [ -n "$SSH_CONNECTION" ]; then
    firebase login --no-localhost
  else
    firebase login
  fi
fi

# One-time: pick the Khalihan project (saved in .firebaserc, not in git).
# Only one project on the account → taken without asking; several → type
# its ID (easier on a phone than a list).
if [ ! -f .firebaserc ]; then
  CHOSEN="${PROJECT_ID:-}"
  if [ -z "$CHOSEN" ]; then
    IDS=$(firebase projects:list --json 2>/dev/null \
      | sed -n 's/.*"projectId"[[:space:]]*:[[:space:]]*"\([a-z0-9-]*\)".*/\1/p' | sort -u)
    if [ "$(printf '%s\n' "$IDS" | grep -c .)" = "1" ]; then
      CHOSEN="$IDS"
    else
      echo "👉 Aapke Firebase projects:"
      printf '   %s\n' $IDS
      read -r -p "   Khalihan wale project ka ID likho: " CHOSEN </dev/tty
    fi
  fi
  [ -n "$CHOSEN" ] || { echo "❌ Project nahi chuna — ruk gaya."; exit 1; }
  printf '{\n  "projects": {\n    "default": "%s"\n  }\n}\n' "$CHOSEN" > .firebaserc
  echo "✅ Project: $CHOSEN"
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
    MADE=""
    for NAME in khalihan-admin khalihan-admin-panel khalihan-team; do
      if firebase hosting:sites:get "$NAME" >/dev/null 2>&1; then SITE="$NAME"; break; fi
      if [ -n "$APP_ID" ] && firebase hosting:sites:create "$NAME" --app "$APP_ID" --non-interactive >/dev/null 2>&1; then
        SITE="$NAME"; MADE=1; break
      fi
      if firebase hosting:sites:create "$NAME" --non-interactive >/dev/null 2>&1; then SITE="$NAME"; MADE=1; break; fi
      echo "   '$NAME' nahi mila (shayad kisi aur ka hai) — agla naam try…"
    done
    if [ -z "$SITE" ]; then
      echo "⚠️  Khud nahi ban paya. Firebase console → Hosting → 'Add another site' →"
      echo "   naam likho (jaise khalihan-admin) → bana lo."
      read -r -p "   Jo naam banaya wo yahan likho: " SITE </dev/tty
      [ -n "$SITE" ] || { echo "❌ Naam nahi diya — ruk gaya."; exit 1; }
      MADE=1
    fi
    firebase target:apply hosting admin "$SITE"
    firebase target:apply hosting moved "$PROJECT"
    # A site that already existed (a new computer, Cloud Shell) has its
    # login domain added long ago — ask only for a brand-new one.
    if [ -n "$MADE" ]; then
      echo ""
      echo "👉 ZAROORI — warna naye pate pe Google login nahi chalega:"
      echo "   Firebase console → Authentication → Settings → Authorized domains"
      echo "   → Add domain → $SITE.web.app → Add"
      read -r -p "   Add kar diya? Enter dabao… " _ </dev/tty
    fi
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
