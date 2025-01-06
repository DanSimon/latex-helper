# LaTeX Helper

An Obsidian plugin to make writing LaTeX easier.

**This plugin is in early development.  Use at your own risk**


## Features

Real-time LaTeX suggestions as you type


https://github.com/user-attachments/assets/a2858eb8-f1d3-437f-8b0b-e43c800e03a2



https://github.com/user-attachments/assets/f6e9b5c4-3332-4944-abf8-926f158d9921


- Fuzzy search support for symbol matching
- Set custom shortcuts for commonly used commands
- Easy-to-use interface, no config file editing required
- Intelligent cursor placement inside brackets and parentheses
- Built-in comprehensive LaTeX symbol reference

## Installation

This plugin is not yet a published community plugin.  You can either:

1. Manually clone this repo to `<your_vault>/.obsidian/plugins` folder
2. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)

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
Clicking the () ribbon icon will open the shortcut manager, allowing you to create new shortcuts or edit/delete existing shortcuts.

### LaTeX Reference
Clicking the () ribbon icon will open a reference view of all MathJax (and hence Obsidian) supported LaTeX commands.  

This reference is based on [this](https://onemathematicalcat.org//MathJaxDocumentation/TeXSyntax.htm), although significant modifications have been made.

## Configuration

### Plugin Settings
- `Include Fuzzy Search`: Enable/disable fuzzy matching for suggestions
- `Auto-show Suggestions`: Toggle automatic suggestion popup
- `Trigger Key`: Customize the shortcut to manually trigger suggestions

### Using with Other Plugins

* **Latex-Suite** - This plugin can work alongside Latex-Suite if you already have a bunch of shortcuts setup and don't want to migrate them, or continue using its other features.  In that case I'd recommend not defining any fast-replace shortcuts, otherwise you may get odd results if the two plugins start trying to replace text at the same time.


## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with Obsidian Plugin API
- Uses MathJax for LaTeX rendering
- Inspired by LaTeX editors and snippets managers

## Support

For bug reports and feature requests, please use the GitHub issues page.
