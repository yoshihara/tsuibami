# NEWS

## 0.3.0

### Implement

- Focus body textarea by input Enter in title input area (followed esa.io' editor)
- (options page) Submit by enter
- Focus title input area after saving with clear title/body

### Fix

- Fix the bug that focus title input at first doesn't work correctly
- Fix the bug that a post as same title as one in your team isn't updated correctly
- Fix the bug that cursor position in body textarea isn't restored correctly
- Update title when it is changed by esa.io's server after uploading
    - e.g.) a same title as existing one in your team
    - e.g.) blank title (seems to be updated to `Users/{your screen_name}/Untitled-{n}` )

### Changes

- Store href of 'open previous saved post' directly in storage
    - Before post's id only is stored, but this version only supported both.

### (for development)

- Use webpack for build js & css
- Use npm package for import library instead of downloaded
- Use yarn
- Use prettier & eslint
- Use ES2015 & later syntax
    - async/await
    - interpolation
    - class
- Re-construct JS codes using class
- Use strict mode (I forgotted...)
- Use pug instead of haml (avoid to install gem)
- Add specs with jest [WIP] [See [#18](https://github.com/yoshihara/tsuibami/pull/18)]
- Use [CircleCI](https://circleci.com/gh/yoshihara/tsuibami)


## 0.2.1

### Fix

- Fix the packaging bug

## 0.2.0

### Implement

- Focus body textarea when title input box isn't empty
- Move cursor at previous position in body textarea when open
- Make disable "Save as WIP" button when title/body contents are saved
- Support Ctrl+s / Cmd+s as save shoutcut

## 0.1.1

- Fix icon file is broken

## 0.1.0

The first release
