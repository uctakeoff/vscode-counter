# Change Log
All notable changes to the "vscode-counter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

* workspace counter in status bar.

## [3.5.0]
### Changed
- Support: Configure "outputDirectory" to outside of workspace [#101](https://github.com/uctakeoff/vscode-counter/issues/101)

## [3.4.0]
### Fixed
- Defects caused by comment keywords present in the string. [#88](https://github.com/uctakeoff/vscode-counter/issues/88)
  - Not a complete fix, but should be better than before.

## [3.3.0]
### Changed
- Change the line counting method [#96](https://github.com/uctakeoff/vscode-counter/issues/96).
  - In line with the POSIX definition of lines in text files, lines that do not end with a newline (i.e., the last line) are not included in the count.
- Enable the real-time counter at start-up.
  - However, it should not be resident.

## [3.2.2]
### Fixed
- Fixed Issue [#93](https://github.com/uctakeoff/vscode-counter/issues/93).

## [3.2.1]
### Fixed
- Added spaces in statusbar

## [3.2.0]
### Changed
- Count the files in the top-level as a separate item #81

## [3.1.0]
### Changed
- Support storing collected language elsewhere #78

## [3.0.0]
### Changed
- Reviewed file detection rules

## [2.4.0]
### Added
- Counter diff output function
### Changed
- Moved the status bar to the right
### Removed
- Disuse Configuration : `VSCodeCounter.outputMarkdownSeparately`.

## [2.3.0]
### Fixed
- Error on large code bases

## [2.2.2]
### Fixed
- Fixed Issue [#48](https://github.com/uctakeoff/vscode-counter/issues/48).

## [2.2.1]
### Fixed
- Misconceptions about FileStat.

## [2.2.0]
### Added
- New Configuration : `VSCodeCounter.history`.

## [2.1.0]
### Added
- New Function : Count the range of the selected text.

## [2.0.0]
### Added
- New Command : `Save the collected language configurations`.
### Update
- This extension is no longer resident.
  - Don't save whether or not the program is shown in the status bar in the settings.

## [1.3.5]
### Fixed
- Issue : `CSV could be more strictly formed`.

## [1.3.4]
### Fixed
- Issue : `Handling symlinks`.

## [1.3.3]
### Added
- New Command : `Check available languages`.

## [1.3.2]
### Fixed
- Replaced the file API used with one provided by vscode.

## [1.3.1]
### Fixed
- Problems that occur when `files.encoding` is set to a value other than utf8

## [1.3.0]
### Added
- Support Multi-root Workspaces. (Selection type)

## [1.2.1]
### Fixed
- Update some modules.

## [1.2.0]
### Changed
- Output Markdown summary and details separately. (selectable by settings.json)

## [1.1.1]
### Added
- resolve file types using ["files.associations"](https://code.visualstudio.com/docs/languages/overview#_adding-a-file-extension-to-a-language) setting.

## [1.0.1]
### Fixed
- Error on large code bases

## [1.0.0]
### Fixed
- Auto ignore the .VSCodeCounter directory.

## [0.1.0]
- Initial release

