# Start here

This folder is the full agent context for **Pakka Sauda**, the hackathon build.

1. **Before build day:** everyone reads `AGENTS.md` and `context/README.md`, then follows `context/setup/01-before-build-day.md`.
2. **At 0:00:** Workstream A follows `context/setup/02-hour-zero-setup.md`. Step 4 of that guide copies the *contents* of this folder into the new repo root:

    ```bash
    cp -r /path/to/pakka-sauda-context/. /path/to/pakka-sauda/
    ```

    The repo then holds `AGENTS.md`, `CLAUDE.md`, `.kiro/` and `context/`. You can delete this `START-HERE.md` from the repo afterwards.
3. **From 0:20:** each person works on their own branch through `context/phases/phase-*.md`, one step at a time, using the prompt in `context/README.md`.

Hidden folder: `.kiro/` starts with a dot. Copy it with `cp -r folder/. dest/` as shown, or turn on hidden files in your file manager.
