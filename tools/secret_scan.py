"""Warns when a key, a token or a farmer's phone number lands in this repo.

The repository is public: anything committed here can be read by anyone,
forever (owner, 27 Nov 2026, from the "pre-launch security" videos: "scan my
Git history for leaked secrets"). This only warns — it never fails a push —
and it never prints a found value: only the file, the line and the kind.

    python tools/secret_scan.py            # the files as they are now
    python tools/secret_scan.py --history  # every line ever added (slow-ish)
    python tools/secret_scan.py --selftest

A found key must be revoked at its maker and replaced (deleting the line is
not enough: the old commit keeps it).
"""

import re
import subprocess
import sys

KINDS = [
    ('Google API key', re.compile(r'AIza[0-9A-Za-z_\-]{35}')),
    ('Anthropic key', re.compile(r'sk-ant-[A-Za-z0-9_\-]{20,}')),
    ('OpenAI-style key', re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9]{32,}')),
    ('GitHub token', re.compile(r'\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}')),
    ('Slack token', re.compile(r'\bxox[abprs]-[A-Za-z0-9\-]{10,}')),
    ('Meta / Instagram token', re.compile(r'\bEAA[A-Za-z0-9]{60,}')),
    ('AWS key', re.compile(r'\bAKIA[0-9A-Z]{16}\b')),
    ('Private key', re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----')),
    ('Service account JSON', re.compile(r'"private_key"\s*:\s*"-----BEGIN')),
    ('Payment key', re.compile(r'\b(?:sk|rk)_live_[A-Za-z0-9]{16,}|\brzp_live_[A-Za-z0-9]{10,}')),
]
PHONE = re.compile(r'(?<![0-9A-Za-z])(?:\+91[ \-]?)?[6-9][0-9]{9}(?![0-9])')
# Made-up numbers of the Admin's demo; the owner's own contact on the privacy page has no phone.
PHONE_OK_FILES = ('admin/public/demo-db.js',)
SKIP = re.compile(r'\.(png|jpe?g|gif|webp|ico|mp4|mp3|wav|pdf|zip|gz|ttf|woff2?)$|package-lock\.json$')


def findings(path, lines):
    out = []
    for n, line in lines:
        for kind, rx in KINDS:
            if rx.search(line):
                out.append((path, n, kind))
        if path not in PHONE_OK_FILES and PHONE.search(line):
            out.append((path, n, "Phone number (a farmer's? never in this public repo)"))
    return out


def scan_tree():
    files = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, check=True).stdout.split('\n')
    out = []
    for f in files:
        if not f or SKIP.search(f) or f == 'tools/secret_scan.py':
            continue
        try:
            with open(f, encoding='utf-8', errors='ignore') as fh:
                out += findings(f, enumerate(fh, 1))
        except (IsADirectoryError, FileNotFoundError):
            pass
    return out


def scan_history():
    log = subprocess.run(['git', 'log', '--all', '-p', '--no-color', '--format=@@commit %h'],
                         capture_output=True, text=True, errors='ignore', check=True).stdout
    out, path, commit = [], None, ''
    for line in log.split('\n'):
        if line.startswith('@@commit '):
            commit = line[9:]
        elif line.startswith('+++ b/'):
            path = line[6:]
        elif line.startswith('+') and not line.startswith('+++') and path and not SKIP.search(path) and path != 'tools/secret_scan.py':
            out += [(f'{p} (commit {commit})', n, k) for p, n, k in findings(path, [('?', line)])]
    return sorted(set(out))


def selftest():
    fake_key = 'AIza' + 'B' * 35
    assert findings('x.js', [(1, f'const k = "{fake_key}";')]) == [('x.js', 1, 'Google API key')]
    assert findings('x.js', [(2, 'call 9876543210 now')])[0][2].startswith('Phone number')
    assert findings('admin/public/demo-db.js', [(3, 'phone: "+919876543210"')]) == []
    assert findings('x.py', [(4, 'price = 2300, arrival 1234567890')]) == []  # starts with 1: not a mobile
    assert findings('x.py', [(5, 'id: 98765432101234')]) == []  # longer than a phone
    print('secret_scan selftest: ok')


def main():
    if '--selftest' in sys.argv:
        return selftest()
    found = scan_history() if '--history' in sys.argv else scan_tree()
    for path, n, kind in found:
        # GitHub shows ::warning lines on the run's page; the value itself is never printed.
        print(f'::warning file={path.split(" ")[0]},line={n if n != "?" else 1}::{kind} in {path} line {n}')
    print(f'secret_scan: {len(found)} warning(s)' if found else 'secret_scan: nothing found')


if __name__ == '__main__':
    main()
