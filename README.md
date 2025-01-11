# LaTeX Helper

An Obsidian plugin to make writing LaTeX easier.

### ⚠️This plugin is in early development.  Use at your own risk


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

This plugin is not yet a published community plugin, nor are there any releases or compiled artifacts.  To install you must:

1. Manually clone this repo to `<your_vault>/.obsidian/plugins` folder
2. Have `npm` installed
3. Run `npm build`

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
Shortcuts can be marked as "fast-replace" (a lightning icon will appear).  When a fast-replace shortcut is the first auto-complete suggestion, typing any character will apply it (as opposed to requiring hitting `Enter`).  `Tab` and `Esc` will function as usual.

### Shortcut Management
Clicking the LaTeX Helper ribbon icon (Σ) will open the shortcut manager, allowing you to create new shortcuts or edit/delete existing shortcuts.

### LaTeX Reference
The shortcut manager has a tab for LaTeX reference, which has entries for all commands supported in Obsidian.

The reference data comes from the [Better MathJax Plugin](https://github.com/greasycat/BetterMathjax) which itself is taken from Dr. Carol Burns' [MathJax Reference](https://onemathematicalcat.org//MathJaxDocumentation/TeXSyntax.htm), although significant modifications have been made.

## Configuration

### Plugin Settings

These are all available in the LaTeX Helper settings page once the plugin is installed and activated:

- **Enable Fast Replace Shortcuts**: When enabled, shortcuts marked as Fast Replace are bumped to the top of suggestions and are auto-applied when any key besides Esc is typed.

- **Instant Fast Replace**: When enabled, fast-replace shortcuts are immediately applied without showing the suggestion popup.

- **Include Fuzzy Search Results**: Include fuzzy search suggestions when no exact matches are found.

- **Auto-show Suggestions**: When enabled, suggestions appear automatically while typing. If disabled, suggestions will only appear when using the trigger key.

- **Trigger Key**: Customize the keyboard shortcut to manually trigger suggestions (e.g., "Ctrl+Space", "Cmd+E").

- **Enable Shortcuts in Normal Mode**: Allow shortcuts while typing in normal mode (outside of math blocks). Applied shortcuts will automatically be wrapped in '$' tags.

- **Enable Smart Tab**: When enabled, pressing [Tab] while in LaTeX command braces will jump to the next set of braces or the end of the command.

- **Minimum Alphanumeric Characters**: Set the minimum number of characters required before showing auto-complete suggestions for alphabetic input (1-5 characters).

- **Minimum Symbol Characters**: Set the minimum number of characters required before showing auto-complete suggestions for symbol input (default: 1).

### Using with Other Plugins

* **Latex-Suite** - This plugin can work alongside Latex-Suite if you already have a bunch of shortcuts setup and don't want to migrate them, or continue using its other features.
  - Make sure you don't have both Latex-suite's "tab out" setting and this plugin's "smart tab" setting enabled.
  - Be careful defining fast-replace shortcuts, otherwise you may get odd results if the two plugins start trying to replace text at the same time.

I have not really tested this extensively with any other plugins.  If you do see an issue, just file a github issue.


## License

MIT License - see LICENSE file for details

## Support

For bug reports and feature requests, please use the GitHub issues page.
