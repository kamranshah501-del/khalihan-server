# Local government forms (branch `local-forms`, 19 Nov 2026)

Official blank Maharashtra forms that are still handed in on paper, with a map
of where each answer goes. The app (switch `local_forms`, OFF) fills them —
profile + AI + what only the farmer types — and makes one PDF for the print
shop. Nothing of the farmer's reaches the server.

| Form | Namuna | Pages | Fields |
| --- | --- | --- | --- |
| `ration_add_name` | 8 | 2 | name, age, address, members to add (Aadhaar / bank: farmer only), yes/no, ID proof, date, signature (optional), thumb box (ink) |
| `ration_remove_name` | 9 | 1 | the members leaving, reason date, signature |
| `ration_change` | 14 | 1 | what the card says, change wanted, reason |
| `ration_duplicate` | 15 | 1 | lost / stolen / torn / damaged, members, old card no. |
| `ration_new` | 1 | 2 | family table, income, yes/no questions, residence and ID proof, signature, thumb box |

Source of every form: the Food, Civil Supplies & Consumer Protection Dept's
Forms page (mahafood.gov.in/en/forms) — `sources.json` has each PDF link and
sha256. The same services are also online (RCMS, OTP on the Aadhaar-linked
mobile); the app shows both roads.

- `maps/make_maps.py` writes `maps/*.json` (positions in PDF points from the
  top-left, text `y` = baseline; `sample` values are made up, for checking).
- `python tools/local_forms.py --check` checks every map against its page and
  the PDFs against sources.json.
- Next: Sanjay Gandhi Niradhar (Pune district's Government Press form, 7
  pages) — map not made yet.

Going live needs the owner: merge to main (publishes config/local_forms and
deploys the pictures with the Admin site), then the app switch.
