# LaTeX Helper

An Obsidian plugin to make writing LaTeX easier.

[![Release](https://img.shields.io/github/v/release/dansimon/latex-helper?style=flat&sort=semver)](https://github.com/dansimon/latex-helper/releases/latest)
[![Release Date](https://img.shields.io/github/release-date/dansimon/latex-helper)](https://github.com/dansimon/latex-helper/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/dansimon/latex-helper/total)](https://github.com/dansimon/latex-helper/releases)
[![License](https://img.shields.io/github/license/dansimon/latex-helper)](https://github.com/dansimon/latex-helper/blob/master/LICENSE)

[![Tests](https://github.com/dansimon/latex-helper/workflows/Code%20Quality%20%26%20Tests/badge.svg)](https://github.com/dansimon/latex-helper/actions/workflows/verify.yml)
[![Security](https://github.com/dansimon/latex-helper/workflows/Security/badge.svg)](https://github.com/dansimon/latex-helper/actions/workflows/security.yml)

### ⚠️This plugin is in early development. Use at your own risk

## Features

Real-time LaTeX suggestions as you type

![latex-quadratic](https://github.com/user-attachments/assets/6a793de4-90be-48e9-b755-38a962d2281c)

Make your own shortcuts

![latex-examples](https://github.com/user-attachments/assets/b9062771-e1be-4000-99d6-aae8f37a4081)

Easy-to-use interface for managing shortcuts, no config file editing required

![shortcut editor](https://github.com/user-attachments/assets/c07a30d7-ca0f-4efb-8491-4f4c4433aaa3)

Built-in comprehensive LaTeX symbol reference

![Reference Screenshot](https://github.com/user-attachments/assets/964d77ad-f805-4caa-aecb-5dc7dfd14c36)

Some other features:

- Fuzzy search support for symbol matching
- Intelligent cursor placement inside brackets and parentheses
- Lots of config options to control exactly when and what autocomplete suggestions appear

## Installation

This plugin is not yet a published community plugin, however there are two ways to install:

### Install with BRAT

[BRAT](https://github.com/TfTHacker/obsidian42-brat) is an Obsidian plugin for beta testing plugins.  It is available as a community plugin.

To install this plugin with BRAT:

1. Make sure you have BRAT installed and enabled.  You should see a page for BRAT in the community plugins section of your Obsidian settings.
2. Go to the BRAT settings and click "Add Beta plugin"
3. Paste this plugin's github url into the box: `https://github.com/DanSimon/latex-helper`
4. Click "Add Plugin"

The plugin should now be installed and enabled.  You should see a new settings page for Latex Helper in community plugins.

Currently I am not publishing beta releases, so this will just install the latest release.

### Manually Install

In a terminal:

1. Ensure you have `git` and `npm` installed.
2. Navigate to `<your_vault>/.obsidian/plugins` (If you have no other plugins installed this may not exist, you can create it yourself).
3. Clone the repo `git clone https://github.com/DanSimon/latex-helper`
4. Run `npm install`
5. Run `npm run build`

If successful, there should now be `main.js` and `styles.css` files in the project root directory.

The next time you load your vault, the plugin should show up under community plugins.

## Usage

### Basic Usage

1. Start typing a LaTeX command or symbol name in a math block (between `$` signs)
2. The plugin will automatically show suggestions
3. Use `Tab` and `Shift+Tab` to select a suggestion and `Enter` to apply it
4. For the first 9 suggestions you can also hit the appropriate number key to select it.

### Keyboard Commands

- `Ctrl+Space` (default): Manually trigger suggestions
- `Tab`: Navigate through autocomplete suggestions
- `1-9`: Quick select from suggestions
- `Esc`: Close suggestions

### Fast Replace Shortcuts

Shortcuts can be marked as "fast-replace" (a lightning icon will appear). When a fast-replace shortcut is the first auto-complete suggestion, typing any character will apply it (as opposed to requiring hitting `Enter`). `Tab` and `Esc` will function as usual.

### Shortcut Management

Clicking the LaTeX Helper ribbon icon (Σ) will open the shortcut manager, allowing you to create new shortcuts or edit/delete existing shortcuts.

### LaTeX Reference

The shortcut manager has a tab for LaTeX reference, which has entries for all commands supported in Obsidian.

The reference data comes from the [Better MathJax Plugin](https://github.com/greasycat/BetterMathjax) which itself is taken from Dr. Carol Burns' [MathJax Reference](https://onemathematicalcat.org//MathJaxDocumentation/TeXSyntax.htm), although significant modifications have been made.

## Configuration

### Autocomplete Hotkey

By default, LaTeX Helper will automatically show the autocomplete suggestions
when it detects a matching completion for the word or symbol you're currently
typing.  However you can instead configure autocomplete to only appear when you
hit the configured hotkey.

Obsidian discourages plugins setting default hotkeys, so you'll have to set this up manually.

1. Open Settings
2. Under "Options", click on "Hotkeys"
3. in the filter, type "latex", you should see a hotkey for "Latex Helper: Trigger LaTeX Suggestions" (if not then the plugin is not installed/enabled, do that first)
4. Click the "+" button and hit the key combination you'd like to use (`ctrl+space` for example).

### Plugin Settings

These are all available in the LaTeX Helper settings page once the plugin is installed and activated:

- **Enable Fast Replace Shortcuts**: When enabled, shortcuts marked as Fast Replace are bumped to the top of suggestions and are auto-applied when any key besides Esc is typed.

- **Instant Fast Replace**: When enabled, fast-replace shortcuts are immediately applied without showing the suggestion popup.

- **Include Fuzzy Search Results**: Include fuzzy search suggestions when no exact matches are found.

- **Auto-show Suggestions**: When enabled, suggestions appear automatically while typing. If disabled, suggestions will only appear when using the trigger key.

- **Enable Shortcuts in Normal Mode**: Allow shortcuts while typing in normal mode (outside of math blocks). Applied shortcuts will automatically be wrapped in '$' tags.

- **Enable Smart Tab**: When enabled, pressing [Tab] while in LaTeX command braces will jump to the next set of braces or the end of the command.

- **Minimum Alphanumeric Characters**: Set the minimum number of characters required before showing auto-complete suggestions for alphabetic input (1-5 characters).

- **Minimum Symbol Characters**: Set the minimum number of characters required before showing auto-complete suggestions for symbol input (default: 1).

### Using with Other Plugins

- **Latex-Suite** - This plugin can work alongside Latex-Suite if you already have a bunch of shortcuts setup and don't want to migrate them, or continue using its other features.
    - Make sure you don't have both Latex-suite's "tab out" setting and this plugin's "smart tab" setting enabled.
    - Be careful defining fast-replace shortcuts, otherwise you may get odd results if the two plugins start trying to replace text at the same time.

I have not really tested this extensively with any other plugins. If you do see an issue, just file a github issue.

## License

MIT License - see LICENSE file for details

## Support

For bug reports and feature requests, please use the GitHub issues page.
