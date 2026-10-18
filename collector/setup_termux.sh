#!/data/data/com.termux/files/usr/bin/bash
# Khalihan price collector — one-time setup in Termux (Android).
#
#   curl -fsSL https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/collector/setup_termux.sh | bash
#
# Asks for the data.gov.in key and the GitHub token (typed, not shown),
# keeps them only on this phone (~/.khalihan, private), tests the key, and
# adds the command "khalihan".
set -e
RAW="https://raw.githubusercontent.com/kamranshah501-del/khalihan-server/main/collector"

echo "🌾 Khalihan price collector — setup"
echo "   (pehli baar 1–2 minute lagenge)"
pkg install -y python >/dev/null 2>&1 || pkg install -y python
mkdir -p ~/.khalihan
chmod 700 ~/.khalihan
curl -fsSL "$RAW/collect.py" -o ~/.khalihan/collect.py

if [ ! -s ~/.khalihan/key ]; then
  printf "\n🔑 data.gov.in ki key paste karo (screen pe dikhegi nahi), phir Enter: "
  read -rs KEY </dev/tty; echo
  printf '%s' "$KEY" | tr -d ' \r\n' > ~/.khalihan/key
fi
chmod 600 ~/.khalihan/key

echo "⏳ Key test ho rahi hai…"
if ! python ~/.khalihan/collect.py --test; then
  echo "❌ data.gov.in ne jawab nahi diya. Internet check karo, ya key galat ho sakti hai:"
  echo "   rm ~/.khalihan/key   aur setup dobara chalao."
  exit 1
fi

if [ ! -s ~/.khalihan/token ]; then
  printf "\n🔐 GitHub token paste karo (screen pe dikhega nahi), phir Enter: "
  read -rs TOKEN </dev/tty; echo
  printf '%s' "$TOKEN" | tr -d ' \r\n' > ~/.khalihan/token
fi
chmod 600 ~/.khalihan/token

cat > "$PREFIX/bin/khalihan" <<EOS
#!/data/data/com.termux/files/usr/bin/bash
# khalihan         start: a round now, then every 3 hours (keep Termux open)
# khalihan once    one round now
# khalihan log     the last lines of the log
# khalihan update  get the newest collect.py
case "\$1" in
  log)    tail -n 30 ~/.khalihan/log.txt ;;
  once)   python ~/.khalihan/collect.py ;;
  update) curl -fsSL "$RAW/collect.py" -o ~/.khalihan/collect.py && echo "✅ updated" ;;
  *)
    termux-wake-lock 2>/dev/null || true
    echo "🌾 Khalihan collector chal raha hai — har 3 ghante bhav GitHub pe jayenge."
    echo "   Termux band mat karna. Rokna ho to: Ctrl + C"
    while true; do
      python ~/.khalihan/collect.py || true
      sleep 10800
    done ;;
esac
EOS
chmod +x "$PREFIX/bin/khalihan"

echo ""
echo "✅ Setup ho gaya. Ab ye likh ke Enter dabao:   khalihan"
