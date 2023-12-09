const fs = require("fs");
const path = require('path');
const Handlebars = require("handlebars");
const moment = require('moment');
const twemoji = require('twemoji');

const langMap = require(path.join(__dirname, "lang-map.json"));
const addrFormats = require(path.join(__dirname, "addr-format.json"));

var hmrUnharden = function(val) { return val; };

function render(resume) {
	if ('function' == typeof resume.harden) {
		hmrUnharden = function(val) {
			return 'string' == typeof(val) && val ? val.replace(/^@@@@~/, '').replace(/~@@@@$/, '') : val;
		};
	}
	let lang = 'en';
	if (resume.meta && resume.meta.$dense2col && resume.meta.$dense2col.locale) {
		const locale = hmrUnharden(resume.meta.$dense2col.locale);
		if (locale) {
			moment.locale(locale);
			lang = locale;
		}
	}
	let userCss = "";
	if (process.env.JRS_DENSE2COL_CSS) {
		try {
			userCss = fs.readFileSync(process.env.JRS_DENSE2COL_CSS, "utf-8");
		} catch (e) {
			console.warn(e);
		}
	}
	const css = fs.readFileSync(path.join(__dirname, "style.css"), "utf-8");
	const tpl = fs.readFileSync(path.join(__dirname, "resume.hbs"), "utf-8");

	const partialsDir = path.join(__dirname, 'partials');
	const filenames = fs.readdirSync(partialsDir);
	filenames.forEach(function (filename) {
	  const matches = /^([^.]+).hbs$/.exec(filename);
	  if (!matches) {
	    return;
	  }
	  const name = matches[1];
	  const filepath = path.join(partialsDir, filename);
	  const template = fs.readFileSync(filepath, 'utf8');
	  Handlebars.registerPartial(name, template);
	});

	Handlebars.registerHelper('icon-network', iconNetwork);
	Handlebars.registerHelper('icon-reg', iconDirectRegular);
	Handlebars.registerHelper('icon-solid', iconDirectSolid);
	Handlebars.registerHelper('flag', langFlag);
	Handlebars.registerHelper('year-month', dateMonthFormat);
	Handlebars.registerHelper('year-month-day', dateDayFormat);
	Handlebars.registerHelper('label-lookup', labelHtml);
	Handlebars.registerHelper('address-intl', addressFormat);
	Handlebars.registerHelper('email-link', emailLink);
	Handlebars.registerHelper('tel-link', telLink);

	return Handlebars.compile(tpl)({
		css: css,
		user_css: new Handlebars.SafeString(userCss),
		lang: lang,
		resume: resume
	});
}

function langFlag(lang, options) {
	const resume = options.data.root.resume;
	if (lang && resume.meta && resume.meta.$dense2col && resume.meta && resume.meta.$dense2col.languages) {
		const country = langMap[hmrUnharden(resume.meta.$dense2col.languages[hmrUnharden(lang)])];
		if (country)
		{
			const codePoints = country
				.toUpperCase()
				.split('')
				.map(char =>  127397 + char.charCodeAt());
				try {
					return new Handlebars.SafeString(twemoji.parse(String.fromCodePoint(...codePoints), {ext: ".svg", folder: 'svg'}));
				} catch (e) {
					console.warn(e);
				}
 		}
	}
	return "";
}

function iconNetwork(iconName) {
  iconName = hmrUnharden(iconName);
  switch (iconName) {
      case 'Twitter':
          return fontAwesomeHtml("fa-brands fa-twitter");
    case 'SoundCloud':
        return fontAwesomeHtml("fa-brands fa-soundcloud");
    case 'GitHub':
      return fontAwesomeHtml("fa-brands fa-github");
    case 'Mastodon':
      return fontAwesomeHtml("fa-brands fa-mastodon");
    case 'Stack Overflow':
        return fontAwesomeHtml("fa-brands fa-stack-overflow");
    case 'Wikipedia':
        return fontAwesomeHtml("fa-brands fa-wikipedia-w");
    case 'LinkedIn':
        return fontAwesomeHtml("fa-brands fa-linkedin");
    default:
      console.warn("Could not find icon: ", iconName);
      return fontAwesomeHtml('fa-regular fa-circle');
  }
}

function addressFormat(location, options) {
	if (!location) return '';

	try {
		const format = addrFormats[options.data.root.lang || 'en'] || addrFormats.en;
		const result = format.reduce((accumulator, group) => {
			let val = '';
			group.forEach((key) => {
				if (location[key]) {
					if (val.length) val += ' ';
					val += `<span class="${key}">${Handlebars.escapeExpression(hmrUnharden(location[key]))}</span>`;
				}	
			});
			if (accumulator.length && val.length) val = '<span class="sep"></span>' + val;
			return accumulator + val;	
		}, '');
		return new Handlebars.SafeString(result);	
	} catch (e) {
		console.warn(e);
		return `----${e}----`;
	}
}

function iconDirectRegular(key) {
	return fontAwesomeHtml(`fa-regular fa-${key}`);
}

function iconDirectSolid(key) {
	return fontAwesomeHtml(`fa-solid fa-${key}`);
}

function fontAwesomeHtml(classes) {
    return new Handlebars.SafeString(`<i class="${classes}"></i>`);
}


function dateMonthFormat(date, options) {
	return moment(date).format('MMM YYYY');
}

function dateDayFormat(date) {
	return moment(date).format('ll');
}

function labelHtml(label, options) {
	try {
		const resume = options.data.root.resume;
		if (resume.meta && resume.meta.$dense2col && resume.meta && resume.meta.$dense2col.labels && resume.meta && resume.meta.$dense2col.labels[label]) {
			return resume.meta.$dense2col.labels[label];
		}
	} catch (e) {
		console.error(e);
	}
	return label;
}

function emailLink(addr) {
	addr = hmrUnharden(addr);
	let result = `<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;${obfuscateURI(addr)}">${Handlebars.escapeExpression(addr).split('@').join(`<em class="junk">${Handlebars.escapeExpression((Math.random() + 1).toString(36).substring(2))}</em>@<em class="junk">${Handlebars.escapeExpression((Math.random() + 1).toString(36).substring(2))}</em>`)}</a>`;
	return new Handlebars.SafeString(result);
}

function telLink(num) {
	num = hmrUnharden(num);
	let result = `<a href="&#116;&#101;&#108;&#58;${obfuscateURI(num)}">${Handlebars.escapeExpression(num).split('').reduce((acc, val) => `${acc}<em class="junk">${Handlebars.escapeExpression((Math.random() + 1).toString(36).substring(8))}</em>${val}`)}</a>`;
	return new Handlebars.SafeString(result);
}

function obfuscateURI(str) {
	let result = "";
	for (let i = 0; i < str.length; i++) {
		result += "%" + str.codePointAt(i).toString(16).toUpperCase();
	}
	return result;  
}

module.exports = {
	render: render
};
