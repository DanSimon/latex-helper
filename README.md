# LaTeX Helper

An Obsidian plugin to make writing LaTeX easier.

### ⚠️This plugin is in early development.  Use at your own risk


## Features

Real-time LaTeX suggestions as you type

![latex-quadratic](https://github.com/user-attachments/assets/6a793de4-90be-48e9-b755-38a962d2281c)

Make your own shortcuts


![latex-examples](https://github.com/user-attachments/assets/b9062771-e1be-4000-99d6-aae8f37a4081)


Easy-to-use interface for managing shortcuts, no config file editing required

![Shortcut Screenshot](https://github.com/user-attachments/assets/ec06d8b8-b7a8-4389-9265-6c4b814ab09e)

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

This reference is based on Dr. Carol Burns [MathJax Reference](https://onemathematicalcat.org//MathJaxDocumentation/TeXSyntax.htm), although significant modifications have been made.

## Configuration

### Plugin Settings
- `Include Fuzzy Search`: Enable/disable fuzzy matching for suggestions
- `Auto-show Suggestions`: Toggle automatic suggestion popup
- `Trigger Key`: Customize the shortcut to manually trigger suggestions

### Using with Other Plugins

* **Latex-Suite** - This plugin can work alongside Latex-Suite if you already have a bunch of shortcuts setup and don't want to migrate them, or continue using its other features.  In that case I'd recommend not defining any fast-replace shortcuts, otherwise you may get odd results if the two plugins start trying to replace text at the same time.

I have not really tested this extensively with any other plugins.  If you do see an issue, just file a github issue.


## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details

## Support

For bug reports and feature requests, please use the GitHub issues page.
