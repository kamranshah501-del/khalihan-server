#!/bin/bash
# Khalihan price collector — one-time setup on a Linux server (e.g. the
# Mumbai VM on Google Cloud) or any always-on Linux computer.
#
#   curl -fsSL https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/collector/setup_linux.sh | bash
#
# Asks for the data.gov.in key (and the GitHub token — Enter skips it for a
# test-only run), keeps them only here (~/.khalihan, private), tests that
# data.gov.in answers this machine, and schedules collect.py.
set -e
RAW="https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/collector"

echo "🌾 Khalihan price collector — setup"
if ! command -v python3 >/dev/null 2>&1; then
  sudo apt-get update -qq && sudo apt-get install -y -qq python3
fi
mkdir -p ~/.khalihan
chmod 700 ~/.khalihan
curl -fsSL "$RAW/collect.py" -o ~/.khalihan/collect.py

if [ ! -s ~/.khalihan/key ]; then
  printf "\n🔑 data.gov.in ki key paste karo (screen pe dikhegi nahi), phir Enter: "
  read -rs KEY </dev/tty; echo
  printf '%s' "$KEY" | tr -d ' \r\n' > ~/.khalihan/key
fi
chmod 600 ~/.khalihan/key

echo "⏳ Test: kya data.gov.in is computer ko jawab deta hai…"
if ! python3 ~/.khalihan/collect.py --test; then
  echo ""
  echo "❌ data.gov.in ne is computer ko jawab nahi diya (ya key galat hai)."
  echo "   Ye result Claude ko bata do. Key badalni ho to:  rm ~/.khalihan/key  aur setup dobara."
  exit 1
fi

if [ ! -s ~/.khalihan/token ]; then
  printf "\n🔐 GitHub token paste karo (dikhega nahi). Abhi sirf test tha to bas Enter dabao: "
  read -rs TOKEN </dev/tty; echo
  if [ -z "$TOKEN" ]; then
    echo "👍 Test safal. Token bana ke yahi setup dobara chalana — key dobara nahi poochega."
    exit 0
  fi
  printf '%s' "$TOKEN" | tr -d ' \r\n' > ~/.khalihan/token
fi
chmod 600 ~/.khalihan/token

# Before each run of the daily job (00:30, 05:30, 09:30, 14:00 UTC), and
# once in the evening so the feed never goes stale. Times are UTC.
if ! command -v crontab >/dev/null 2>&1; then
  sudo apt-get update -qq && sudo apt-get install -y -qq cron
fi
LINE="10 0,5,9,13,18 * * * python3 \$HOME/.khalihan/collect.py >> \$HOME/.khalihan/cron.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'khalihan/collect.py' ; echo "$LINE" ) | crontab -

mkdir -p ~/bin
cat > ~/bin/khalihan <<EOS
#!/bin/bash
# khalihan log | once | update
case "\$1" in
  once)   python3 ~/.khalihan/collect.py ;;
  update) curl -fsSL "$RAW/collect.py" -o ~/.khalihan/collect.py && echo "✅ updated" ;;
  *)      tail -n 30 ~/.khalihan/log.txt 2>/dev/null || echo "Abhi koi log nahi." ;;
esac
EOS
chmod +x ~/bin/khalihan
grep -q 'HOME/bin' ~/.bashrc 2>/dev/null || echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc

echo "⏳ Pehla round abhi chal raha hai (2–5 minute)…"
python3 ~/.khalihan/collect.py || true
echo ""
echo "✅ Setup ho gaya. Ab ye apne aap din me 5 baar chalega."
echo "   Haal dekhna ho to:  ~/bin/khalihan"
