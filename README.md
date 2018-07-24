# tsuibami

`tsuibami` is the mini editor for [esa.io](https://esa.io/).
With this extension, you can create posts as WIP to your team's esa.io and update it.

## Configuration

1. Go https://your-team.esa.io/user/tokens and create token to write and read.
1. Open option page, input your team name and token, and click "Save Options" button.

## How to use

1. Click this extention's icon (If the popup shows your team's icon and name, configureation is succeeded.)
The input box is a title of post, the textarea is a body of one.

![screenshot](https://github.com/yoshihara/tsuibami/blob/master/misc/screenshot.png)

When you want to save your post, click "Save as WIP" button. If "Clear title/body after saving" checkbox is checked, title and body are cleared.

For Japanese, you can also use https://esa-pages.io/p/sharing/1303/posts/251/eca7d0957129c38ab04b.html （日本語での説明）.

## develop

```sh
$ git clone https://github.com/yoshihara/tsuibami.git
$ yarn install
$ yarn run build
$ yarn run watch
```

Then, the build/ directory has extension files to read by Chrome.
