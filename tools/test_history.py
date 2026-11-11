"""merge_history (daily_prices.py): one document holding every kept day."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import types  # noqa: E402

# The job's Firebase library isn't needed for this sum: stand-ins when absent.
try:
    import firebase_admin  # noqa: F401
except ImportError:
    fa = types.ModuleType('firebase_admin')
    for sub in ('credentials', 'firestore', 'messaging'):
        m = types.ModuleType('firebase_admin.' + sub)
        setattr(fa, sub, m)
        sys.modules['firebase_admin.' + sub] = m
    sys.modules['firebase_admin'] = fa

from daily_prices import merge_history  # noqa: E402


def main():
    days, rows = merge_history([], {}, "2026-11-10", {"Cotton": 7400, "Soyabean": 4300})
    assert days == ["2026-11-10"], days
    assert rows == [{"n": "Cotton", "p": [7400]}, {"n": "Soyabean", "p": [4300]}], rows
    table = {r["n"]: r["p"] for r in rows}
    # A new day; a crop missing that day gets 0; a new crop gets 0 before.
    days, rows = merge_history(days, table, "2026-11-11", {"Cotton": 7450, "Onion": 1800})
    assert days == ["2026-11-10", "2026-11-11"], days
    assert {r["n"]: r["p"] for r in rows} == {"Cotton": [7400, 7450], "Onion": [0, 1800], "Soyabean": [4300, 0]}, rows
    # The same day again (a later run): replaced, not added.
    table = {r["n"]: r["p"] for r in rows}
    days, rows = merge_history(days, table, "2026-11-11", {"Cotton": 7460})
    assert {r["n"]: r["p"] for r in rows} == {"Cotton": [7400, 7460], "Soyabean": [4300, 0]}, rows
    # An earlier day filed late lands in order; only the newest `keep` stay.
    table = {r["n"]: r["p"] for r in rows}
    days, rows = merge_history(days, table, "2026-11-09", {"Cotton": 7350}, keep=2)
    assert days == ["2026-11-10", "2026-11-11"], days
    print("history ok")


if __name__ == "__main__":
    main()
