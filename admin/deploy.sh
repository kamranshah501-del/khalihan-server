#!/bin/bash
# Khalihan Admin + Firestore rules → Firebase (run on the Mac).
#   bash admin/deploy.sh          → panel + rules
#   bash admin/deploy.sh hosting  → only the panel
#   bash admin/deploy.sh rules    → only the rules
set -e
cd "$(dirname "$0")/.."

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

case "${1:-all}" in
  hosting) firebase deploy --only hosting ;;
  rules)   firebase deploy --only firestore:rules ;;
  *)       firebase deploy --only hosting,firestore:rules ;;
esac

echo ""
echo "✅ Ho gaya. Admin panel: upar 'Hosting URL' wala link (…web.app) kholo."
