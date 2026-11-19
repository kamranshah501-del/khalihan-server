"""IMD warnings (functions/alerts/imd_core.py): what reaches a farmer's phone.

Real IMD rows of 19 Nov 2026 (a quiet day in Maharashtra; cyclone Akvan in
Andhra, Odisha and Bengal) plus the same rows with one value changed — the
hail day that the forecast models missed, written the way IMD writes it.
Run: python tools/test_imd.py
"""
import copy
import json
import os
import sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "functions", "alerts"))
import imd_core as m  # noqa: E402

FIX = os.path.join(HERE, "fixtures", "imd")


def load(name):
    with open(os.path.join(FIX, name), encoding="utf-8") as f:
        return json.load(f)


NC = load("2026-11-19_nowcast_mh.json")
FD = load("2026-11-19_fiveday_mh.json")
OTHER = load("2026-11-19_fiveday_other_states.json")


def at(hhmm, day="2026-11-19"):
    return datetime.fromisoformat(f"{day}T{hhmm}:00+05:30")


def row(rows, district):
    return next(r for r in rows if r["properties"]["District"] == district)


def kinds(items, district):
    return sorted({(it["k"], it["l"], it["day"], it["s"]) for it in items if it["d"] == district})


passed = 0


def check(name, got, want):
    global passed
    if got != want:
        raise SystemExit(f"FAIL {name}\n  got:  {got}\n  want: {want}")
    passed += 1
    print(f"ok  {name}")


# 1. The real day: nothing in Maharashtra, nothing sent.
check("19 Nov 2026 as IMD issued it: no warning in Maharashtra", m.plan(NC, FD, at("16:30")), [])

# 2. The 5-day bulletin puts hail on Pune tomorrow (orange), as on 29 Mar 2026
#    for Madhya Maharashtra.
fd = copy.deepcopy(FD)
p = row(fd, "PUNE")["properties"]
p["Day_2"], p["Day2_Color"] = "4,5", 2
check("5-day: Pune tomorrow 4,5 orange → hail and storm, tomorrow",
      kinds(m.plan(NC, fd, at("16:30")), "pune"),
      [("hail", "o", "2026-11-20", "5d"), ("storm", "o", "2026-11-20", "5d")])

# 3. Hail at yellow is still hail; a yellow thunderstorm alone is not sent.
p["Day_2"], p["Day2_Color"] = "4,5", 3
check("5-day: hail at yellow still goes", kinds(m.plan(NC, fd, at("16:30")), "pune"),
      [("hail", "y", "2026-11-20", "5d")])
p["Day_2"], p["Day2_Color"] = "4", 3
check("5-day: yellow thunderstorm alone stays quiet", m.plan(NC, fd, at("16:30")), [])

# 4. Nowcast: thunderstorm with hail over Nashik, 16:00–19:00, red.
nc = copy.deepcopy(NC)
q = row(nc, "NASHIK")["properties"]
q.update({"cat1": 0, "cat9": 9, "cat17": 17, "Color": 4, "toi": "1600", "vupto": "1900"})
check("nowcast: Nashik hail now → hail (red) and storm, until 19:00",
      [(it["k"], it["l"], it["u"]) for it in m.plan(nc, FD, at("16:30")) if it["d"] == "nashik"],
      [("hail", "r", "19:00"), ("storm", "r", "19:00")])
check("nowcast: after 19:00 it is over", m.plan(nc, FD, at("19:30")), [])
check("nowcast: yesterday's nowcast is no warning", m.plan(nc, FD, at("16:30", "2026-11-20")), [])

# 5. Old bulletins and other states stay out.
fd = copy.deepcopy(FD)
p = row(fd, "JALGAON")["properties"]
p["Day_1"], p["Day1_Color"], p["Date"] = "5", 2, "2026-11-15"
check("5-day: a bulletin 4 days old is ignored", m.plan(NC, fd, at("16:30")), [])
fd = copy.deepcopy(FD)
bihar = row(fd, "AURANGABAD")
bihar["properties"]["Day_1"], bihar["properties"]["Day1_Color"] = "5", 1
check("5-day: Bihar's Aurangabad (outside Maharashtra) is ignored", m.plan(NC, fd, at("16:30")), [])
mh = row(fd, "AURANGABAAD")["properties"]
mh["Day_1"], mh["Day1_Color"] = "5", 1
check("5-day: Maharashtra's Aurangabad (IMD: AURANGABAAD) → aurangabad",
      kinds(m.plan(NC, fd, at("16:30")), "aurangabad"), [("hail", "r", "2026-11-19", "5d")])

# 6. Mumbai City and Mumbai Suburban are one district in the app.
fd = copy.deepcopy(FD)
for d, c in (("MUMBAI CITY", 2), ("MUMBAI SUBURBAN", 1)):
    row(fd, d)["properties"].update({"Day_1": "2,4,8", "Day1_Color": c})
check("Mumbai City + Suburban → one mumbai row each kind, the stronger colour",
      kinds(m.plan(NC, fd, at("16:30")), "mumbai"),
      [("rain", "r", "2026-11-19", "5d"), ("storm", "r", "2026-11-19", "5d"), ("wind", "r", "2026-11-19", "5d")])

# 7. IMD's real codes today elsewhere (cyclone Akvan, "16,4,8" orange).
check("real 19 Nov rows elsewhere: very heavy rain + thunderstorm + wind, orange",
      [m.fiveday_kinds(r["properties"]["Day_1"], r["properties"]["Day1_Color"]) for r in OTHER],
      [["storm", "rain", "wind"]] * len(OTHER))
check("heat wave, ground frost", (m.fiveday_kinds("9", 3), m.fiveday_kinds("14", 3), m.fiveday_kinds("12", 2)),
      (["heat"], ["frost"], []))


# 8. The pass: sends once, then stays quiet; memory forgets after 3 days.
class Doc:
    def __init__(self, store):
        self.store = store

    def get(self):
        s = self.store

        class Snap:
            exists = "v" in s

            def to_dict(self):
                return copy.deepcopy(s.get("v"))
        return Snap()

    def set(self, v):
        self.store["v"] = v


class DB:
    def __init__(self):
        self.mem = {}

    def collection(self, _):
        db = self

        class Col:
            def document(self, _):
                return Doc(db.mem)
        return Col()


db, out = DB(), []
fd = copy.deepcopy(FD)
row(fd, "PUNE")["properties"].update({"Day_2": "4,5", "Day2_Color": 2})
line1 = m.run(db, at("16:30"), send=lambda t, d: out.append((t, d)), fetched=(NC, fd))
line2 = m.run(db, at("16:40"), send=lambda t, d: out.append((t, d)), fetched=(NC, fd))
check("pass: first sends 2 new to wx_maharashtra, second sends nothing",
      (len(out), out[0][0], json.loads(out[0][1]["w"]), "2 new" in line1, "0 new" in line2),
      (1, "wx_maharashtra", [["pune", "hail", "o", "2026-11-20", "5d", ""], ["pune", "storm", "o", "2026-11-20", "5d", ""]], True, True))
m.run(db, at("16:30", "2026-11-24"), send=lambda t, d: out.append((t, d)), fetched=(NC, FD))
check("pass: memory keeps 3 days only", db.mem["v"]["sent"], {})

# 9. The test push fits in one FCM message (4 KB of data).
data = m.payload(m.fake(at("16:30")), test=True)
check("test push: hail in all 35 app districts, under 4 KB",
      (len(json.loads(data["w"])), len(json.dumps(data)) < 4000, data["test"]), (35, True, "1"))

print(f"\n{passed} checks passed")
