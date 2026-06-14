# EEG Commander Tutorial
This tutorial will help you get started.
- Introduction
- Create pattern.
- Select EEG trigger signal.
- Select action type.
- Test pattern.

## Introduction
The purpose of this tutorial is to help you make your first new pattern. Start by checking out this about [EEG Patterns](/docs/PATTERNS.md).

## Create a new pattern
The quickest way to make a new pattern is to clone an existing one of the same action type.

- Click the "clone" icon on an existing JavaScript pattern (JS).
- Add a new pattern name (title) and alias (used as a persistant reference id).
- Change the .js file to one you've made and placed in the <code>/commander/data/js</code> folder or an external .js file available on the web.
- Change the pattern condition to match your needs.
- Enable the pattern.
- Activate the EEG device or simulation.

**Please Note**: Your new pattern currently only exists in the local storage of the browser. To persist it on disk use the export feature on the Patterns Tab.