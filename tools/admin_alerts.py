"""Khalihan Admin — alerts on the team's phones and computers.

Owner, 18 Nov 2026 ("Part 2" of the Admin rework, approved 10:41): a farmer's
message must reach the team even when Admin is closed, and be answered within
4 hours. Until now Admin only rang inside an open tab, and never for messages.

Runs every 10 minutes from GitHub Actions (.github/workflows/admin-alerts.yml)
with the daily job's service account. Each run:
  1. sees what is new — farmer messages (feedback), messages waiting 3 hours,
     many messages in one hour, Khalihan Pro bought / trial / cancelled /
     refunded, the launch counter passing 500, 750 and 1,000, "Send me a test
     alert" from Admin, and at 8:00 each person's time the morning summary;
  2. writes each alert to alerts_team or alerts_owner (Admin's bell);
  3. sends it as a web push to every device in staff_devices whose person
     wants it (staff_prefs/{email}: the kinds, quiet hours, time zone). The
     same table of kinds is in admin/public/alerts.js (ALERT_KINDS).
Its own memory is watcher/admin_alerts (the rules let no browser read it).

The repository is public: this prints counts only — never a name, number,
message or amount.
"""

import hashlib
import json
import os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import firebase_admin
from firebase_admin import credentials, firestore, messaging

ADMIN = "https://khalihan-admin.web.app"
PROMISE = timedelta(hours=4)
REMIND_AFTER = timedelta(hours=3)
BURST_N = 5                       # messages in one hour = "many farmers at once"
BURST_GAP = timedelta(hours=2)    # at most one such alert in two hours
MILESTONES = [500, 750, 1000]
MORNING_HOUR = 8
KEEP = timedelta(days=30)         # the bell keeps a month
DEFAULT_TZ = "Asia/Kolkata"

# Same as ALERT_KINDS in admin/public/alerts.js.
KINDS = {
    "msg_problem": {"who": "both", "sound": True},
    "msg_new": {"who": "both", "sound": False},
    "msg_3h": {"who": "both", "sound": True},
    "many": {"who": "both", "sound": True, "always": True, "loud": True},
    "pro": {"who": "owner", "sound": True},
    "launch": {"who": "owner", "sound": True},
    "morning": {"who": "both", "sound": False, "team_off": True},
    "test": {"who": "both", "sound": True, "always": True, "loud": True},
}


def wants(prefs, kind, owner):
    k = KINDS[kind]
    if k.get("always"):
        return True
    if k["who"] == "owner" and not owner:
        return False
    mine = (prefs or {}).get("kinds") or {}
    if isinstance(mine.get(kind), bool):
        return mine[kind]
    return not (k.get("team_off") and not owner)


def zone(prefs):
    try:
        return ZoneInfo((prefs or {}).get("tz") or DEFAULT_TZ)
    except Exception:
        return ZoneInfo(DEFAULT_TZ)


def in_quiet(prefs, now):
    q = (prefs or {}).get("quiet") or {"from": "22:00", "to": "07:00"}
    try:
        a = [int(x) for x in q.get("from", "22:00").split(":")]
        b = [int(x) for x in q.get("to", "07:00").split(":")]
    except ValueError:
        return False
    t = now.astimezone(zone(prefs))
    m, fa, fb = t.hour * 60 + t.minute, a[0] * 60 + a[1], b[0] * 60 + b[1]
    if fa == fb:
        return False
    return fa <= m < fb if fa < fb else (m >= fa or m < fb)


