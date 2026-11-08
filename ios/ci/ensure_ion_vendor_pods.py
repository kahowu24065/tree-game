#!/usr/bin/env python3
"""Keep vendored ION* path pods in ios/App/Podfile (cap sync may rewrite capacitor_pods)."""
from pathlib import Path
p = Path("ios/App/Podfile")
t = p.read_text()
block = (
    "  pod 'IONFilesystemLib', :path => '../vendor/IONFilesystemLib'\n"
    "  pod 'IONGeolocationLib', :path => '../vendor/IONGeolocationLib'\n"
)
if "IONFilesystemLib', :path" not in t:
    if "  capacitor_pods\n" not in t:
        raise SystemExit("Podfile missing capacitor_pods marker")
    p.write_text(t.replace("  capacitor_pods\n", "  capacitor_pods\n" + block, 1))
    print("re-injected ION vendor pods into Podfile")
else:
    print("ION vendor pods already in Podfile")
