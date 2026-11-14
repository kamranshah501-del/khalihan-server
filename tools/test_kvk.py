"""publish_kvk.py: what it lets through and what it refuses."""
import copy
import datetime
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from publish_kvk import load, numbers  # noqa: E402

BULLETIN = (
    "AGROMET ADVISORY BULLETIN — Jalgaon. Issued 13.11.2026. Light rain likely on 17 November.\n"
    + "Cotton (boll bursting): pick the burst bolls in dry weather. For sap sucking pests spray "
    + "flonicamid 50 WG 3 g per 10 liter of water when there are no rains.\n"
    + "Gram (sowing): treat seed with Trichoderma 5 g per kg seed before sowing.\n"
    + "x" * 500
)
GOOD = {
    "version": 2026111301,
    "areas": {
        "jalgaon": {
            "issued": "2026-11-13",
            "source": "kvk_source/jalgaon_2026-11-13_en.txt",
            "from": {"en": "Gramin Krishi Mausam Sewa, Pune", "hi": "ग्रामीण कृषि मौसम सेवा, पुणे", "mr": "ग्रामीण कृषी मौसम सेवा, पुणे"},
            "cards": [
                {
                    "k": "weather",
                    "name": {"en": "Weather", "hi": "मौसम", "mr": "हवामान"},
                    "t": {
                        "en": "Light rain is likely on 17 November.",
                        "hi": "17 नवंबर को हल्की बारिश हो सकती है।",
                        "mr": "१७ नोव्हेंबरला हलका पाऊस होऊ शकतो.",
                    },
                },
                {
                    "k": "cotton",
                    "name": {"en": "Cotton", "hi": "कपास", "mr": "कापूस"},
                    "names": ["flonicamid 50 WG"],
                    "t": {
                        "en": "Pick burst bolls in dry weather. For sap sucking pests, flonicamid 50 WG 3 g per 10 litres of water, when there is no rain.",
                        "hi": "फूटे बोंड सूखे मौसम में चुनें। रस चूसने वाले कीट के लिए फ्लोनिकामिड (flonicamid 50 WG) 3 ग्राम प्रति 10 लीटर पानी, बारिश न हो तब।",
                        "mr": "फुटलेली बोंडे कोरड्या हवेत वेचा. रस शोषणाऱ्या किडींसाठी फ्लोनिकॅमिड (flonicamid 50 WG) 3 ग्रॅम प्रति 10 लिटर पाणी, पाऊस नसताना.",
                    },
                },
            ],
        }
    },
}


def refused(data, today, folder):
    path = os.path.join(folder, "kvk.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    try:
        load(path, today)
    except ValueError as e:
        return str(e)
    return None


def main():
    assert numbers("3 g per 10 liter, 0.5 % — ५० WG, 1,200") == ["0.5", "10", "1200", "3", "50"], numbers("3 g per 10 liter, 0.5 % — ५० WG, 1,200")
    today = datetime.date(2026, 11, 14)
    with tempfile.TemporaryDirectory() as folder:
        os.makedirs(os.path.join(folder, "kvk_source"))
        with open(os.path.join(folder, "kvk_source", "jalgaon_2026-11-13_en.txt"), "w", encoding="utf-8") as f:
            f.write(BULLETIN)
        assert refused(GOOD, today, folder) is None, refused(GOOD, today, folder)
        path = os.path.join(folder, "kvk.json")
        version, doc = load(path, today)
        assert version == 2026111301
        area = doc["areas"]["jalgaon"]
        assert area["issued"] == "2026-11-13" and len(area["cards"]) == 2
        assert "names" not in area["cards"][1] and "source" not in area  # only what the app reads

        def changed(fn):
            data = copy.deepcopy(GOOD)
            fn(data["areas"]["jalgaon"])
            return refused(data, today, folder)

        # A dose that is not the bulletin's.
        def wrong_dose(a):
            for lang in ("en", "hi", "mr"):
                a["cards"][1]["t"][lang] = a["cards"][1]["t"][lang].replace("3 g", "4 g").replace("3 ग्राम", "4 ग्राम").replace("3 ग्रॅम", "4 ग्रॅम")
        assert "number 4 is not in the bulletin" in changed(wrong_dose), changed(wrong_dose)

        # One language says another amount.
        def hindi_differs(a):
            a["cards"][1]["t"]["hi"] = a["cards"][1]["t"]["hi"].replace("10 लीटर", "15 लीटर")
        assert "numbers differ between languages" in changed(hindi_differs), changed(hindi_differs)

        # A medicine the bulletin does not name.
        def other_name(a):
            a["cards"][1]["names"] = ["imidacloprid"]
        assert "'imidacloprid' is not in the bulletin" in changed(other_name), changed(other_name)

        # The name as printed is missing from the Marathi.
        def no_latin(a):
            a["cards"][1]["t"]["mr"] = a["cards"][1]["t"]["mr"].replace(" (flonicamid 50 WG)", " 50 WG")
        assert "must stand in the text as the bulletin prints it" in changed(no_latin), changed(no_latin)

        def no_marathi(a):
            del a["cards"][0]["t"]["mr"]
        assert "needs words in en, hi, mr" in changed(no_marathi), changed(no_marathi)

        def no_source(a):
            a["source"] = "kvk_source/none.txt"
        assert "is not there" in changed(no_source), changed(no_source)

        def outside(a):
            a["source"] = "../../etc/passwd"
        assert "is not there" in changed(outside), changed(outside)

        def too_long(a):
            a["cards"][0]["t"]["en"] = "Rain. " * 80
        assert "characters — at most" in changed(too_long), changed(too_long)

        # Too old to be this week's, or dated ahead.
        assert "days old" in refused(GOOD, datetime.date(2026, 11, 25), folder)
        assert "in the future" in refused(GOOD, datetime.date(2026, 11, 10), folder)

        bad = copy.deepcopy(GOOD)
        bad["areas"]["Jalgaon District"] = bad["areas"].pop("jalgaon")
        assert "small English letters" in refused(bad, today, folder)
        bad = copy.deepcopy(GOOD)
        bad["version"] = 0
        assert "version" in refused(bad, today, folder)
    print("kvk ok")


if __name__ == "__main__":
    main()
