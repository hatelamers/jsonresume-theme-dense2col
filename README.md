# jsonresume-theme-dense2col
A 2 column dense theme for json-resume (http://jsonresume.org/) optimized for printing. Based on https://tildegit.org/kindrobot/jsonresume-theme-kindrobot, s. [example](examples/sample.resume.html) or screenshot below.
![screenshot](examples/sample.resume-ff.png?raw=true)
Apart from printout optimizations, this theme's HTML is designed to be responsive, accessible and localizable.

## Usage
Render your JSON resume with your favorite renderer specifying `jsonresume-theme-dense2col` as theme parameter. You can define your own CSS, which would be applied after the built-in one, so you can override appearnce to your liking, this is done by storing the path to your CSS file in the environment variable `JRS_DENSE2COL_CSS`

**on Windows**
```sh
SET JRS_DENSE2COL_CSS=<path_to_css>
```
**on Unix**
```sh
EXPORT JRS_DENSE2COL_CSS=<path_to_css>
```

## JSON Extensions
For localization the theme utilizes extension `$dense2col` of `meta` elelment of json-resume.
```json
"$dense2col": {
	"locale": "en",
	"languages": {
		"English": "en",
		"German": "de"
	},
	"labels": {
		"Summary": "Who I Am",
		"Skills": "What I Can"
	}
}
```

* `locale` - localizable values (like calendar dates) will be rendered in this locale
* `languages` - used to specify flag emojis in the language list of the resume
* `labels` - can be used for translation (or simple substitution if you like) of built-in section labels of the resume

All elements under `$dense2col` are optional, if missing - built-in defaults are used.