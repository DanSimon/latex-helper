# LaTeX Shortcuts for Obsidian

A powerful Obsidian plugin that enhances your LaTeX writing experience with customizable shortcuts, auto-suggestions, and a comprehensive LaTeX symbol reference.

## Features

- Real-time LaTeX suggestions as you type
- Fuzzy search support for symbol matching
- Set custom shortcuts for commonly used commands
- Easy-to-use interface, no config file editing required
- Intelligent cursor placement inside brackets and parentheses
- Built-in comprehensive LaTeX symbol reference

## Installation

1. Open Obsidian Settings
2. Navigate to Community Plugins
3. Search for "LaTeX Shortcuts"
4. Click Install
5. Enable the plugin

## Usage

### Basic Usage
1. Start typing a LaTeX command or symbol name in a math block (between `$` signs)
2. The plugin will automatically show suggestions
3. Use `Tab` and `Shift+Tab` to select a suggestion and `Enter` to apply it
4. For the first 9 suggestions you can also hit the appropriate number key to select it.

### Keyboard Shortcuts
- `Ctrl+Space` (default): Manually trigger suggestions
- `Tab`: Navigate through command arguments
- `1-9`: Quick select from suggestions
- `Esc`: Close suggestions

### Fast Replace Mode
Quickly replace patterns with a single non-alphanumeric character when only one replacement is available. For example:
- Type `alpha` and press `,` to instantly replace with `\alpha`
- Type `beta` and press `.` to instantly replace with `\beta`

### Custom Patterns
1. Click the LaTeX icon in the ribbon
2. Click "New Pattern"
3. Enter your pattern and replacement(s)
4. Optionally enable fast replace or regex mode
5. Add to a category for organization

## Configuration

### Plugin Settings
- `Include Fuzzy Search`: Enable/disable fuzzy matching for suggestions
- `Auto-show Suggestions`: Toggle automatic suggestion popup
- `Trigger Key`: Customize the shortcut to manually trigger suggestions

## Using with Other Plugins

* **Latex-Suite** - This plugin can work alongside Latex-Suite if you already have a bunch of shortcuts setup and don't want to migrate them.  In that case I'd recommend disabling auto-suggestions and fast-replace shortcuts, otherwise you may get odd results.

## Examples


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