def ago(delta):
    mins = int(delta.total_seconds() // 60)
    if mins < 60:
        return f"{mins} min"
    h = mins // 60
    if h < 24:
        return f"{h} h {mins % 60:02d} m"
    return f"{h // 24} d {h % 24} h"


def place(f):
    return f.get("district") or f.get("state") or "—"


def short(text, n):
    t = " ".join(str(text or "").split())
    return t if len(t) <= n else t[: n - 1] + "…"


def months_of(base_plan):
    import re
    m = re.match(r"^([my])?(\d+)", str(base_plan or ""), re.I)
    if not m:
        return 1
    n = max(1, int(m.group(2)))
    return n * 12 if (m.group(1) or "").lower() == "y" else n


class Run:
    def __init__(self, db, now):
        self.db = db
        self.now = now
        self.counts = {}
        self.sent = 0
        people = {}
        for d in db.collection("staff").stream():
            people[d.id.lower()] = (d.to_dict() or {}).get("role", "staff")
        self.people = people
        self.prefs = {d.id.lower(): d.to_dict() or {} for d in db.collection("staff_prefs").stream()}
        self.devices = list(db.collection("staff_devices").stream())

    def count(self, key, n=1):
        self.counts[key] = self.counts.get(key, 0) + n

    def bell(self, alert):
        """Admin's bell: the team's list, or the owner's own."""
        name = "alerts_owner" if KINDS[alert["kind"]]["who"] == "owner" or alert.get("owner") else "alerts_team"
        self.db.collection(name).add({
            "kind": alert["kind"], "title": alert["title"], "body": alert["body"],
            "link": alert["link"], "at": firestore.SERVER_TIMESTAMP,
        })

    def push(self, alert):
        """One web push per device that wants it."""
        kind = KINDS[alert["kind"]]
        msgs, targets = [], []
        for d in self.devices:
            dev = d.to_dict() or {}
            email = str(dev.get("email", "")).lower()
            role = self.people.get(email)
            if not role or not dev.get("token"):
                continue  # no longer on the team
            if alert.get("only") and alert["only"] != email:
                continue
            if alert.get("device") and alert["device"] != d.id:
                continue
            owner = role == "owner"
            if (kind["who"] == "owner" or alert.get("owner")) and not owner:
                continue
            p = self.prefs.get(email, {})
            if not wants(p, alert["kind"], owner):
                continue
            if not kind.get("loud") and in_quiet(p, self.now):
                continue
            msgs.append(messaging.Message(
                token=dev["token"],
                webpush=messaging.WebpushConfig(
                    headers={"Urgency": "high" if kind["sound"] else "normal", "TTL": str(12 * 3600)},
                    notification=messaging.WebpushNotification(
                        title=alert["title"], body=alert["body"],
                        icon=ADMIN + "/icons/icon-192.png",
                        tag=alert["tag"], renotify=True,
                        silent=not kind["sound"], require_interaction=bool(kind.get("loud")),
                    ),
                    fcm_options=messaging.WebpushFCMOptions(link=ADMIN + alert["link"]),
                ),
            ))
            targets.append(d)
        for i in range(0, len(msgs), 500):
            resp = messaging.send_each(msgs[i:i + 500])
            for r, d in zip(resp.responses, targets[i:i + 500]):
                if r.success:
                    self.sent += 1
                    d.reference.update({"last_sent": firestore.SERVER_TIMESTAMP})
                    continue
                e = r.exception
                gone = isinstance(e, (messaging.UnregisteredError, messaging.SenderIdMismatchError)) \
                    or "not a valid FCM registration token" in str(e) or "Requested entity was not found" in str(e)
                if gone:
                    d.reference.delete()
                    self.count("devices_removed")
                else:
                    print(f"  a push failed: {type(e).__name__}")

    def send(self, alert, keep=True):
        self.count(alert["kind"])
        if keep:
            self.bell(alert)
        self.push(alert)


def main():
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    db = firestore.client()
    now = datetime.now(timezone.utc)
    mem_ref = db.collection("watcher").document("admin_alerts")
    snap = mem_ref.get()
    first = not snap.exists
    mem = snap.to_dict() if snap.exists else {}
    run = Run(db, now)

    # ── farmer messages ──
    fb = []
    for d in db.collection("feedback").order_by("at", direction=firestore.Query.DESCENDING).limit(200).stream():
        f = d.to_dict() or {}
        f["id"] = d.id
        if isinstance(f.get("at"), datetime):
            fb.append(f)
    seen = set(mem.get("fb_seen") or [])
    reminded = set(mem.get("fb_reminded") or [])
    last_run = mem.get("at") if isinstance(mem.get("at"), datetime) else now - timedelta(hours=1)
    if first:
        seen = {f["id"] for f in fb}
        reminded = {f["id"] for f in fb if now - f["at"] >= REMIND_AFTER}
    for f in sorted(fb, key=lambda x: x["at"]):
        if f["id"] in seen:
            continue
        seen.add(f["id"])
        if f["at"] < last_run - timedelta(days=1):
            continue  # an old one the memory had let go
        text = str(f.get("text", ""))
        kind = f.get("kind") or ("ai_wrong" if text.startswith("🤖") else "")
        problem = kind in ("problem", "ai_wrong")
        label = {"problem": "Problem", "ai_wrong": "AI answer wrong", "praise": "Praise", "suggestion": "Suggestion"}.get(kind, "New farmer message")
        who = f"{f['name']}, " if f.get("name") else ""
        run.send({
            "kind": "msg_problem" if problem else "msg_new",
            "title": f"{label} · {who}{place(f)}",
            "body": short(text, 150),
            "link": f"/#feedback/{f['id']}", "tag": f"fb-{f['id']}",
        })
    for f in fb:
        if f.get("done") or f["id"] in reminded:
            continue
        waited = now - f["at"]
        if waited < REMIND_AFTER:
            continue
        reminded.add(f["id"])
        late = waited >= PROMISE
        run.send({
            "kind": "msg_3h",
            "title": f"Waiting {ago(waited)} — past the 4-hour promise" if late else f"{ago(PROMISE - waited)} left to reply",
            "body": f"{place(f)} · “{short(f.get('text', ''), 90)}”",
            "link": f"/#feedback/{f['id']}", "tag": f"wait-{f['id']}",
        })
    hour = [f for f in fb if now - f["at"] <= timedelta(hours=1)]
    burst_at = mem.get("burst_at") if isinstance(mem.get("burst_at"), datetime) else None
    if len(hour) >= BURST_N and (burst_at is None or now - burst_at >= BURST_GAP) and not first:
        places = sorted({place(f) for f in hour})
        run.send({
            "kind": "many",
            "title": f"{len(hour)} farmer messages in one hour",
            "body": ", ".join(places[:4]) + (" …" if len(places) > 4 else ""),
            "link": "/#feedback", "tag": "many",
        })
        burst_at = now

    # ── Khalihan Pro: bought, trial started, cancelled, refunded ──
    old_pro = mem.get("pro") or {}
    new_pro = {}
    for d in db.collection_group("plus").stream():
        if d.id != "state":
            continue
        m = d.to_dict() or {}
        uid = d.reference.parent.parent.id
        key = hashlib.sha256(uid.encode()).hexdigest()[:16]
        until = m.get("until")
        sig = {
            "plan": str(m.get("basePlan") or ""), "trial": bool(m.get("trial")), "renew": bool(m.get("autoRenew")),
            "state": str(m.get("playState") or ""), "test": bool(m.get("test")),
            "until": until.isoformat()[:10] if isinstance(until, datetime) else "",
        }
        new_pro[key] = sig
        if first:
            continue
        was = old_pro.get(key)
        event = None
        if was is None:
            event = "Khalihan Pro trial started" if sig["trial"] else f"Khalihan Pro bought · {months_of(sig['plan'])} month(s)"
        elif sig["state"] != was.get("state") and any(w in sig["state"].lower() for w in ("refund", "revok")):
            event = "Khalihan Pro refunded"
        elif was.get("renew") and not sig["renew"]:
            event = "Khalihan Pro cancelled (auto-renew off)"
        elif was.get("trial") and not sig["trial"]:
            event = "Khalihan Pro paid after the trial"
        if event:
            district = ""
            try:
                u = db.collection("users").document(uid).get()
                district = ((u.to_dict() or {}).get("district") or "") if u.exists else ""
            except Exception:
                pass
            run.send({
                "kind": "pro", "title": event + (" (test)" if sig["test"] else ""),
                "body": f"A farmer in {district.title()}" if district else "A farmer",
                "link": "/#plus", "tag": f"pro-{key}",
            })

    # ── the launch counter ──
    stats = db.collection("owner_stats").document("latest").get()
    got = (((stats.to_dict() or {}).get("ga") or {}).get("inn_launch")) if stats.exists else None
    done_ms = set(mem.get("launch_done") or [])
    if isinstance(got, (int, float)):
        for ms in MILESTONES:
            if got >= ms and ms not in done_ms:
                done_ms.add(ms)
                if not first:
                    run.send({
                        "kind": "launch",
                        "title": f"{ms:,} new farmers" + (" — time to launch" if ms == 1000 else ""),
                        "body": f"{int(got):,} of 1,000 on the launch counter",
                        "link": "/#features" if ms == 1000 else "/#stats", "tag": f"launch-{ms}",
                    })

    # ── the team's replies → the farmer's phone (app 1.0.10, Admin 1.31) ──
    for d in db.collection("reply_queue").limit(50).stream():
        q = d.to_dict() or {}
        dev, rid = str(q.get("dev") or ""), str(q.get("reply") or "")
        try:
            box = db.collection("inbox").document(dev)
            inbox = box.get()
            token = (inbox.to_dict() or {}).get("token") if inbox.exists else None
            rep = box.collection("replies").document(rid).get()
            text = str((rep.to_dict() or {}).get("text", "")) if rep.exists else ""
            if token and text:
                messaging.send(messaging.Message(
                    token=token,
                    data={"type": "reply", "id": rid, "text": short(text, 300)},
                    android=messaging.AndroidConfig(priority="high"),
                ))
                run.count("replies_pushed")
            else:
                run.count("replies_no_phone")
        except (messaging.UnregisteredError, messaging.SenderIdMismatchError):
            run.count("replies_no_phone")
        except Exception as e:
            print(f"  a reply push failed: {type(e).__name__}")
        d.reference.delete()

    # ── "Send me a test alert" from Admin ──
    for d in db.collection("alert_requests").limit(20).stream():
        r = d.to_dict() or {}
        email = str(r.get("email", "")).lower()
        if email in run.people:
            run.send({
                "kind": "test", "only": email, "device": str(r.get("device") or ""),
                "title": "Test alert from Khalihan Admin",
                "body": "Alerts reach this device even when Admin is closed.",
                "link": "/#settings", "tag": "test",
            }, keep=False)
        d.reference.delete()

    # ── the morning summary, 8:00 each person's time ──
    mornings = dict(mem.get("morning") or {})
    open_fb = sorted([f for f in fb if not f.get("done")], key=lambda x: x["at"])
    features = ((db.collection("config").document("app").get().to_dict() or {}).get("features")) or {}
    for email, role in run.people.items():
        p = run.prefs.get(email, {})
        owner = role == "owner"
        if not wants(p, "morning", owner):
            continue
        local = now.astimezone(zone(p))
        today = local.date().isoformat()
        if not (MORNING_HOUR <= local.hour < MORNING_HOUR + 3) or mornings.get(email) == today:
            continue
        mornings[email] = today
        if first:
            continue
        y0 = datetime.combine(local.date() - timedelta(days=1), datetime.min.time(), tzinfo=local.tzinfo)
        y1 = y0 + timedelta(days=1)
        replied = sum(1 for f in fb if isinstance(f.get("done_at"), datetime) and y0 <= f["done_at"] < y1)
        parts = []
        if owner and isinstance(got, (int, float)):
            parts.append(f"{int(got):,} of 1,000 farmers")
        if open_fb:
            parts.append(f"{len(open_fb)} message(s) waiting, oldest {ago(now - open_fb[0]['at'])}")
        else:
            parts.append("no message waiting")
        parts.append(f"{replied} replied yesterday")
        if owner:
            parts.append("Pro on sale" if features.get("pro_sale") is True else "Pro: sale starts at 1,000")
        alert = {
            "kind": "morning", "only": email, "owner": owner,
            "title": "Good morning — Khalihan", "body": " · ".join(parts),
            "link": "/#home", "tag": "morning",
        }
        run.send(alert, keep=owner)

    # ── the bell keeps a month ──
    cutoff = now - KEEP
    for name in ("alerts_team", "alerts_owner"):
        for d in db.collection(name).where("at", "<", cutoff).limit(200).stream():
            d.reference.delete()

    ids_now = [f["id"] for f in fb]
    mem_ref.set({
        "at": now,
        "fb_seen": [i for i in ids_now if i in seen][:300],
        "fb_reminded": [i for i in ids_now if i in reminded][:300],
        "burst_at": burst_at,
        "pro": new_pro,
        "launch_done": sorted(done_ms),
        "morning": mornings,
    })
    what = " · ".join(f"{k} {v}" for k, v in sorted(run.counts.items())) or "nothing new"
    print(f"{'First run: memory set up. ' if first else ''}{what} · pushes sent {run.sent} · devices {len(run.devices)}")


if __name__ == "__main__":
    main()
