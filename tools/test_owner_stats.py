"""Checks for tools/owner_stats.py's parsing (no network): python3 tools/test_owner_stats.py"""
import datetime as dt
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import owner_stats as o  # noqa: E402


def utf16(text):
    return "﻿".encode("utf-16-le") + text.encode("utf-16-le")


INSTALLS = (
    "Date,Package Name,Daily Device Installs,Daily Device Uninstalls,Daily Device Upgrades,"
    "Total User Installs,Daily User Installs,Daily User Uninstalls,Current Device Installs,Installs On Active Devices\n"
    "2026-11-01,in.khalihan.app,3,1,2,70,3,1,60,55\n"
    "2026-11-02,in.khalihan.app,5,0,4,75,5,0,65,60\n"
)
OCT = (
    "Date,Package Name,Daily Device Installs,Daily Device Uninstalls,Daily Device Upgrades,"
    "Total User Installs,Daily User Installs,Daily User Uninstalls,Current Device Installs,Installs On Active Devices\n"
    "2026-10-20,in.khalihan.app,1,0,0,10,1,0,9,9\n"
)
VERSIONS = (
    "Date,Package Name,App Version Code,Current Device Installs,Installs On Active Devices\n"
    "2026-11-01,in.khalihan.app,6,40,38\n"
    "2026-11-02,in.khalihan.app,6,12,10\n"
    "2026-11-02,in.khalihan.app,7,50,48\n"
)


def check(name, got, want):
    if got != want:
        print(f"FAIL {name}: {got!r} != {want!r}")
        sys.exit(1)
    print(f"ok   {name}")


rows = o.decode_csv(utf16(INSTALLS)) + o.decode_csv(OCT.encode("utf-8"))
p = o.play_installs(rows, "2026-10-25")
check("utf-16 + utf-8 rows read", len(rows), 3)
check("days sorted, oldest first", [d["d"] for d in p["daily"]], ["2026-10-20", "2026-11-01", "2026-11-02"])
check("latest totals", (p["through"], p["total"], p["now"], p["active"]), ("2026-11-02", 75, 65, 60))
check("28-day sums skip older days", (p["i28"], p["u28"]), (8, 1))
check("uninstalls are not read as installs", p["daily"][1], {"d": "2026-11-01", "i": 3, "u": 1, "up": 2})
check("versions: newest day only, biggest first", o.play_versions(o.decode_csv(utf16(VERSIONS))),
      [{"k": "7", "n": 48}, {"k": "6", "n": 10}])
check("no rows → None", o.play_installs([], "2026-10-01"), None)
check("bucket from URI", o.bucket_name("gs://pubsite_prod_rev_0123/stats/installs/"), "pubsite_prod_rev_0123")
check("bucket plain", o.bucket_name(" pubsite_prod_rev_9 "), "pubsite_prod_rev_9")
check("months back over a year", o.months_back(dt.date(2026, 2, 3), 3), ["202602", "202601", "202512"])
check("rating: newest", o.play_last(o.decode_csv(b"Date,Package Name,Daily Average Rating,Total Average Rating\n"
                                                  b"2026-11-01,x,5,4.5\n2026-11-02,x,NA,4.62\n"), "total average rating"),
      ("2026-11-02", 4.62))
check("number parsing", (o.num("1,234"), o.num("4.50"), o.num(""), o.num(None)), (1234, 4.5, None, None))
resp = {"rows": [
    {"dimensionValues": [{"value": "(not set)"}], "metricValues": [{"value": "9"}]},
    {"dimensionValues": [{"value": "Jalgaon"}], "metricValues": [{"value": "5"}]},
    {"dimensionValues": [{"value": "Pune"}], "metricValues": [{"value": "7"}]},
]}
check("analytics rows → top list, '(not set)' dropped", o.top(o.ga_rows(resp, ["d"], ["activeUsers"]), "d", "activeUsers", 5),
      [{"k": "Pune", "n": 7}, {"k": "Jalgaon", "n": 5}])
print("all owner_stats checks passed")
