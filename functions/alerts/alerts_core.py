"""Khalihan Admin — alerts on the team's phones and computers (the shared core).

Owner, 18 Nov 2026 ("Part 2" of the Admin rework, approved 10:41; 14:41 "GitHub
se Firebase pe jo bhi le jana hai le ja lo"): a farmer's message must reach
the team even when Admin is closed, and be answered within 4 hours.

Runs in Google Cloud (functions/alerts/main.py, deployed by deploy.sh):
  • at once, when a document is created — a farmer message (feedback/), a
    team reply (inbox/{dev}/replies/), "Send me a test alert" (alert_requests/);
  • every 10 minutes (Cloud Scheduler → tick): messages waiting 3 hours,
    many in one hour, Khalihan Pro changes, the launch counter, the morning
    summary at 8:00 each person's time — and anything the instant path missed.
tools/admin_alerts.py runs the same pass from GitHub, by hand only.

Each alert goes to alerts_team or alerts_owner (Admin's bell) and as a web
push to every device in staff_devices whose person wants it (staff_prefs).
An alert is sent once: watcher_sent/{tag} is created first (create fails if
it exists), so the instant path and the 10-minute pass never both send it.
Memory: watcher/admin_alerts. No browser can read either (rules).
Prints counts only — never a name, number, message or amount.
"""

import hashlib
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from firebase_admin import firestore, messaging
from google.api_core.exceptions import AlreadyExists

ADMIN = "https://khalihan-admin.web.app"
PROMISE = timedelta(hours=4)
REMIND_AFTER = timedelta(hours=3)
BURST_N = 5                       # messages in one hour = "many farmers at once"
BURST_GAP = timedelta(hours=2)    # at most one such alert in two hours
MILESTONES = [500, 750, 1000]
MORNING_HOUR = 8
KEEP = timedelta(days=30)         # the bell keeps a month
FRESH = timedelta(minutes=2)      # younger: the instant path sends it
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

    def once(self, key):
        """True the first time [key] is claimed; False if it was sent before."""
        try:
            self.db.collection("watcher_sent").document(key).create({"at": firestore.SERVER_TIMESTAMP})
            return True
        except AlreadyExists:
            return False

    def send(self, alert, keep=True):
        if alert.get("once") and not self.once(alert["once"]):
            return
        self.count(alert["kind"])
        if keep:
            self.bell(alert)
        self.push(alert)


def message_alert(f):
    """A new farmer message as an alert."""
    text = str(f.get("text", ""))
    kind = f.get("kind") or ("ai_wrong" if text.startswith("🤖") else "")
    problem = kind in ("problem", "ai_wrong")
    label = {"problem": "Problem", "ai_wrong": "AI answer wrong", "praise": "Praise", "suggestion": "Suggestion"}.get(kind, "New farmer message")
    who = f"{f['name']}, " if f.get("name") else ""
    return {
        "kind": "msg_problem" if problem else "msg_new",
        "title": f"{label} · {who}{place(f)}",
        "body": short(text, 150),
        "link": f"/#feedback/{f['id']}", "tag": f"fb-{f['id']}", "once": f"fb-{f['id']}",
    }


def push_reply(run, dev, rid):
    """The team's reply → the farmer's phone (a data push the app shows)."""
    if not dev or not rid or not run.once(f"reply-{rid}"):
        return
    try:
        box = run.db.collection("inbox").document(dev)
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
    run.db.collection("reply_queue").document(rid).delete()


def test_alert(run, req_id, r):
    email = str(r.get("email", "")).lower()
    if email in run.people:
        run.send({
            "kind": "test", "only": email, "device": str(r.get("device") or ""),
            "title": "Test alert from Khalihan Admin",
            "body": "Alerts reach this device even when Admin is closed.",
            "link": "/#settings", "tag": "test", "once": f"test-{req_id}",
        }, keep=False)
    run.db.collection("alert_requests").document(req_id).delete()


def on_document(db, path, now):
    """The instant path: one new document (its path, e.g. feedback/abc)."""
    parts = str(path).strip("/").split("/")
    run = Run(db, now)
    if len(parts) == 2 and parts[0] == "feedback":
        snap = db.collection("feedback").document(parts[1]).get()
        if snap.exists:
            f = snap.to_dict() or {}
            f["id"] = snap.id
            run.send(message_alert(f))
            db.collection("watcher").document("admin_alerts").set({"fb_seen": firestore.ArrayUnion([snap.id])}, merge=True)
    elif len(parts) == 4 and parts[0] == "inbox" and parts[2] == "replies":
        push_reply(run, parts[1], parts[3])
    elif len(parts) == 2 and parts[0] == "alert_requests":
        snap = db.collection("alert_requests").document(parts[1]).get()
        if snap.exists:
            test_alert(run, snap.id, snap.to_dict() or {})
    return summary(run)


def summary(run, first=False):
    what = " · ".join(f"{k} {v}" for k, v in sorted(run.counts.items())) or "nothing new"
    return f"{'First run: memory set up. ' if first else ''}{what} · pushes sent {run.sent} · devices {len(run.devices)}"


def run_pass(db, now):
    """The 10-minute pass. Returns one line of counts."""
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
        if now - f["at"] < FRESH:
            continue  # the instant path is sending it right now
        seen.add(f["id"])
        if f["at"] < last_run - timedelta(days=1):
            continue  # an old one the memory had let go
        run.send(message_alert(f))
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
            "link": f"/#feedback/{f['id']}", "tag": f"wait-{f['id']}", "once": f"wait-{f['id']}",
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

    # ── replies the instant path missed (app 1.0.10, Admin 1.31) ──
    for d in db.collection("reply_queue").limit(50).stream():
        q = d.to_dict() or {}
        at = q.get("at")
        if isinstance(at, datetime) and now - at < FRESH:
            continue
        push_reply(run, str(q.get("dev") or ""), str(q.get("reply") or d.id))

    # ── "Send me a test alert" the instant path missed ──
    for d in db.collection("alert_requests").limit(20).stream():
        r = d.to_dict() or {}
        at = r.get("at")
        if isinstance(at, datetime) and now - at < FRESH:
            continue
        test_alert(run, d.id, r)

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
            "kind": "morning", "only": email, "owner": owner, "once": f"morning-{email}-{today}",
            "title": "Good morning — Khalihan", "body": " · ".join(parts),
            "link": "/#home", "tag": "morning",
        }
        run.send(alert, keep=owner)

    # ── the bell keeps a month ──
    cutoff = now - KEEP
    for name in ("alerts_team", "alerts_owner", "watcher_sent"):
        for d in db.collection(name).where("at", "<", cutoff).limit(200).stream():
            d.reference.delete()

    ids_now = [f["id"] for f in fb]
    # Merged: other keys stay. fb_seen is the pass's own list (an id the
    # instant path sent meanwhile is still guarded by watcher_sent).
    mem_ref.set({
        "at": now,
        "fb_seen": [i for i in ids_now if i in seen][:300],
        "fb_reminded": [i for i in ids_now if i in reminded][:300],
        "burst_at": burst_at,
        "pro": new_pro,
        "launch_done": sorted(done_ms),
        "morning": mornings,
    }, merge=True)
    return summary(run, first)
