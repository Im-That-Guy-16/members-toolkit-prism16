// ==UserScript==
// @name         Members Toolkit - Prism 16 Fork
// @namespace    http://tampermonkey.net/
// @version      0.5.16-prism16
// @description  A members toolkit fork patched to keep local features working while the legacy API is unavailable.
// @author       HJ-OTMOP; Prism 16 fork
// @license MIT
// @downloadURL  https://gitlab.com/Prism_16/members-toolkit-prism16/-/raw/main/Members_Toolkit.user.js
// @updateURL    https://gitlab.com/Prism_16/members-toolkit-prism16/-/raw/main/Members_Toolkit.user.js
// @homepageURL  https://gitlab.com/Prism_16/members-toolkit-prism16
// @supportURL   https://gitlab.com/Prism_16/members-toolkit-prism16/-/issues
// @copyright 	 2018-2022, HJ-OTMOP (https://openuserjs.org/users/HJ-OTMOP)
// @icon         https://ptpimg.me/6uob9q.png
// @match        https://passthepopcorn.me/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://passthepopcorn.me/static/functions/bbcode.js?v=1514440441
// @require      https://passthepopcorn.me/static/functions/mousetrap.min.js?v=1514440441
// @connect 	 handjob-ptp.xyz
// @connect		 localhost
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

/*
Prism 16 fork notes:
	- Original script by HJ-OTMOP.
	- Keeps local features available when the legacy API is unavailable.
	- API-backed member ranks and API messages are skipped unless a saved API token exists and the API responds.
*/

(function () {
	"use strict";
	let previousFunctions = [],
		_hjm_access_token,
		_logged_in = false;
	const user = {};

		const PROD_ROOT = "https://api.handjob-ptp.xyz";
		const DEV_ROOT = "http://localhost:7776";
		const ROOT = PROD_ROOT;
		const API_LOGIN_REQUIRED = false;
		if (ROOT === DEV_ROOT) console.log("In development mode");
		const PTP = "https://passthepopcorn.me";

	const AntiCsrfToken = document.body.dataset.anticsrftoken;

	const RANKS = {
		0: { short: "upstate", full: "Upstate" },
		1: { short: "associates", full: "Associate" },
		2: { short: "madeguys", full: "Made Guy" },
		3: { short: "soldatos", full: "Soldato" },
		4: { short: "caporegimes", full: "Caporegime" },
		5: { short: "capobastones", full: "Capo Bastones" },
		6: { short: "consiglieres", full: "Consigliere" },
		7: { short: "godfather", full: "The Godfather" },
	};

	_hjm_access_token = GM_getValue("HJMaccessToken");
	if (_hjm_access_token) {
		_logged_in = true;
	}
	setUserData();

	function setUserData() {
		const userinfoNode = document.querySelector("#nav_userinfo .user-info-bar__link");

		user.userid = parseInt(userinfoNode.href.split("id=").pop(), 10);
		user.username = userinfoNode.textContent;

		if (_logged_in === true) {
			try {
				const decoded = decodeDataFromJWT(_hjm_access_token);
				user.rank = decoded.rank;
				user.rankShort = RANKS[decoded.rank] ? RANKS[decoded.rank].short : "nonmember";
				user.rankFull = RANKS[decoded.rank] ? RANKS[decoded.rank].full : "Non-Member";
			} catch (e) {
				_logged_in = false;
				_hjm_access_token = null;
				GM_deleteValue("HJMaccessToken");
			}
		}
		if (!user.rankShort) {
			user.rank = null;
			user.rankShort = "nonmember";
			user.rankFull = "Non-Member";
		}
	}

	const icons = {
		approval: "https://ptpimg.me/o40o56.png",
		complete: "https://ptpimg.me/507u0x.png",
		disc: "https://ptpimg.me/91mfxe.png",
		delete: "https://ptpimg.me/4ish61.png",
		edit: "https://ptpimg.me/6xhb4u.png",
		encodeHistory: "https://ptpimg.me/272qze.png",
		encodingCentre: "https://ptpimg.me/0ft58w.png",
		finish: "https://ptpimg.me/0803rj.png",
		guide: "https://ptpimg.me/166r72.png",
		horizontalRule: "https://ptpimg.me/y5htyr.png",
		imdb: "https://ptpimg.me/g25373.png",
		mail: "https://ptpimg.me/d1z970.png",
		mediainfo: "https://ptpimg.me/bw61y4.png",
		memberProfile: "https://ptpimg.me/288895.png",
		miScanner: "https://ptpimg.me/044301.png",
		padlock: "https://ptpimg.me/sgo883.png",
		refresh: "https://ptpimg.me/6i71f1.png",
		refresh2: "https://ptpimg.me/8223w1.png",
		saveTemplate: "https://ptpimg.me/ofi36m.png",
		settings: "https://ptpimg.me/h0d928.png",
		upload: "https://ptpimg.me/ypm7wr.png",
	};

	const logos = {
		handjob: "https://ptpimg.me/s91993.png",
		badge: "https://ptpimg.me/6uob9q.png",
		scholarshipFund: "https://ptpimg.me/hy8k3u.png",
	};

	const collection = {
		id: 9146,
		year: 2022,
		title: "Spit Shine Your Black Clouds",
	};

	let HJMModal;
	const css = {};

	let toolbarClasses = [];
	const barWidth = 880;
	const barHeight = 320;
	const windowID = generateID();
	const permData = {
		encodeHistory:
			"https://passthepopcorn.me/encodeoffers.php?search=&format%5B%5D=SdX264&format%5B%5D=Sd576p&format%5B%5D=Hd720p&format%5B%5D=Hd1080p&state%5B%5D=Offered&order_by=time&order_way=desc",
	};
	const defaultError = "Sorry, there was an error loading the HANDJOB Member Toolkit";
	let UIlock = false;

	const defaultTemplate = `[b][url=http://passthepopcorn.me/forums.php?action=viewthread&threadid=13617]HANDJOB[/url][/b][hr][align=center][i]Encoded with: ##source##[/i][/align][hr]
[mediainfo][/mediainfo]

[u][b]Screenshots[/b][/u]

##screens##

[hr][align=center][img]https://ptpimg.me/9thwui.png[/img][/align]`;

	/* *************************************
	 *         CLASS DEFINITIONS
	 * ************************************* */

	class MessageCentre {
		constructor() {
			this.skip = 0;
			this.script = "member";
			this.issueCodes = [];
			this.threadLink = `<a href="/forums.php?action=viewthread&threadid=13617" target="_blank">the official HANDJOB thread</a>`;
		}

		branchOffice(branch, issue, data) {
			var feedback;
			var code = issue + "@" + branch;
			this.issueCodes.push(code);
			switch (branch) {
				case "filename":
					feedback = this.filenameBranch(issue, data);
					break;
				case "metatitle":
					feedback = this.metatitleBranch(issue, data);
					break;
				case "x264":
					feedback = this.x264Branch(issue, data);
					break;
				case "video":
					feedback = this.videoBranch(issue, data);
					break;
				case "audio":
					feedback = this.audioBranch(issue, data);
					break;
				case "subtitles":
					feedback = this.subtitlesBranch(issue, data);
					break;
				case "chapters":
					feedback = this.chaptersBranch(issue, data);
					break;
				default:
					feedback = { error: `Couldn't find branch for "${branch}"` };
			}
			feedback.code = code;
			return feedback;
		}

		// use ##source##, ##res## or ##speclink## in link.section for replacement

		filenameBranch(issue, data) {
			var severity,
				message,
				link,
				branch = "filename";

			switch (issue) {
				case "none":
					severity = "errors";
					message = "Couldn't find a valid filename";
					link = {
						section: "sbsfilename",
						subsection: "",
						text: "Using the Right Filename",
					};
					break;
				case "errorParsing":
					severity = "errors";
					message = "There was an error processing the filename";
					break;
				case "extensionAbsent":
					severity = "errors";
					message = "Couldn't find an '.mkv' filename extension";
					break;
				case "extensionDupe":
					severity = "errors";
					message = "Filename extension has been duplicated";
					break;
				case "groupTagAbsent":
					severity = "errors";
					message = "Couldn't find properly formatted group tag (.x264-HANDJOB)";
					break;
				case "groupTagIncorrect":
					severity = "errors";
					message = "Group tag wasn't formatted properly as '.x264-HANDJOB'";
					break;
				case "invalidCharacters":
					severity = "errors";
					message = `Invalid characters were used in the filename. Only letters, numbers, full-stops/periods and hyphens can be used. Letters with diacritics should be replaced with their nearest Latin equivalent. Please fix the following: <div class="filename-error">${data}</div>`;
					break;
				case "noRes":
					severity = "errors";
					message = `No valid resolution tag found. Should include ${data}`;
					link = {
						section: "sbsfilename",
						text: "How to format your filename",
					};
					break;
				case "noYear":
					severity = "errors";
					message = "No year tag was found";
					link = {
						section: "sbsfilename",
						text: "How to format your filename",
					};
					break;
				case "reservedFilename":
					severity = "errors";
					message = `Some operating systems won't allow filenames beginning with '${capFirst(
						data
					)}'. You will need to find an alternative way of writing the title in the filename. Ask in ${
						this.threadLink
					} for more details`;
					break;
				case "shutdown":
					severity = "errors";
					message = `Multiple formatting errors`;
					link = {
						section: "sbsfilename",
						text: "Using the right filename",
					};
					break;
				case "wrongEnding":
					severity = "errors";
					message = "Filename should always end '.x264-HANDJOB.mkv'";
					link = {
						section: "sbsfilename",
						text: "Using the right filename",
					};
					break;
				// Warnings
				case "codecMismatch":
					severity = "warnings";
					message = `The audio codec used in the filename (${data.filenameCodec}) doesn't match the actual audio codec (${data.codec})`;
					break;
				case "noP":
					severity = "warnings";
					message = "The 'p' is missing from the end of your resolution tag";
					break;
				case "resDVD":
					severity = "warnings";
					message =
						"Resolution tags are only for HD-sourced encodes. DVDRips should not be labelled as 480p or 576p in the filename";
					break;
				case "resFormat":
					severity = "warnings";
					message = `The resolution tag is improperly formatted. "${data.match}" should be written as "${data.res}"`;
					break;
				case "resMismatch":
					severity = "warnings";
					message = `The resolution tag in your filename (${data.f}) doesn't match detected resolution (${data.d}) of the encode`;
					break;
				case "resolutionAfterSource":
					severity = "warnings";
					message = `The resolution tag should come before the source tag`;
					link = {
						section: "sbsfilename",
						text: "Using the right filename",
					};
					break;
				case "SDTagHDSource":
					severity = "warnings";
					message = `Your encode appears to be from a Blu-Ray source, but has ${data} tag in filename`;
					break;
				case "yearAfterResolution":
					severity = "warnings";
					message = "The year tag should come before the resolution tag";
					link = {
						section: "sbsfilename",
						text: "Formatting your filename correctly",
					};
					break;
				case "yearBeforeDVDRip":
					severity = "warnings";
					message = "The year tag should come before DVDRip";
					link = {
						section: "sbsfilename",
						text: "Formatting your filename correctly",
					};
					break;
				case "yearFormatting":
					severity = "warnings";
					message = "The year tag isn't formatted properly";
					link = {
						section: "sbsfilename",
						text: "Formatting your filename correctly",
					};
					break;
				// Advisories
				case "ac3Included":
					severity = "advisories";
					message =
						"The audio codec should only be included for non-AC3 formats. These include AAC, FLAC and DTS";
					break;
				case "akaFormatting":
					severity = "advisories";
					message = "AKA should be written in uppercase";
					break;
				case "akaSpelling":
					severity = "advisories";
					message = "It looks like you may have made a mistake writing AKA";
					break;
				case "blurayFormatting":
					severity = "advisories";
					message = `BluRay source tag has been incorrectly written ${data}`;
					link = {
						section: "sbsfilename",
						text: "Formatting your filename correctly",
					};
					break;
				case "codecNotIncluded":
					severity = "advisories";
					message = `If the main audio uses a codec other than AC3/Dolby Digital, then it should be included in the filename: i.e. '.${data}.x264-HANDJOB.mkv'`;
					break;
				case "extensionCase":
					severity = "advisories";
					message = "Filename extension should be written in lowercase as '.mkv'";
					break;
			}

			return { branch, severity, message, link };
		}

		metatitleBranch(issue, data) {
			var severity,
				message,
				link,
				branch = "metatitle";

			switch (issue) {
				case "none":
					severity = "errors";
					message = "No metatitle found";
					link = {
						section: "sbsmetatitle",
						text: "Setting the metatitle",
					};
					break;
				case "filenameMetatitle":
					severity = "errors";
					message = "You have used your filename as the metatitle";
					link = {
						section: "sbsmetatitle",
						text: "Setting the metatitle correctly",
					};
					break;
				case "filenameSyntax":
					severity = "errors";
					message = "Filename syntax used";
					link = {
						section: "sbsmetatitle",
						text: "Setting the metatitle correctly",
					};
					break;
				case "noResolutionTag":
					severity = "errors";
					message = "No valid resolution tag was found";
					link = {
						section: "sbsmetatitle",
						text: "Setting the metatitle correctly",
					};
					break;
				case "noSourceTag":
					severity = "errors";
					message = `No source tag (${data}) found`;
					link = {
						section: "sbsmetatitle",
						text: "Setting the metatitle correctly",
					};
					break;
				case "noYear":
					severity = "errors";
					message = "No year detected";
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "shutdown":
					severity = "errors";
					message = `Multiple formatting errors`;
					link = {
						section: "sbsmetatitle",
						text: "Using the right metatitle",
					};
					break;
				// Warnings
				case "endHJ":
					severity = "warnings";
					message = "No 'HJ' group tag detected";
					break;
				case "generalError":
					severity = "warnings";
					message = "An error was detected in your metatitle's formatting";
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "HJFormatting":
					severity = "warnings";
					message = "The ' - HJ' tag is formatted incorrectly";
					break;
				case "noP":
					severity = "warnings";
					message = "The 'p' is missing from the end of your resolution tag";
					break;
				case "resDVD":
					severity = "warnings";
					message = `You have included a resolution tag (${data}) in a DVDRip. Tags such as 480p and 576p are exclusively for use in HD-sourced encodes`;
					break;
				case "resFormat":
					severity = "warnings";
					message = `An improperly formatted resolution tag was detected. "${data.match}" should be written as "${data.res}"`;
					break;
				case "resMismatch":
					severity = "warnings";
					message = `The resolution tag in your metatitle (${data.m}) doesn't match the detected resolution (${data.d}) of your encode`;
					break;
				case "SDTagHDSource":
					severity = "warnings";
					message = `Your encode appears to be from a Blu-Ray source, but has ${data} tag in metatitle`;
					break;
				case "sourceSpelling":
					severity = "warnings";
					message = "Source tag is mispelled. It should be 'BluRay'";
					break;
				case "usedHANDJOB":
					severity = "warnings";
					message = "'- HJ' should be used as the group tag in metatitles";
					break;
				// Advisories
				case "afterYearFormatting":
					severity = "advisories";
					message = `Invalid characters after the year tag`;
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "audioCodecPresent":
					severity = "advisories";
					message = "Audio codec shouldn't be included in metatitle";
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "noSquareBrackets":
					severity = "advisories";
					message = "Year should be placed inside square brackets";
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "sourceResOrder":
					severity = "advisories";
					message = "Source and resolution tags are in the wrong order";
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "x264Found":
					severity = "advisories";
					message = "x264 shouldn't be included in metatitle";
					link = {
						section: "sbsmetatitle",
						text: "Formatting the metatitle correctly",
					};
					break;
				case "yearMismatch":
					severity = "advisories";
					message = "The year in your metatitle doesn't match the year in the filename";
					break;
			}
			return { branch, severity, message, link };
		}

		x264Branch(issue, data) {
			var severity,
				message,
				link,
				branch = "x264";
			switch (issue) {
				case "2passUsed":
					severity = "errors";
					message =
						"You must use constant quality mode for HANDJOB encoding. Average bitrate mode (aka 2-pass) is not allowed";
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
				case "codecNotX264":
					severity = "errors";
					message = "All HANDJOB encodes must use the x264 codec";
					break;
				case "dxvaIncompatible":
					severity = "errors";
					message = `<div>Your encode is not DXVA compatible. The following issues need correcting:</div><ul class="error-list"><li>${data.join(
						"</li><li>"
					)}</li></ul><div>Ask in ${
						this.threadLink
					} or see the x264 setup instructions for more info ##button##</div>`;
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
				case "minimumNotMet":
					severity = "errors";
					message = `<div>Your encode did not meet the minimum settings. The following issues need correcting:</div><ul class="error-list"><li>${data.join(
						"</li><li>"
					)}</li></ul><div>Ask in ${
						this.threadLink
					} or see the setup instructions for more info ##button##</div>`;
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
				case "qcompVeryLow":
					severity = "errors";
					message =
						"You have used an abnormally low setting for q-comp. Recommended values are between 0.60 and 0.80";
					break;
				case "qcompVeryHigh":
					severity = "errors";
					message =
						"You have used an abnormally high setting for q-comp. Recommended values are between 0.60 and 0.80";
					break;
				// Warnings
				case "aqUnusual":
					severity = "warnings";
					message = `Your aq-strength setting (${data}) is outside of the recommended range (0.5 - 1.2)`;
					break;
				case "psyOff":
					severity = "warnings";
					message = "You have Psy-RDO is turned off, which is not recommended";
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
				case "psyTrellisHigh":
					severity = "warnings";
					message = `Psy-trellis is set unusually high at ${data[0]}:<strong>${data[1]}</strong>. Recommended settings are below 0.25`;
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
				case "psyUnusual":
					severity = "warnings";
					message = `You've used an unusual setting for Psy-RD (<strong>${data[0]}</strong>:${data[1]}). Recommended settings are between 0.8 and 1.2`;
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
				case "qcompLow":
					severity = "warnings";
					message = "You have used a q-comp setting below 0.5, which is not recommended";
					break;
				case "qcompHigh":
					severity = "warnings";
					message = "You have used a q-comp setting above 0.8, which is not recommended";
					break;
				// Advisories
				case "mbtreeOn":
					severity = "advisories";
					message = "You have mb-tree turned on, which is not advised except for digital animation";
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "x264 setup instructions",
					};
					break;
			}
			return { branch, severity, message, link };
		}

		videoBranch(issue, data) {
			var severity,
				message,
				link,
				branch = "video";
			switch (issue) {
				case "noVideoSection":
					severity = "errors";
					message = "No video section found in log. Please ensure that you've copypasted it correctly";
					break;
				case "2160pEncode":
					severity = "errors";
					message =
						"Due to an issue with how Handbrake handles 10-bit colour, 2160p encodes are not currently allowed";
					break;
				case "bitrateUnderSeverely":
					severity = "errors";
					message = `Video bitrate (${data.bitrate} Kbps) is well below the target range of ${data.text} for this resolution`;
					link = {
						section: "faqbitrange",
						text: "Hitting the bitate range",
					};
					break;
				case "bitrateOverSeverely":
					severity = "errors";
					message = `Video bitrate (${data.bitrate} Kbps) is well above the target range of ${data.text} for this resolution`;
					link = {
						section: "faqbitrange",
						text: "Hitting the bitate range",
					};
					break;
				case "blurayAnamorphic":
					severity = "errors";
					message = "Blu-Ray encodes must not use anamorphic display";
					link = {
						section: "sbs##source##setup",
						subsection: "Picture",
						text: "Setting up your picture",
					};
					break;
				case "crfVeryLow":
					severity = "warnings";
					message =
						"Your CRF setting is very low and the encode is likely bloated. It's not recommended to ever go below CRF 14";
					break;
				case "crfVeryHigh":
					severity = "warnings";
					message =
						"Your CRF settings is very high and, as a result, extreme detail loss is likely. If your source is very grainy and you're struggling to contain the bitrate, see the following: ";
					link = {
						section: "faqgrainy",
						text: "Dealing with grain",
					};
					break;
				case "dvdNonAnamorphic":
					severity = "errors";
					message = "DVDRip encodes must use anamorphic display";
					link = {
						section: "sbs##source##setup",
						subsection: "Picture",
						text: "Setting up your picture",
					};
					break;
				case "resizedDVDRip":
					severity = "errors";
					message = `This ${data} DVDRip appears to have been resized. DVD sourced encodes must only ever be cropped, never resized`;
					break;
				case "resProgressive":
					severity = "errors";
					message = "Your encode does not use progressive scan. Please check your filters settings";
					link = {
						section: "sbs##source##setup",
						subsection: "Filters",
						text: "Show me how",
					};
					break;
				case "resWidthOver":
					severity = "errors";
					message = `Width (${this.data.width}px) is over the maximum for this resolution (${data.width} x ${data.height})`;
					link = {
						section: "faqwhatresolution",
						text: "Choosing the correct resolution",
					};
					break;
				case "resHeightOver":
					severity = "errors";
					message = `Height (${this.data.height}px) is over the maximum for this resolution (${data.width} x ${data.height})`;
					link = {
						section: "faqwhatresolution",
						text: "Choosing the correct resolution",
					};
					break;
				case "resNeitherEqual":
					severity = "errors";
					message = `Neither width (${this.data.width}px) nor height (${this.data.height}px) equal the maximum for this resolution (${data.width} x ${data.height})`;
					link = {
						section: "faqwhatresolution",
						text: "Choosing the correct resolution",
					};
					break;
				case "tvAnamorphic":
					severity = "errors";
					message = "TVRip / VHSRip encodes must not use anamorphic display";
					link = {
						section: "specvhstv",
						text: "See specs for VHS/TV encodes",
					};
					break;
				case "variableFramerate":
					severity = "errors";
					message = "All encodes must use constant frame-rate. Variable frame-rate is not allowed";
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "Setting up your video",
					};
					break;
				// Warnings
				case "bitrateMissing":
					severity = "warnings";
					message = "The video bitrate missing from your mediainfo log";
					link = {
						section: "faqnobitrate",
						text: "Dealing with missing bitrates",
					};
					break;
				case "bitrateUnder":
					severity = "warnings";
					message = `Video bitrate (${data.bitrate} Kbps) is below the target range of ${data.text} for this resolution`;
					link = {
						section: "faqbitrange",
						text: "Hitting the bitate range",
					};
					break;
				case "bitrateOver":
					severity = "warnings";
					message = `Video bitrate (${data.bitrate} Kbps) is above the target range of ${data.text} for this resolution`;
					link = {
						section: "faqbitrange",
						text: "Hitting the bitate range",
					};
					break;
				case "crfLow":
					severity = "warnings";
					message =
						"CRF is set below 14. This is not recommended. Remember that digital animation isn't subject to the group's bitrate ranges";
					break;
				case "crfHigh":
					severity = "warnings";
					message =
						"CRF is set above 23, which is not recommended. If you're struggling with a grainy source, see: ";
					link = {
						section: "faqgrainy",
						text: "Dealing with grain",
					};
					break;
				// Advisories
				case "bitrateUnderSlightly":
					severity = "advisories";
					message = `Video bitrate (${data.bitrate} Kbps) is slightly below the target range of ${data.text} for this resolution`;
					link = {
						section: "faqbitrange",
						text: "Hitting the bitate range",
					};
					break;
				case "bitrateOverSlightly":
					severity = "advisories";
					message = `Video bitrate (${data.bitrate} Kbps) is slightly above the target range of ${data.text} for this resolution`;
					link = {
						section: "faqbitrange",
						text: "Hitting the bitate range",
					};
					break;
				case "dupeFrames":
					severity = "advisories";
					message =
						"Your encode is 29.970 fps, which puts it at risk of having duplicate frames. Have you checked for these?";
					link = {
						section: "sbscheckdupes",
						text: "Checking for duplicate frames",
					};
					break;
				case "fpsUnusual":
					severity = "advisories";
					message = `Your encode's frame-rate (${this.data.fps} fps) is unusual. Please verify your source's fps and your video settings`;
					link = {
						section: "sbs##source##setup",
						subsection: "Video",
						text: "Setting up your video",
					};
					break;
			}
			return { branch, severity, message, link };
		}

		audioBranch(issue, data) {
			var severity,
				message,
				link,
				branch = "audio";
			switch (issue) {
				case "audioLengthMismatch":
					severity = "errors"; // duration and label
					message = `${data.label} length (${data.duration} mins) doesn't seem to match video's (${this.data.duration} mins). Please make sure that the audio and video streams have encoded properly`;
					break;
				case "bitDepthHigh":
					severity = "errors";
					message = `Audio track ${data.text} has a bit depth of ${data.bits}-bits. PTP requires encoded audio to have a maximum bit depth of 16-bits. If, <em>and only if</em>, a lossless audio source is available, see <a href="/wiki.php?action=article&id=243" target="_blank">Wiki > Audio bit-depth reduction and sample rate conversion</a> for how to reduce bit depth`;
					break;
				case "dtsHDMA":
					severity = "errors";
					message = `${data}: DTS-HD MA audio. This is considered bloated and should be converted to FLAC or encoded as AC3/AAC`;
					link = {
						section: "sbshdaudioeac",
						text: "Encoding HD audio",
					};
					break;
				case "dupeEnglish":
					severity = "errors";
					message = `Detected ${data} English main audio tracks. You should not generally need to include more than one English track. If you're unsure about which one to include, ask in ${this.threadLink}`;
					break;
				case "lpcmAudio":
					severity = "errors";
					message = `${data}: (L)PCM audio must be converted to FLAC or encoded as AC3/AAC`;
					break;
				case "missingBitrate":
					severity = "errors";
					message = `The bitrate for ${data} is missing`;
					link = {
						section: "faqnobitrate",
						text: "Getting missing bitrates to show",
					};
					break;
				case "noAudio":
					severity = "errors";
					message = "No main audio track seems to be present. Did you remember to mux everything in?";
					break;
				case "noAudioSection":
					severity = "errors";
					message = "No audio section found in log";
					break;
				case "sampleRateHigh":
					severity = "errors";
					message = `${data.text} sample rate is ${data.sample} kHz. If, <em>and only if</em>, a lossless audio source is available, see <a href="/wiki.php?action=article&id=243" target="_blank">Wiki > Audio bit-depth reduction and sample rate conversion</a> for how to downsample`;
					break;
				// Warnings
				case "aacCommentary":
					severity = "warnings";
					message = "AAC should be used for " + data;
					break;
				case "aacDVD":
					severity = "warnings";
					message = "AAC used for DVDRip. All AC3 tracks on a DVD source must be setup as passthru";
					link = {
						section: "sbsdvdsetup",
						subsection: "Audio",
						text: "DVDRip audio setup",
					};
					break;
				case "aacSurround":
					severity = "warnings";
					message = data + " is encoded with AAC, this should only be used for mono and stereo audio tracks";
					break;
				case "ac3Bitrate":
					severity = "warnings";
					message = `${data.text} is encoded at ${data.actual} Kbps. If, and only if, a lossless source is available, then ${data.spec} Kbps should be used`;
					link = {
						section: "spec##speclink##",
						text: "##spectext## specs",
					};
					break;
				case "defaultCommentary":
					severity = "warnings";
					message = capFirst(data) + " should not be set as default";
					break;
				case "engDefault":
					severity = "warnings";
					message = "Original language audio should be default in dual audio encodes";
					link = {
						section: "faqdefaultaudiosubs",
						text: "Choosing default audio/subs",
					};
					break;
				case "genericCommentary":
					severity = "warnings";
					message = "Commentary tracks generally need to be encoded as AAC @ 96 Kbps or less";
					link = {
						section: "spec##speclink##",
						text: "##spectext## specs",
					};
					break;
				case "highCommentary":
					severity = "warnings";
					message = "If using CBR, bitrate should generally be 96 Kbps or lower for " + data;
					link = {
						section: "spec##speclink##",
						text: "##spectext## specs",
					};
					break;
				case "multipleAudio":
					severity = "warnings";
					message =
						"More than two main audio tracks detected. You main audio should usually only include the original language audio and an English dub (dual audio encode). No non-English dubs are permitted";
					break;
				case "noLanguageTag":
					severity = "warnings";
					message = `No language tag was found for ${data}`;
					link = {
						section: "sbsmkvtoolnix",
						subsection: "Audio",
						text: "Labelling audio with MKVToolNix",
					};
					break;
				case "noParticipants":
					severity = "warnings";
					message =
						"Commentary track name should include participants as well as their connection to the film. An example would be: 'Commentary with director Jane Smith'";
					break;
				case "noTrackName":
					severity = "warnings";
					message = "No title detected for " + data;
					link = {
						section: "sbsmkvtoolnix",
						subsection: "Audio",
						text: "Labelling audio with MKVToolNix",
					};
					break;
				case "useCommentary":
					severity = "warnings";
					message = `If applicable, track title '${data}' should start 'Commentary'`;
					break;
				// Advisories
				case "ac3Stereo":
					severity = "advisories";
					message = data + " should be encoded with AAC if the source has lossless audio available";
					link = {
						section: "spec##speclink##",
						text: "##spectext## specs",
					};
					break;
				case "engDubName":
					severity = "advisories";
					message = "English dubs should ideally be labelled 'English Dub'";
					link = {
						section: "sbsmkvtoolnix",
						subsection: "Audio",
						text: "Labelling audio with MKVToolNix",
					};
					break;
				case "mainTitle":
					severity = "advisories";
					message = `Main audio title (${data}) should be blank`;
					link = {
						section: "sbsmkvtoolnix",
						subsection: "Audio",
						text: "Using MKVToolNix to set audio track name",
					};
					break;
				case "mpegAudio":
					severity = "advisories";
					message = data + " seems to be MPEG audio. Are there any other audio sources available?";
					break;
				case "titleBlank":
					severity = "advisories";
					message = `Track name for ${data} should be blank`;
					link = {
						section: "sbsmkvtoolnix",
						subsection: "Audio",
						text: "Using MKVToolNix to set audio track name",
					};
					break;
				case "usedAudioCommentary":
					severity = "advisories";
					message = `To minimise unnecessary information, using 'Commentary' is preferred over 'Audio Commentary' for track title`;
					break;
			}
			return { branch, severity, message, link };
		}

		subtitlesBranch(issue, data) {
			var severity,
				message,
				link,
				branch = "subtitles";
			switch (issue) {
				// Warnings
				case "defaultYes":
					severity = "warnings";
					message = `Track '${data.title || data.lang || "ID: " + data.id}' is set to 'Default: Yes'`;
					link = {
						section: "faqdefaultsubsaudio",
						text: "Choosing default subs/audio",
					};
					break;
				case "engDefault":
					severity = "warnings";
					message = "English subtitles should be set to default for non-English films";
					link = {
						section: "faqdefaultsubsaudio",
						text: "Choosing default subs/audio",
					};
					break;
				case "forcedFlagNotDefault":
					severity = "warnings";
					message = `Subtitle track '${
						data.title || data.lang || "ID: " + data.id
					}' seems to be for non-English scenes, which should generally be set as 'Default: Yes'`;
					link = {
						section: "faqdefaultsubsaudio",
						text: "Choosing default subs/audio",
					};
					break;
				case "forcedYes":
					severity = "warnings";
					message = `Subtitle track '${
						data.title || data.lang || "ID: " + data.id
					}' is set to forced. The forced=yes tag in MKVToolNix should not be used for any subtitles. Use default=yes instead`;
					link = {
						section: "faqdefaultsubsaudio",
						text: "Choosing default subs/audio",
					};
					break;
				case "noDefault":
					severity = "warnings";
					message = "English subtitles not set as default for dual audio encode";
					link = {
						section: "faqdefaultsubsaudio",
						text: "Choosing default subs/audio",
					};
					break;
				case "noLanguageTag":
					severity = "warnings";
					message = `Track '${data.title || "ID: " + data.id}' has no language tag`;
					link = {
						section: "sbsmkvtoolnix",
						subsection: "Subtitles and Muxing",
						text: "Labelling subtitles with MKVToolNix",
					};
					break;
				case "nonEngDefault":
					severity = "warnings";
					message = `Track ${data} set as default`;
					link = {
						section: "faqdefaultsubsaudio",
						text: "Choosing default subs/audio",
					};
					break;
				// Advisories
				case "nameForced":
					severity = "advisories";
					message = `Track title 'English [non-English scenes]' is preferred over '${data}'`;
					break;
				case "noEngSubs":
					severity = "advisories";
					message = "No English subtitles found. Are there any available?";
					break;
				case "noLinguisticLabelling":
					severity = "advisories";
					message =
						"For films whose audio has no linguistic content, default subtitles are best labelled with [On-Screen Text]";
					break;
			}
			return { branch, severity, message, link };
		}

		chaptersBranch(issue, data) {
			var severity,
				message,
				link,
				branch = "chapters";
			switch (issue) {
				case "chapterTimecodes":
					severity = "advisories";
					message = `Chapter titles ${data} seem to be timecodes. It's recommended to use generic ones instead (i.e. Chapter 1, Chapter 2, Chapter 3 etc) if named chapter titles are not available`;
					link = {
						section: "faqfindchapters",
						text: "Finding chapter titles",
					};
					break;
				case "noTitles":
					severity = "advisories";
					message = `Chapter titles ${data} seem to be missing. It's recommended to use generic ones instead (i.e. Chapter 1, Chapter 2, Chapter 3 etc) if named chapter titles are not available`;
					link = {
						section: "faqfindchapters",
						text: "Finding chapter titles",
					};
					break;
				case "missingTitles":
					severity = "advisories";
					message = `Some chapter titles are missing. Please ensure that all of your chapters are named consistently using either named or generic titles`;
					link = {
						section: "faqfindchapters",
						text: "Finding chapter titles",
					};
					break;
			}
			return { branch, severity, message, link };
		}
	}

	// Last updated 2020-04-27
	class MediainfoScanner extends MessageCentre {
		constructor(log) {
			super();
			this.log = log;
			this.feedback = {
				filename: { errors: [], warnings: [], advisories: [] },
				metatitle: { errors: [], warnings: [], advisories: [] },
				video: { errors: [], warnings: [], advisories: [] },
				x264: { errors: [], warnings: [], advisories: [] },
				audio: { errors: [], warnings: [], advisories: [] },
				subtitles: { errors: [], warnings: [], advisories: [] },
				chapters: { errors: [], warnings: [], advisories: [] },
				guides: [],
			};
			this.exceptions = [];
			this.breakdown();
			let valid = this.valid();
			if (!valid) return;
			this.filename();
			this.resolution();
			this.metatitle();
			this.checkDxva();
			this.checkMinimum();
			this.x264();
			this.checkAnamorphic();
			this.checkRes();
			this.checkFramerate();
			this.checkBitrate();
			this.sortAudioTracks();
			this.checkMainAudio();
			this.checkSecondaryAudio();
			this.checkChapters();
			this.condenseErrors();
		}

		valid() {
			if (!this.data) return false;
			else if (!this.data.filename) return false;
			else if (!this.data.width) return false;
			else if (!this.data.height) return false;
			else return true;
		}

		getFeedback() {
			return this.feedback;
		}

		generateLink(link) {
			// Insertion of contextual data into link
			for (let key in link) {
				link[key] = link[key].replace(/##source##/g, this.data.source);
				link[key] = link[key].replace(/##res##/g, this.data.res);
				link[key] = link[key].replace(/##speclink##/g, this.data.speclink);
				link[key] = link[key].replace(/##spectext##/g, this.data.spectext);
			}

			if (!link.subsection) link.subsection = "";

			return ` <button type="button" data-guide="${link.section}" data-subsection="${link.subsection}" class="expand-guide">
                    <div>${link.text}</div>
                </button>`;
		}

		miParse({ match, log = this.log, singleLine = true, crushOutput = false }) {
			if (singleLine) match = new RegExp("(?:^" + match + "\\s*:\\s*)(.*$)", "im");
			else if (match === "Menu") match = /(Menu(\s#\d+)?\n)((\s|\S)*?)(\n\n|$)/gi;
			else if (match !== "Video") match = new RegExp("(^" + match + "[\\s\\S]*?Forced[^\\n]*)", "gim");
			else match = new RegExp("(?:\\n)(" + match + "[\\s\\S]*?)(\\n\\n|$)", "gi");
			let a = log.match(match);
			try {
				if (singleLine) a = a[1];
			} catch (e) {
				a = "";
			}
			if (crushOutput && a && singleLine) return a.replace(/\s/g, "");
			else return a;
		}

		err(branch, issue, data = "") {
			// messageObject returns object containing: {branch, severity, message, link: {section, subsection, message}}
			// messageObject.error if problem with retrieving message
			var output,
				messageObject,
				link = "";
			if (branch && issue) messageObject = this.branchOffice(branch, issue, data);
			else console.log("Not Enough data to generate message");

			if (this.script === "member" && messageObject.link) link = this.generateLink(messageObject.link);

			if (/##button##/.test(messageObject.message)) output = messageObject.message.replace("##button##", link);
			else output = messageObject.message + link;
			if (!messageObject.message) console.log(`Error retrieving message for ${issue}@${branch}`);
			else
				this.feedback[branch][messageObject.severity].push({
					code: messageObject.code,
					output,
					data,
				});
		}

		checkSkip() {
			if (this.skip > 2) return true;
			else return false;
		}

		condenseErrors() {
			var skip = this.checkSkip();
			if (skip) return false;

			var count = 0;
			this.issueCodes.map((x) => {
				// If more than 2 metatitle issues, replace with one error
				if (x.split("@")[1].search(/metatitle/i) >= 0) count++;
			});
			if (count > 2) {
				this.feedback.metatitle = this.wipe();
				this.err("metatitle", "shutdown");
			}

			var count = 0;
			this.issueCodes.map((x) => {
				// If more than 2 filename issues, replace with one error
				if (x.split("@")[1].search(/filename/i) >= 0) count++;
			});
			if (count > 2) {
				this.feedback.filename = this.wipe();
				this.err("filename", "shutdown");
			}

			if (this.data.source === "dvd") this.filterErrors(["noResolutionTag@metatitle", "noSourceTag@metatitle"]);

			this.filterErrors(["resMismatch@filename", "noRes@filename"]);
			this.filterErrors(["multipleAudio@audio", "dupeEnglish@audio"]);
			this.filterErrors(["noResolutionTag@metatitle", "noP@metatitle"]);
			this.filterErrors(["resMismatch@metatitle", "noResolutionTag@metatitle"]);
			this.filterErrors(["aacCommentary@audio", "highCommentary@audio"], true, ["audio", "genericCommentary"]);
		}

		wipe() {
			return { errors: [], warnings: [], advisories: [] };
		}

		filterErrors(codes, all, cb) {
			let check = this.checkCombination(codes);
			if (check && all) this.removeIssue(codes);
			else if (check) this.removeIssue([codes[0]]);
			if (check && cb) this.err(cb[0], cb[1]);
		}

		checkCombination(issues) {
			let count = 0;
			this.issueCodes.map((x) => {
				for (let issue of issues) {
					if (x === issue) count++;
				}
			});
			if (count >= issues.length) return true;
			else return false;
		}

		removeIssue(issues) {
			let sections = ["errors", "warnings", "advisories"];
			let data = [];

			for (let i = 0; i < issues.length; i++) {
				let branch = issues[i].split("@")[1];
				for (let x of sections) {
					this.feedback[branch][x] = this.feedback[branch][x].filter((f) => {
						if (f.code !== issues[i]) return true;
						else data.push(f.data);
					});
				}
			}
			return data;
		}

		arrayCount(array, value) {
			let reg = new RegExp(value, "i");
			return array.reduce((n, x) => n + (x.search(reg) >= 0), 0);
		}

		escapeRegExp(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
		}

		calculateDuration(string) {
			let hours = string.match(/(\d{1,})(?:h)/i);
			hours = hours && hours.length > 0 ? parseInt(hours[1], 10) : 0;
			let mins = string.match(/(\d{1,})(?:mn)/i);
			mins = mins && mins.length > 0 ? parseInt(mins[1], 10) : 0;
			let secs = string.match(/(\d{1,})(?:s)/i);
			secs = secs && secs.length > 0 ? parseInt(secs[1], 10) : 0;
			if (secs > 30) mins++;
			return hours * 60 + mins;
		}

		// Run these in the constructor and log with this.err("filename","none",data)

		breakdown() {
			var data = {};
			data.filename = this.miParse({ match: "Complete name" });
			data.filename = data.filename.replace(/\\/g, "/").split("/").pop();
			data.metatitle = this.miParse({ match: "Movie name" });
			data.primaries = this.miParse({ match: "Color primaries" }).replace(/\W/g, "").toLowerCase();
			if (data.primaries.search(/601ntsc/i) >= 0 || /470systemm/i.test(data.primaries) === true) {
				data.source = "dvd";
				data.region = "ntsc";
			} else if (data.primaries.search(/601pal/i) >= 0 || /systemi/i.test(data.primaries) === true) {
				data.source = "dvd";
				data.region = "pal";
			} else data.source = "bluray";
			try {
				data.video = this.miParse({ match: "Video", singleLine: false })[0];
			} catch (e) {
				this.err("video", "noVideoSection");
				this.exceptions.push({
					stack: e.stack,
					message: "Error finding valid video section",
				});
				return false;
			}
			data.bitrate = this.miParse({
				match: "Bit rate",
				log: data.video,
				crushOutput: true,
			});
			data.bitrate = data.bitrate.search(/mb/i) >= 0 ? parseFloat(data.bitrate) * 1000 : parseFloat(data.bitrate);
			data.scan = this.miParse({ match: "Scan type", log: data.video });
			data.duration = (() => {
				let string = this.miParse({ match: "Duration", log: data.video });
				return this.calculateDuration(string);
			})();
			data.width = parseInt(this.miParse({ match: "Width", log: data.video, crushOutput: true }), 10);
			data.height = parseInt(this.miParse({ match: "Height", log: data.video, crushOutput: true }), 10);
			data.aspect = this.miParse({
				match: "Display aspect ratio",
				log: data.video,
				crushOutput: true,
			}).split(":");
			if (!data.aspect[1]) data.aspect[1] = 1;
			data.frm = this.miParse({
				match: "Frame rate mode",
				log: data.video,
			}).toLowerCase();
			data.library = this.miParse({
				match: "Writing library",
				log: data.video,
			});
			data.fps = parseFloat(
				this.miParse({
					match: "Frame rate",
					log: data.video,
					crushOutput: true,
				})
			);
			data.settings = this.miParse({
				match: "Encoding settings",
				log: data.video,
			}).split("/");
			try {
				data.audio = this.miParse({ match: "Audio", singleLine: false }) || [];
			} catch (e) {
				this.err("audio", "noAudioSection");
			}
			data.subtitles = this.miParse({ match: "Text", singleLine: false }) || [];
			data.chapters = this.miParse({ match: "Menu", singleLine: false }) || [];

			for (let i = 0; i < data.audio.length; i++) {
				let audio = data.audio[i],
					obj = {};
				obj.id = parseInt(this.miParse({ match: "ID", log: audio }), 10);
				obj.title = this.miParse({ match: "Title", log: audio });
				obj.format = obj.fullFormat = this.miParse({
					match: "Format",
					log: audio,
					crushOutput: true,
				});
				obj.format = obj.format.replace(/\W/, "");
				obj.comp = this.miParse({ match: "Compression mode", log: audio });
				obj.bitrate = this.miParse({ match: "Bit rate", log: audio });
				obj.bitrate = obj.bitrate.search(/kb/i) >= 0 ? parseFloat(obj.bitrate.replace(/[^0-9.]/g, "")) : null;
				obj.bits = parseInt(this.miParse({ match: "Bit depth", log: audio }), 10) || 16;
				obj.channels = parseInt(
					this.miParse({
						match: "Channel\\(s\\)",
						log: audio,
						crushOutput: true,
					}),
					10
				);
				obj.duration = (() => {
					let string = this.miParse({ match: "Duration", log: audio });
					return this.calculateDuration(string);
				})();
				obj.sample = this.miParse({
					match: "Sampling rate",
					log: audio,
					crushOutput: true,
				});
				obj.sample = obj.sample.search(/k/i) < 0 ? parseFloat(obj.sample) / 1000 : parseFloat(obj.sample);
				obj.lang = this.miParse({ match: "Language", log: audio });
				obj.default = this.miParse({ match: "Default", log: audio });
				obj.default = obj.default.search(/yes/i) >= 0 ? true : false;
				data.audio[i] = obj;
			}

			for (let i = 0; i < data.subtitles.length; i++) {
				let subs = data.subtitles[i];
				let obj = {};
				obj.id = parseInt(this.miParse({ match: "ID", log: subs }), 10);
				obj.title = this.miParse({ match: "Title", log: subs });
				obj.format = this.miParse({ match: "Format", log: subs });
				obj.lang = this.miParse({ match: "Language", log: subs });
				obj.default = this.miParse({ match: "Default", log: subs });
				obj.default = obj.default.search(/yes/i) >= 0 ? true : false;
				obj.forced = this.miParse({ match: "Forced", log: subs });
				obj.forced = obj.forced.search(/yes/i) >= 0 ? true : false;
				data.subtitles[i] = obj;
			}

			for (let i = 0; i < data.chapters.length; i++) {
				let chap = data.chapters[i];
				chap = chap.replace(/Menu(\s#\d+)?\n/i, "").trim();
				chap = chap.split("\n");
				chap = chap.map((x) => {
					let a = x.split(/\s+:(?:[^0-9]*?:)?/);
					if (!a[1]) a[1] = "";
					if (a[0]) return { time: a[0], title: a[1] };
				});
				data.chapters[i] = chap;
			}

			var settingsObj = {};
			for (let i = 0; i < data.settings.length; i++) {
				try {
					let setting = data.settings[i].split("=");
					let key = setting[0].replace(/[^a-zA-Z0-9]/g, "");
					let value = setting[1].trim();
					if (key.search(/(aq|crf(?!max)|psyrd|qcomp|ipratio|pbratio)/i) >= 0)
						value = value.replace(/,/g, ".");
					settingsObj[key] = value;
				} catch (e) {
					continue;
				}
			}
			data.settings = settingsObj;

			this.data = data;
			if (this.data.library.search(/x264/i) < 0) {
				this.err("x264", "codecNotX264");
				this.skip += 5;
			}
		}

		filename() {
			var skip = this.checkSkip();
			if (skip) return false;
			let f = this.data.filename;
			if (!f) {
				this.err("filename", "none");
				return false;
			}
			var illegal = ["aux", "com", "lpt", "con", "nul", "prn"];
			for (let i = 0; i < illegal.length; i++) {
				var regex;
				if (illegal[i] === "com" || illegal[i] === "lpt") {
					for (let a = 1; a < 10; a++) {
						regex = new RegExp("^" + illegal[i] + a + "\\.", "i");
						if (regex.test(f)) this.err("filename", "reservedFilename", illegal[i] + a);
					}
				} else {
					regex = new RegExp("^" + illegal[i] + "\\.", "i");
					if (regex.test(f)) this.err("filename", "reservedFilename", illegal[i]);
				}
			}
			if (f.search(/remux/i) >= 0) this.skip += 5;
			try {
				var a = f.match(/[^a-zA-z\d.-]/gi);
				if (a) {
					a = f.replace(/([^a-zA-Z0-9-.])/g, "<span class='filename-typo'>$1</span>");
					this.err("filename", "invalidCharacters", a);
					a = "";
				}

				this.data.filenameYear = f.match(/^.*(?=19|20)(\d{4}).*$/i);
				this.data.filenameYear =
					this.data.filenameYear && this.data.filenameYear.length > 0 ? this.data.filenameYear.pop() : "";
				if (this.data.filenameYear < 0) this.err("filename", "noYear");
				else if (f.search(/\.(?=19|20)(\d{4})\./i) < 0) this.err("filename", "yearFormatting");
				if (f.search(/\.aka\./i) >= 0 && f.search(/\.AKA\./) < 0) this.err("filename", "akaFormatting");
				if (f.search(/\.a(?![kK])[a-zA-Z]a\./i) >= 0) this.err("filename", "akaSpelling");

				a = f.match(/dvdrip.\d{4}/gi);
				if (a) this.err("filename", "yearBeforeDVDRip");

				let yearPos = f.search(/\.(?=19|20)(\d{4})\./i);
				let sourcePos = f.search(/blu(.{0,3})ray/i);
				let resolutionPos = f.search(/\d{3,4}p/i);
				if (sourcePos >= 0 && resolutionPos > sourcePos) this.err("filename", "resolutionAfterSource");
				if (resolutionPos >= 0 && yearPos > resolutionPos) this.err("filename", "yearAfterResolution");

				if (f.search(/ac3/i) >= 0) this.err("filename", "ac3Included");
				a = f.match(/blu(.*?)ray/gi);
				if (a) a = `as '${a[0]}'`;
				if (f.replace(/[^0-9a-zA-Z]/g, "").search(/blu(.*?)ray/i) >= 0 && f.search(/BluRay/) < 0) {
					this.err("filename", "blurayFormatting", a);
					a = "";
				}
				if (f.search(/\.mkv$/i) >= 0 && f.search(/\.mkv$/) < 0) this.err("filename", "extensionCase");
				else if (f.search(/\.mkv$/) < 0) this.err("filename", "extensionAbsent");
				else if (f.match(/mkv/gi).length >= 2) this.err("filename", "extensionDupe");
				else if (f.replace(/[^a-zA-Z0-9]/g, "").search(/x264handjob/i) >= 0 && f.search(/x264-HANDJOB/) < 0)
					this.err("filename", "groupTagIncorrect");
				else if (f.search(/x264-HANDJOB/) < 0) this.err("filename", "groupTagAbsent");
				else if (f.search(/x264-HANDJOB\.mkv$/gi) < 0) this.err("filename", "wrongEnding");
			} catch (e) {
				this.err("filename", "errorParsing");
				this.exceptions.push({
					stack: e.stack,
					message: "Error during parsing of filename section",
				});
				console.log(e);
			}
		}

		metatitle() {
			var skip = this.checkSkip();
			let failed = false,
				general;
			if (skip) return false;
			try {
				let m = this.data.metatitle;
				if (!m) {
					this.err("metatitle", "none");
					return true;
				} else if (
					m == this.data.filename ||
					m.search(this.data.filename) >= 0 ||
					this.data.filename.replace(/\.mkv/i, "") === m
				) {
					this.err("metatitle", "filenameMetatitle");
					return true;
				} else if (m.search(/\s/) < 0) {
					this.err("metatitle", "filenameSyntax");
					return true;
				}

				general = /\[\d{4}\](\s[A-Z].*[a-z])?(\s\d{3,4}p\s[a-zA-Z]{5,7}|\s[a-zA-Z]{5,7})\s-\sHJ$/g.test(m);

				this.data.metatitleYear = m.match(/^.*(?=19|20)(\d{4}).*$/i);
				this.data.metatitleYear =
					this.data.metatitleYear && this.data.metatitleYear.length > 0 ? this.data.metatitleYear.pop() : "";
				if (
					this.data.metatitleYear &&
					this.data.filenameYear &&
					this.data.metatitleYear !== this.data.filenameYear
				)
					this.err("metatitle", "yearMismatch");
				else if (this.data.metatitleYear < 0) this.err("metatitle", "noYear");
				else if (m.search(/\[\d{4}\]/) < 0) this.err("metatitle", "noSquareBrackets");

				let ex = m.match(/\[\d{4}\]\s([^a-zA-Z0-9])/);
				if (ex && ex.length > 0) this.err("metatitle", "afterYearFormatting", ex[1]);

				if (m.search(/(?:\[|\]\(\))(?:.*?)(flac|dts|aac|ac3|mp3|mp2|mpeg|eac3)/gi) >= 0)
					this.err("metatitle", "audioCodecPresent");
				if (
					this.data.source === "bluray" &&
					m.replace(/[^a-zA-Z0-9]/g, "").search(/bluray/i) < 0 &&
					m.replace(/[^a-zA-Z0-9]/g, "").search(/hdtv/i) < 0 &&
					m.replace(/[^a-zA-Z0-9]/g, "").search(/hddvd/i) < 0
				) {
					this.err("metatitle", "noSourceTag", "BluRay");
				} else if (m.replace(/[^a-zA-Z0-9]/g, "").search(/blueray/i) > 0)
					this.err("metatitle", "sourceSpelling", "BluRay");
				else if (
					this.data.source === "dvd" &&
					this.data.filename.search(/(tvrip|vhsrip)/i) < 0 &&
					m.search(/dvdrip/i) < 0
				) {
					this.err("metatitle", "noSourceTag", "DVDRip");
				} else if (
					this.data.source === "dvd" &&
					this.data.filename.search(/(tvrip|vhsrip)/i) > 0 &&
					m.search(/(tvrip|vhsrip)/i) < 0
				) {
					this.err("metatitle", "noSourceTag", "TVRip / VHSRip");
				}
				if (this.data.source === "bluray" && m.search(/\d{3,4}p/i) < 0)
					this.err("metatitle", "noResolutionTag");
				if (this.data.source === "bluray" && m.search(/ray[\W]*\d{3,4}/i) >= 0) {
					let match = m.match(/blu[\W\w]*ray[\W]*\d{3,4}p/gi);
					this.err("metatitle", "sourceResOrder", match);
				}
				if (m.search(/x264/i) >= 0) this.err("metatitle", "x264Found");
				if (m.search(/HANDJOB$/i) >= 0) this.err("metatitle", "usedHANDJOB");
				else if (m.search(/\s*-\s*hj\s*$/i) >= 0 && m.search(/ - HJ$/) < 0)
					this.err("metatitle", "HJFormatting");
				else if (m.search(/\s*-\s*hj$/i) < 0) this.err("metatitle", "endHJ");
			} catch (e) {
				failed = true;
			}

			if (failed === true) this.err("metatitle", "generalError");
			if (
				general === false &&
				this.feedback.metatitle.errors.length == 0 &&
				this.feedback.metatitle.warnings.length == 0 &&
				this.feedback.metatitle.advisories.length == 0
			)
				this.err("metatitle", "generalError");
		}

		checkDxva() {
			var skip = this.checkSkip();
			if (skip) return false;
			if (!this.data.settings.ref) return false;
			var pass = true,
				failings = [];
			let ref = parseInt(this.data.settings.ref, 10);
			let vbv = parseFloat(this.data.settings.vbvmaxrate);
			var maxRef = Math.floor(
				8388608 / ([Math.ceil(this.data.width / 16) * 16] * [Math.ceil(this.data.height / 16) * 16])
			);
			if (this.data.settings.analyse != "0x3:0x133" && this.data.settings.analyse != "0x3:0x113") {
				pass = false;
				failings.push(`Analyse not 0x3:0x133 or 0x3:0x113`);
			}
			if (ref > maxRef) {
				pass = false;
				failings.push(
					`Ref: ${this.data.settings.ref}. Maximum reference frames for this resolution is ${maxRef}`
				);
			}
			if (vbv > 62500) {
				pass = false;
				failings.push(`Vbv_Maxrate: ${commaSeparateNumber(vbv)} Kbps. Maximum is 50,000 Kbps`);
			}

			if (!pass) {
				this.err("x264", "dxvaIncompatible", failings);
			}
		}

		checkMinimum() {
			var skip = this.checkSkip();
			if (skip) return false;
			try {
				var pass = true,
					issues = [];
				if (parseInt(this.data.settings.cabac, 10) != 1) {
					pass = false;
					issues.push("CABAC not 1");
				}
				if (this.data.settings.analyse != "0x3:0x133" && this.data.settings.analyse != "0x3:0x113") {
					pass = false;
					issues.push("Analyse not 0x3:0x133 or 0x3:0x113");
				}
				if (parseInt(this.data.settings.subme, 10) < 7) {
					pass = false;
					issues.push("Subme less than 7");
				}
				if (this.data.settings.me.search(/umh|tesa|esa/) < 0) {
					pass = false;
					issues.push("Me is not UMH, ESA, or TESA");
				}
				if (parseInt(this.data.settings.trellis, 10) != 2) {
					pass = false;
					issues.push("Trellis not 2");
				}
				let deblock = this.data.settings.deblock.split(":");
				deblock.map((x) => parseInt(x, 10));
				if (deblock[0] != 1 || deblock[1] >= 0 || deblock[2] >= 0) {
					pass = false;
					issues.push("Deblock values not less than zero");
				}
				if (this.data.settings.rc.search(/2pass|crf/) < 0) {
					pass = false;
					issues.push("Rate control not 2-pass or CRF");
				}

				if (
					this.data.source == "dvd" ||
					this.data.source === "tv" ||
					this.data.source === "vhs" ||
					this.data.res == "480p" ||
					this.data.res == "576p"
				) {
					if (parseInt(this.data.settings.bframes, 10) < 5) {
						pass = false;
						issues.push("Used fewer than 5 bframes");
					}
					if (parseInt(this.data.settings.ref, 10) < 9) {
						pass = false;
						issues.push("Used fewer than 9 reference frames");
					}
					if (parseInt(this.data.settings.merange, 10) < 16) {
						pass = false;
						issues.push("Me-range less than 16");
					} else if (parseInt(this.data.settings.merange, 10) < 24 && this.data.settings.me != "tesa") {
						pass = false;
						issues.push("Me-range less than 24 without me:TESA");
					}
				} else if (this.data.res == "720p") {
					if (parseInt(this.data.settings.merange, 10) < 16) {
						pass = false;
						issues.push("Me-range less than 16");
					}
					if (parseInt(this.data.settings.ref, 10) < 8) {
						pass = false;
						issues.push("Used fewer than 8 reference frames");
					}
					if (parseInt(this.data.settings.bframes, 10) < 5) {
						pass = false;
						issues.push("Used fewer than 5 bframes");
					}
				} else if (this.data.res == "1080p") {
					if (parseInt(this.data.settings.merange, 10) < 16) {
						pass = false;
						issues.push("Me-range less than 16");
					}
					if (parseInt(this.data.settings.ref, 10) < 3) {
						pass = false;
						issues.push("Used fewer than 3 reference frames");
					}
					if (parseInt(this.data.settings.bframes, 10) < 3) {
						pass = false;
						issues.push("Used fewer than 3 bframes");
					}
				} else {
					console.log("Error checking minimum settings.");
				}

				if (!pass) {
					this.err("x264", "minimumNotMet", issues);
				}
				return true;
			} catch (e) {
				this.err("x264", "codecNotX264");
				return false;
			}
		}

		x264() {
			var skip = this.checkSkip();
			if (skip) return false;
			if (parseFloat(this.data.settings.qcomp) <= 0.3) this.err("x264", "qcompVeryLow");
			else if (parseFloat(this.data.settings.qcomp) <= 0.5) this.err("x264", "qcompLow");
			else if (parseFloat(this.data.settings.qcomp) > 0.95) this.err("x264", "qcompVeryHigh");
			else if (parseFloat(this.data.settings.qcomp) > 0.8) this.err("x264", "qcompHigh");
			if (this.data.settings.mbtree != "0") this.err("x264", "mbtreeOn");
			if (this.data.settings.rc.search(/2pass/) >= 0) this.err("x264", "2passUsed");
			if (parseFloat(this.data.settings.crf) < 12) this.err("video", "crfVeryLow");
			else if (parseFloat(this.data.settings.crf) < 14) this.err("video", "crfLow");
			else if (parseFloat(this.data.settings.crf) > 26) this.err("video", "crfVeryHigh");
			else if (parseFloat(this.data.settings.crf) > 23) this.err("video", "crfHigh");

			if (this.data.settings.psy != "1") this.err("x264", "psyOff");
			var psy = this.data.settings.psyrd.split(":");
			if (parseFloat(psy[0]) < 0.8 || parseFloat(psy[0]) > 1.2) {
				this.err("x264", "psyUnusual", psy);
			}
			if (parseFloat(psy[1]) > 0.25) this.err("x264", "psyTrellisHigh", psy);
			let aq = parseFloat(this.data.settings.aq.split(":")[1]);
			if (aq < 0.5 || aq > 1.2) this.err("x264", "aqUnusual", aq);
			if (this.data.frm.search(/variable/i) >= 0) this.err("video", "variableFramerate");
		}

		checkAnamorphic() {
			var skip = this.checkSkip();
			if (skip) return false;
			var anamorphic = false;
			var anaWidth = Math.ceil(
				(this.data.height / parseFloat(this.data.aspect[1])) * parseFloat(this.data.aspect[0])
			);
			var margin = (this.data.width / 100) * 3;
			if (anaWidth < this.data.width - margin || anaWidth > this.data.width + margin) anamorphic = true;
			this.data.anamorphic = anamorphic;

			var fname = this.data.filename.replace(/[^a-zA-Z0-9.]/g, "");
			if (fname.search(/(tvrip|vhsrip)/i) >= 0 && anamorphic) this.err("video", "tvAnamorphic");
			else if (this.data.source == "dvd" && fname.search(/(tvrip|vhsrip)/i) < 0 && !anamorphic)
				this.err("video", "dvdNonAnamorphic");
			else if (this.data.source == "bluray" && anamorphic) this.err("video", "blurayAnamorphic");
		}

		resolution() {
			var skip = this.checkSkip();
			if (skip) return false;

			// Check width and height against this.data.res: over, under, neither equal
			// Check progressive scan

			var resolutions = ["DVDRip", "VHSRip", "TVRip", "480p", "576p", "720p", "1080p"];
			var resString = () => {
				let temp = this.data.source === "bluray" ? resolutions.splice(3) : resolutions.splice(0, 3);
				let x = temp.pop();
				let y = temp.join(", ");
				return y + " or " + x;
			};

			// ## SECTION FOR FILENAME ##

			var regex,
				regex2,
				filenameRes = {},
				metatitleRes = {},
				detectedRes;
			switch (this.data.source) {
				case "dvd":
					// Iterate through resolutions
					resolutions.map((x) => {
						// Ensure that numbered resolution isn't included in a DVDRip.
						regex = new RegExp(parseInt(x, 10), "i");
						if (parseInt(x, 10) && this.data.filename.search(regex) >= 0) this.err("filename", "resDVD");

						// Capture filename resolution
						if (!isNaN(x.charAt(0))) return true; // Skip the following for Blu-Ray resolutions

						regex = new RegExp(x.replace(/[^a-zA-Z0-9]/g, ""), "i");
						if (this.data.filename.match(regex)) {
							filenameRes.match = this.data.filename.match(regex)[0]; // Match and save filename res
							filenameRes.actual = x;
						}
						// Test if filename resolution is formatted properly
						if (this.data.filename.search(x) < 0 && this.data.filename.search(regex) >= 0)
							this.err("filename", "resFormat", {
								res: x,
								match: filenameRes.match,
							});
					});
					break;
				case "bluray":
					resolutions.map((x) => {
						if (isNaN(x.charAt(0))) {
							// If the iterated resolution starts with a letter...
							regex = new RegExp(x.replace(/[^a-zA-Z0-9]/g, ""), "i");
							// Check that an SD tag hasn't been included
							if (this.data.filename.search(regex) >= 0 && this.data.filename.search(/hdtv/i) < 0)
								this.err("filename", "SDTagHDSource", x);
							return true;
						} else {
							regex = new RegExp(x.replace(/[^a-zA-Z0-9]/g, ""), "i");
							regex2 = new RegExp(x.replace(/[^0-9]/g, ""));
							if (this.data.filename.match(regex)) {
								filenameRes.match = this.data.filename.match(regex)[0]; // Match and save filename res
								filenameRes.actual = x;
								if (filenameRes.match !== x)
									this.err("filename", "resFormat", {
										res: x,
										match: filenameRes.match,
									});
							} else if (this.data.filename.match(regex2)) {
								filenameRes.match = this.data.filename.match(regex2)[0]; // Match and save filename res
								filenameRes.actual = x;
								if (filenameRes.match !== x) this.err("filename", "noP", x);
							}
						}
					});
					break;
				default:
			}
			if (!filenameRes.match) this.err("filename", "noRes", resString());

			// ## SECTION FOR METATITLE ##

			switch (this.data.source) {
				case "dvd":
					resolutions.map((x) => {
						// Ensure that numbered resolution isn't included in a DVDRip.
						regex = new RegExp(parseInt(x, 10), "i");
						if (parseInt(x, 10) && this.data.metatitle.search(regex) >= 0)
							this.err("metatitle", "resDVD", x);
						if (!isNaN(x.charAt(0))) return true;

						regex = new RegExp(x.replace(/[^a-zA-Z0-9]/g, ""), "i");
						if (regex.test(this.data.metatitle)) {
							metatitleRes.match = this.data.metatitle.match(regex)[0]; // Match and save metatitle res
							metatitleRes.actual = x;
						}
						// Test if filename resolution is formatted properly
						if (
							this.data.metatitle.search(x) < 0 &&
							this.data.metatitle.search(regex) >= 0 &&
							filenameRes.actual === metatitleRes.actual
						) {
							this.err("metatitle", "resFormat", {
								res: x,
								match: metatitleRes.match,
							});
						}
					});
					break;
				case "bluray":
					resolutions.map((x) => {
						if (isNaN(x.charAt(0))) {
							// If the iterated resolution starts with a letter...
							regex = new RegExp(x.replace(/[^a-zA-Z0-9]/g, ""), "i");
							// Check that an SD tag hasn't been included
							if (this.data.metatitle.search(regex) >= 0 && this.data.metatitle.search(/hdtv/i) < 0)
								this.err("metatitle", "SDTagHDSource", x);
							return true;
						}
						// If the iterated resolution starts with a number
						else {
							regex = new RegExp(x.replace(/[^a-zA-Z0-9]/g, ""), "i");
							regex2 = new RegExp(x.replace(/[^0-9]/g, ""));
							if (regex.test(this.data.metatitle)) {
								metatitleRes.match = this.data.metatitle.match(regex)[0]; // Match and save metatitle res
								metatitleRes.actual = x;
								if (metatitleRes.match !== x)
									this.err("metatitle", "resFormat", {
										res: x,
										match: metatitleRes.match,
									});
							} else if (regex2.test(this.data.metatitle)) {
								metatitleRes.match = this.data.metatitle.match(regex2)[0]; // Match and save metatitle res
								metatitleRes.actual = x;
								if (metatitleRes.match !== x) this.err("metatitle", "noP", x);
							}
						}
					});
					break;
				default:
			}

			if (this.data.metatitle && !metatitleRes.match) this.err("metatitle", "noResolutionTag", resString());

			this.data.res = filenameRes.actual ? filenameRes.actual : metatitleRes.actual;
			if (this.data.res) this.data.res = !isNaN(this.data.res.charAt(0)) ? this.data.res : "";
			if (this.data.scan.search(/progressive/i) < 0) this.err("video", "resProgressive");

			// ## Detected Resolution Section ##

			var w = this.data.width,
				h = this.data.height;
			if (this.data.source === "bluray") {
				if (w === 854 || h === 480) detectedRes = "480p";
				else if (w === 1024 || h === 576) detectedRes = "576p";
				else if (w === 1280 || h === 720) detectedRes = "720p";
				else if (w === 1920 || h === 1080) detectedRes = "1080p";
				else if (w === 3840 || h === 2160) detectedRes = "2160p";
				else if (w <= 939 && h <= 528) detectedRes = "480p";
				else if (w <= 1152 && h <= 648) detectedRes = "576p";
				else if (w <= 1600 && h <= 900) detectedRes = "720p";
				else if (w <= 2880 && h <= 1620) detectedRes = "1080p";
				else detectedRes = "2160p";

				if (detectedRes === "2160p") this.err("video", "2160pEncode");
			} else {
				if (this.data.region === "ntsc") {
					if (w > 720 || h > 480) this.err("video", "resizedDVDRip", "NTSC");
				} else if (this.data.region === "pal") {
					if (w > 720 || h > 576) this.err("video", "resizedDVDRip", "PAL");
				}
			}

			if (detectedRes && detectedRes !== filenameRes.actual)
				this.err("filename", "resMismatch", {
					f: filenameRes.match,
					d: detectedRes,
				});
			if (detectedRes && this.data.metatitle && detectedRes !== metatitleRes.actual)
				this.err("metatitle", "resMismatch", {
					m: metatitleRes.match,
					d: detectedRes,
				});
			this.data.res = detectedRes || "";

			// After this.data.res is set...
			if (this.data.filename.search(/(vhsrip|[^hd]tvrip)/i) >= 0) {
				this.data.speclink = "vhstv";
				this.data.spectext = "VHSRip / TVRip";
			} else if (this.data.region) {
				this.data.speclink = this.data.region + "dvd";
				this.data.spectext = this.data.region.toUpperCase() + " DVD";
			} else {
				this.data.speclink = this.data.res;
				this.data.spectext = this.data.res + " Blu-Ray";
			}
		}

		// This function verifies the width and height settings of the encode. Comes later // 96px - 144px - 360px
		checkRes() {
			var skip = this.checkSkip();
			if (skip) return false;
			let wd = this.data.width,
				ht = this.data.height;
			let specs = [
				{ type: "480p", width: 854, height: 480 },
				{ type: "576p", width: 1024, height: 576 },
				{ type: "720p", width: 1280, height: 720 },
				{ type: "1080p", width: 1920, height: 1080 },
			];
			if (this.data.source == "bluray") {
				for (var x of specs) {
					if (this.data.res == x.type) {
						if (wd > x.width) this.err("video", "resWidthOver", x);
						if (ht > x.height) this.err("video", "resHeightOver", x);
						if (wd < x.width && ht < x.height && x.type != "1080p") this.err("video", "resNeitherEqual", x);
					}
				}
			}
		}

		checkFramerate() {
			var skip = this.checkSkip();
			if (skip) return false;
			if (this.data.fps == 29.97) this.err("video", "dupeFrames");
			else if (
				this.data.fps != 25 &&
				this.data.fps != 24 &&
				this.data.fps != 23.976 &&
				this.data.frm.search(/constant/i) >= 0
			) {
				this.err("video", "fpsUnusual");
			}
		}

		checkBitrate() {
			var skip = this.checkSkip();
			if (skip) return false;
			var min, max;
			var bitrate = this.data.bitrate;
			var insert, buttins;
			if (!bitrate) {
				this.err("video", "bitrateMissing");
				return true;
			}

			var specs = [
				{ t: "576p", min: 2000, max: 4000 },
				{ t: "720p", min: 5000, max: 7000 },
				{ t: "1080p", min: 8000, max: 12000 },
			];
			if (this.data.source == "dvd" || this.data.source == "vhs" || this.data.res == "480p") {
				min = 1500;
				max = 2500;
			} else {
				for (let x of specs) {
					if (this.data.res == x.t) {
						min = x.min;
						max = x.max;
					}
				}
			}
			var text = commaSeparateNumber(min) + " Kbps - " + commaSeparateNumber(max) + " Kbps";

			var buffer = (20 / 100) * bitrate;
			var smbuffer = (5 / 100) * bitrate;
			var sendObj = { bitrate: commaSeparateNumber(bitrate), text };

			if (bitrate < min && bitrate > min - smbuffer) this.err("video", "bitrateUnderSlightly", sendObj);
			else if (bitrate < min && bitrate > min - buffer) this.err("video", "bitrateUnder", sendObj);
			else if (bitrate < min - buffer) this.err("video", "bitrateUnderSeverely", sendObj);
			else if (bitrate > max && bitrate < max + smbuffer) this.err("video", "bitrateOverSlightly", sendObj);
			else if (bitrate > max && bitrate < max + buffer) this.err("video", "bitrateOver", sendObj);
			else if (bitrate > max + buffer) this.err("video", "bitrateOverSeverely", sendObj);
		}

		sortAudioTracks() {
			var skip = this.checkSkip();
			if (skip) return false;
			var audio = { main: [], secondary: [], score: [] };
			for (var x of this.data.audio) {
				if (this.data.audio.length === 1) x.text = "Main audio track";
				else if (!x.title && x.default && !x.lang) x.text = "Main audio track";
				else if (x.title) x.text = `Audio track '${x.title}'`;
				else if (x.lang) x.text = `Audio track '${x.lang}'`;
				else x.text = `Audio track 'ID: ${x.id}'`;

				if (x.duration < this.data.duration - 2 || x.duration > this.data.duration + 2)
					this.err("audio", "audioLengthMismatch", {
						duration: x.duration,
						label: x.text,
					});
				if (!x.lang && x.title.search(/(score|isolated)/i) < 0) this.err("audio", "noLanguageTag", x.text);
				if (x.bits > 16) this.err("audio", "bitDepthHigh", { text: x.text, bits: x.bits });
				if (x.sample > 48)
					this.err("audio", "sampleRateHigh", {
						text: x.text,
						sample: x.sample.toFixed(1),
					});
				if (x.format.search(/dts/i) >= 0 && x.comp.search(/lossless/i) >= 0)
					this.err("audio", "dtsHDMA", x.text);
				if (x.format.search(/pcm/i) >= 0) this.err("audio", "lpcmAudio", x.text);
				if (x.title.search(/comment/i) >= 0) audio.secondary.push(x);
				else if (x.title.search(/(score|isolated)/i) >= 0) audio.score.push(x);
				else if (!x.default && x.bitrate <= 100) audio.secondary.push(x);
				else audio.main.push(x);
			}
			this.data.audio = audio;
		}

		checkAudioBitrate(input) {
			// check if bitrate is detectable... if not return an error
			if (!input.bitrate) {
				this.err("audio", "missingBitrate", decapFirst(input.text));
				return true;
			}

			if (input.default) {
				var match,
					codecs = ["aac", "dts", "flac", "pcm"],
					d = false;
				for (let x of codecs) {
					let reg = new RegExp(x, "i");
					if (this.data.filename.search(reg) >= 0 && input.format.search(reg) < 0) {
						this.err("filename", "codecMismatch", {
							filenameCodec: x.toUpperCase(),
							codec: input.fullFormat,
						});
						d = true;
					}
				}

				try {
					match = input.format.match(/aac|dts|flac|pcm/i);
					if (match && match.length > 0) {
						let reg = new RegExp(match[0], "i");
						if (this.data.filename.search(reg) < 0 && !d)
							this.err("filename", "codecNotIncluded", match[0].toUpperCase());
					}
				} catch (e) {
					console.log(e);
				}
			}

			if (this.data.source == "dvd" && input.format.search(/aac/i) >= 0) this.err("audio", "aacDVD");
			else if (input.format.search(/mpeg/i) >= 0) this.err("audio", "mpegAudio", input.text);
			else if (this.data.source == "bluray" && input.channels <= 2 && input.format.search(/ac3/i) >= 0)
				this.err("audio", "ac3Stereo", input.text);
			else if (this.data.source == "bluray" && input.channels > 2 && input.format.search(/aac/i) >= 0)
				this.err("audio", "aacSurround", input.text);

			// Bitrate check for AC3 audio
			if (input.format.search(/ac3/i) >= 0 && this.data.source == "bluray" && input.channels >= 4) {
				var spec = 0;
				if (this.data.res == "480p" || this.data.res == "576p") spec = 448;
				else if (this.data.res == "720p" || this.data.res == "1080p") spec = 640;

				if (input.bitrate < spec || input.bitrate > spec)
					this.err("audio", "ac3Bitrate", {
						text: input.text,
						actual: input.bitrate,
						spec,
					});
			}
		}

		checkMainAudio() {
			var skip = this.checkSkip();
			if (skip) return false;
			var audio = this.data.audio;
			this.data.subtitles.map((x) => {
				if (x.forced)
					this.err("subtitles", "forcedYes", {
						lang: x.lang,
						title: x.title,
						id: x.id,
					});
				if (!x.lang) this.err("subtitles", "noLanguageTag", { title: x.title, id: x.id });
				if (
					x.title.search(/forced/i) >= 0 ||
					x.title.replace(/[^a-zA-Z]/, "").search(/nonenglishscene/i) >= 0
				) {
					if (x.default === false)
						this.err("subtitles", "forcedFlagNotDefault", {
							lang: x.lang,
							title: x.title,
							id: x.id,
						});
				}
			});

			switch (true) {
				case audio.main.length === 0:
					this.err("audio", "noAudio");
					break;
				case audio.main.length === 1:
					let m = audio.main[0];
					if (m.title.search(/(stereo|mono|surround)/i) >= 0) this.err("audio", "mainTitle", m.title);
					// Section for single audio, English language films
					if (m.lang.search(/english/i) >= 0) {
						this.data.subtitles.map((x) => {
							if (x.default && x.title.search(/non(.*?)eng|forced/i) < 0)
								this.err("subtitles", "defaultYes", {
									lang: x.lang,
									title: x.title,
									id: x.id,
								});
							if (x.title.search(/forced/i) >= 0 && x.lang.search(/english/i) >= 0)
								this.err("subtitles", "nameForced", x.title);
						});
					}
					// Section for single audio films with no linguistic content
					else if (m.lang.search(/zxx/i) >= 0) {
						this.data.subtitles.map((x) => {
							if (x.default && x.title.search(/screen/i) < 0)
								this.err("subtitles", "noLinguisticLabelling");
						});
					}
					// Section for single audio, non-English language films
					else {
						var english = false,
							def = false;
						this.data.subtitles.map((x) => {
							if (x.default && x.lang.search(/english/i) < 0)
								this.err("subtitles", "nonEngDefault", x.lang);
							else if (x.default && x.lang.search(/english/i) >= 0) {
								english = true;
								def = true;
							} else if (!x.default && x.lang.search(/english/i) >= 0) english = true;
						});
						if (!def && english) this.err("subtitles", "engDefault");
						else if (!english && m.lang) this.err("subtitles", "noEngSubs");
					}
					this.checkAudioBitrate(m);
					break;
				case audio.main.length > 2:
					this.err("audio", "multipleAudio");
				// No break here, needs to filter through to next condition for 2+ audio tracks
				default:
					var langs = [],
						defSub = false,
						engsub = false,
						dualAudio = false;
					audio.main.map((x) => {
						langs.push(x.lang);
					});
					var engTracks = this.arrayCount(langs, "english");
					if (langs.length > engTracks) dualAudio = true;
					if (engTracks > 1) this.err("audio", "dupeEnglish", engTracks);

					audio.main.map((x) => {
						this.checkAudioBitrate(x);
						if (x.default && x.lang && x.lang.search(/english/i) >= 0 && dualAudio)
							this.err("audio", "engDefault");
						if (x.lang.search(/english/i) >= 0 && x.title.search(/dub/i) < 0 && dualAudio)
							this.err("audio", "engDubName");
						if (
							x.lang.search(/english/i) < 0 &&
							x.default &&
							x.title.search(/(stereo|mono|surround)/i) >= 0
						)
							this.err("audio", "titleBlank", x.title);
					});

					for (let i = 0; i < this.data.subtitles.length; i++) {
						if (this.data.subtitles[i].default) defSub = true;
						if (this.data.subtitles[i].lang.search(/English/i) >= 0) engsub = true;
						if (
							this.data.subtitles[i].default &&
							this.data.subtitles[i].lang &&
							this.data.subtitles[i].lang.search(/English/i) < 0
						) {
							this.err("subtitles", "nonEngDefault", this.data.subtitles[i].lang);
						}
					}
					if (!engsub && dualAudio) this.err("subtitles", "noEngSubs");
					else if (!defSub && dualAudio) this.err("subtitles", "noDefault");
					break;
			}
		}

		checkSecondaryAudio() {
			var skip = this.checkSkip();
			if (skip) return false;
			var audio = this.data.audio,
				temp;
			for (var s of audio.secondary) {
				var tg = audio.secondary.length > 1 ? "commentary track (ID: " + s.id + ")" : "commentary track";
				if (!s.title) {
					tg = "secondary audio track (ID: " + s.id + ")";
					this.err("audio", "noTrackName", tg);
				}
				if (s.format.search(/aac/i) < 0) this.err("audio", "aacCommentary", tg);
				if (s.bitrate >= 100) this.err("audio", "highCommentary", tg);
				if (s.title.search(/comment/i) < 0) this.err("audio", "useCommentary", tg);
				temp = s.title.replace(/[^0-9a-zA-z]/g, "").toLowerCase();
				if (temp == "commentary" || temp == "audiocommentary") this.err("audio", "noParticipants", tg);
				else if (temp.search(/audiocommentary/i) >= 0) this.err("audio", "usedAudioCommentary", tg);
				if (s.default) this.err("audio", "defaultCommentary", tg);
			}
		}

		checkChapters() {
			var skip = this.checkSkip();
			if (skip) return false;
			for (let i = 0; i < this.data.chapters.length; i++) {
				var tg = this.data.chapters.length > 1 ? "(chapter set #" + [i + 1] + ")" : "";
				var tc = 0,
					bk = 0;
				var cSet = this.data.chapters[i];
				cSet.map((x) => {
					if (x.time && x.title.search(/[a-zA-Z]/g) < 0 && x.title.search(/[0-9]/g) >= 0) tc++;
					else if (x.time.search(/\d{2}:\d{2}/i) >= 0 && x.title.search(/[a-zA-Z0-9]/g) < 0) bk++;
				});

				if (tc == cSet.length) this.err("chapters", "chapterTimecodes", tg);
				else if (bk == cSet.length) this.err("chapters", "noTitles", tg);
				else if (bk > 0) this.err("chapters", "missingTitles", tg);
			}
		}
	}

	class SelectMultiple {
		constructor(element) {
			this.active = false;
			this.selected = [];
			this.node = document.querySelector(element);
			this.default = this.node.querySelector("span");
			this.defaultMessage = this.default.innerHTML;
			let optNode = document.createElement("div");
			optNode.className = "options";
			this.select = this.node.appendChild(optNode);
			this.createSelections();
			this.listeners();
		}

		listeners() {
			let boundClick = this.clickHandler.bind(this);
			this.node.addEventListener("click", boundClick);
		}

		clickHandler(ev) {
			if (this.active === false) {
				this.node.classList.add("focussed");
				this.active = true;
				this.outsideClick = this.outside.bind(this);
				document.addEventListener("click", this.outsideClick);
			} else {
				this.updateSelection(ev);
			}
		}

		outside(ev) {
			if (!ev.target.closest(".select-multiple")) {
				this.node.classList.remove("focussed");
				this.active = false;
				document.removeEventListener("click", this.outsideClick);
			}
		}

		createSelections() {
			let list = this.node.querySelectorAll("li");
			let count = 1;
			for (let item of list) {
				let div = document.createElement("div");
				div.innerHTML = item.innerHTML;
				div.setAttribute("data-id", count);
				div.setAttribute("data-value", item.getAttribute("data-value"));
				this.select.appendChild(div);
				count++;
			}
		}

		updateSelection(ev) {
			let target = ev.target.getAttribute("data-id");
			this.select.querySelector(`div[data-id="${target}"]`).classList.toggle("selected");
			if (this.selected.includes(target)) {
				this.selected = this.selected.filter((x) => x != target);
			} else this.selected.push(target);
			if (this.selected.length === 0) this.default.innerHTML = this.defaultMessage;
			else if (this.selected.length === 1)
				this.default.innerHTML =
					this.select.querySelector(`div[data-id="${this.selected[0]}"]`).innerHTML + " selected";
			else this.default.innerHTML = `${this.selected.length} resolutions selected`;

			this.chosen = this.selected.map((x) =>
				this.select.querySelector(`div[data-id="${x}"]`).getAttribute("data-value")
			);
			for (let option of this.select.querySelectorAll("div")) {
				let id = option.getAttribute("data-id");
				let idx = this.selected.indexOf(id);
				if (idx >= 0) {
					option.setAttribute("data-order", idx + 1);
				} else option.setAttribute("data-order", "");
			}
		}
	}

	class Progress {
		constructor() {
			this.outer = document.querySelector(".services-text");
			this.container = document.querySelector(".menu-progress");
			if (css.type == "light") this.container.classList.add("light");
			this.inner = this.container.querySelector("span");
			this.reset = this.reset.bind(this);
			this.show();
		}

		set load(newload) {
			this._load = newload;
			this.output = Math.round(this._load * this.percent);
			this.inner.style.width = this.output + "%";
			if (this.output >= 100) {
				this.complete();
			}
		}

		complete() {
			this.outer.classList.add("show-services-text");
			this.container.classList.remove("show-progress");
			this.container.addEventListener("transitionend", this.reset);
		}

		reset(ev) {
			if (ev.propertyName !== "opacity") return false;
			this.inner.style.width = "0%";
			this.container.removeEventListener("transitionend", this.reset);
		}

		init(pages, load = 0) {
			this._load = load;
			this.pages = pages;
			this.percent = 100 / pages;
			this.output = Math.round(this._load * this.percent);
			this.inner.style.width = this.output + "%";
		}

		show() {
			this.inner.style.width = "0%";
			this.container.classList.add("show-progress");
			this.container.classList.add("show-services-text");
		}
	}

	class Chart {
		constructor({ scale, data, unit, axes = { x: "", y: "" }, options = {}, controls, cb } = {}) {
			this.injectStyle();
			this.timer;
			this.callback = cb;
			this.offset = 0;
			this._scale = scale;
			this._data = data;
			this._unit = unit;
			this.yaxis = this.createScale();
			this.elements();
			this.setOptions(options);
			this.drawScale();
			this.drawData();
			this.insert();
			this.tabulate();
			this.y.innerHTML = axes.y;
			this.x.innerHTML = axes.x;
			this.controls();
		}

		showControls(show = false) {
			if (show) {
				this.el.controls.left.classList.add("show-controls");
				this.el.controls.right.classList.add("show-controls");
			} else {
				this.el.controls.left.classList.remove("show-controls");
				this.el.controls.right.classList.remove("show-controls");
			}
		}

		controls() {
			this.el.controls.left.addEventListener("click", () => {
				this.offset++;
				this.callback(this.offset);
			});
			this.el.controls.right.addEventListener("click", () => {
				this.offset--;
				if (this.offset < 0) this.offset = 0;
				this.callback(this.offset);
			});
		}

		elements() {
			this.el = {};
			this.el.container = document.querySelector(".HJM-chart");
			this.el.container.innerHTML = "";
			this.el.controls = {};
			this.el.controls.left = document.createElement("div");
			this.el.controls.left.className = "triangle-left HJM-chart-controls";
			this.el.controls.right = document.createElement("div");
			this.el.controls.right.className = "triangle-right HJM-chart-controls";
			this.el.yscale = document.createElement("ul");
			this.el.yscale.className = "HJM-numbers";
			this.el.data = document.createElement("ul");
			this.el.data.className = "HJM-data";
			this.el.ylabelouter = document.createElement("div");
			this.el.ylabelouter.className = "HJM-y-label";
			this.y = this.el.ylabelouter.appendChild(document.createElement("div"));
			this.el.xlabelouter = document.createElement("div");
			this.el.xlabelouter.className = "HJM-x-label";
			this.x = this.el.xlabelouter.appendChild(document.createElement("div"));
		}

		insert() {
			this.el.container.appendChild(this.el.controls.left);
			this.el.container.appendChild(this.el.controls.right);
			this.el.container.appendChild(this.el.ylabelouter);
			this.el.container.appendChild(this.el.xlabelouter);
			this.el.container.appendChild(this.el.yscale);
			this.el.container.appendChild(this.el.data);
		}

		setOptions(options) {
			if (options.textColour) this.el.container.style.color = options.textColour;
			if (options.height) this.el.container.style.height = options.height;
			if (options.width) this.el.container.style.width = options.width;
			if (options.fontSize) this.el.container.style.fontSize = options.fontSize;
			if (options.grid) this.el.yscale.classList.add("show-grid");
			if (options.gridColour)
				this.injectRule(".HJM-chart .HJM-numbers li", "border-bottom-color: " + options.gridColour);
			if (options.background) this.el.data.style.background = options.background;
			this.el.container.style.fontFamily = options.font ? options.font : "Roboto";
			if (options.textShadow) this.el.container.style.textShadow = options.textShadow;
			this.el.container.style.fontSize = options.fontSize ? options.fontSize : "1rem";
		}

		createScale() {
			let arr = [];
			let start = this._scale.start;
			let int = this._scale.interval;
			let max = this._scale.max;
			for (let i = max; i >= start; i -= int) {
				arr.push(i);
			}
			return arr;
		}

		set axes(newaxes) {
			let writeBound = write.bind(this);
			this.el.ylabelouter.addEventListener("transitionend", writeBound);
			this.el.ylabelouter.style.opacity = 0;
			this.el.xlabelouter.style.opacity = 0;

			function write() {
				this.x.innerHTML = newaxes.x;
				this.y.innerHTML = newaxes.y;
				this.el.ylabelouter.removeEventListener("transitionend", writeBound);
				this.el.ylabelouter.style.opacity = 1;
				this.el.xlabelouter.style.opacity = 1;
			}
		}

		set labels(newlabels) {
			let els = this.el.data.querySelectorAll("li");
			for (let i = 0; i < newlabels.length || i < 10; i++) {
				if (newlabels[i]) {
					if (!this._data[i]) this._data[i] = {};
					this._data[i].label = newlabels[i];
					els[i].querySelector("span").innerHTML = newlabels[i];
					els[i].classList.remove("hide");
				} else {
					els[i].classList.add("hide");
				}
			}
		}

		set unit(newunit) {
			this._unit = newunit;
			document.querySelectorAll("[data-unit]").forEach((x) => {
				let u = newunit;
				if (x.getAttribute("data-value") == 1) u = u.replace(/s$/, "");
				x.setAttribute("data-unit", u);
			});
		}

		set data(newline) {
			clearTimeout(this.timer);
			if (newline.constructor !== Array) newline = [newline];
			for (let i = 0; i < newline.length; i++) {
				let idx = newline[i].id - 1;
				if (!this._data[idx]) this._data[idx] = {};
				let el = this.el.data.querySelectorAll("li .bar")[idx];
				if (newline[i].hide === true) el.parentElement.classList.add("hide");
				else if (newline[i].hide === false) el.parentElement.classList.remove("hide");
				if (newline[i].value || newline[i].value === 0) {
					this._data[idx].value = newline[i].value;
					el.setAttribute("data-value", newline[i].value);
					el.setAttribute("data-percentage", this.getPercent(newline[i].value));
				}
				if (newline[i].colour) el.setAttribute("data-colour", newline[i].colour || "");
			}
			this.timer = setTimeout(() => {
				this.tabulate();
			}, 500);
		}

		set scale(newscale) {
			this._scale = newscale;
			this.yaxis = this.createScale();
			this.el.yscale.innerHTML = "";
			this.drawScale();
		}

		drawScale() {
			for (let i = 0; i < this.yaxis.length; i++) {
				let li = document.createElement("li");
				li.innerHTML = `<span>${this.yaxis[i]}</span>`;
				this.el.yscale.appendChild(li);
			}
		}

		drawData() {
			for (let i = 0; i < this._data.length || i < 10; i++) {
				let li = document.createElement("li");
				if (this._data[i]) {
					let unit = this._data[i].value == 1 ? this._unit.replace(/s$/, "") : this._unit;
					let y = this.getPercent(this._data[i].value);
					li.innerHTML = `<div data-value="${
						this._data[i].value
					}" data-percentage="${y}" class="bar" data-unit="${unit}" data-colour="${
						this._data[i].colour || ""
					}"></div><span>${this._data[i].label}</span>`;
				} else {
					li.classList.add("hide");
					li.innerHTML = `<div data-value="" data-percentage="" class="bar" data-unit="" data-colour=""></div><span></span>`;
				}

				this.el.data.appendChild(li);
			}
		}

		tabulate() {
			this.el.data.querySelectorAll("li .bar").forEach(function (x) {
				let percentage = Math.round(x.getAttribute("data-percentage"));
				let colour = x.getAttribute("data-colour");
				x.style.background = colour ? colour : "";
				let diff = Math.round(($(x).height() / $(x).parent().height()) * 100);
				if (diff === percentage) return true;
				$(x)
					.stop(true)
					.animate(
						{
							height: percentage + "%",
						},
						1000,
						"linear"
					);
			});
		}

		getPercent(x) {
			return (x - this._scale.start) * (100 / (this._scale.max - this._scale.start));
		}

		injectRule(selector, rule) {
			let ss = document.styleSheets;
			let sheet;
			for (let s of ss) {
				if (s.title === "HJM-barChart") sheet = s;
			}
			rule = selector + "{" + rule + "}";
			if (sheet) sheet.insertRule(rule, 0);
		}

		injectStyle() {
			let ss = document.styleSheets,
				found = false;
			for (let s of ss) {
				if (s.title === "HJM-barChart") found = true;
			}
			if (found) return false;

			let cssInject = `
.HJM-chart {
  position: relative;
  width: 500px;
  height: 350px;
  margin: 30px auto 0;
  display: flex;
  flex-flow: row;
  font-size: 1rem;
  color: white;
  margin-bottom: 6rem;
}

.HJM-chart-controls {
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease-in-out;
}

.HJM-chart-controls.show-controls {
    opacity: 1;
    pointer-events: all;
    cursor: pointer;
}

.triangle-left, .triangle-right {
    position: absolute;
    bottom: -6rem;
    width: 0;
    height: 0;
    border-top: 25px solid transparent;
    border-bottom: 25px solid transparent;
}

.triangle-left {
    left: 0;
    border-right: 30px solid #555;
}

.triangle-left:hover {
    border-right: 30px solid #777;
}

.triangle-right:hover {
    border-left: 30px solid #777;
}

.triangle-right {
    right: 0;
    border-left: 30px solid #555;
}

.HJM-y-label {
    position: absolute;
    height: 100%;
    width: 2em;
    left: -2em;
}

.HJM-y-label > div {
    position: absolute;
    top: 50%;
    left: 50%;
    white-space: nowrap;
    -webkit-transform: translateX(-50%) translateY(-50%) rotate(-90deg);
    transform: translateX(-50%) translateY(-50%) rotate(-90deg);
}

.HJM-x-label {
    width: 100%;
    position: absolute;
    bottom: -4rem;
    text-align: center;
}

.HJM-x-label, .HJM-y-label {
    transition: opacity 300ms ease-in-out;
}

.HJM-chart .HJM-numbers {
  width: 50px;
  height: calc(100% + 29px);
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  margin-top: -29px;
}

.HJM-chart .HJM-numbers li {
  text-align: center;
  list-style: none;
  height: 29px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #444;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.HJM-chart .HJM-numbers.show-grid li::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 20px;
    left: 0;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: inherit;
    transform: translateY(1px);
}

.HJM-chart .HJM-numbers li:last-child {
  height: 30px;
}

.HJM-chart .HJM-data {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  box-shadow: 0 0 0 1px #444;
  flex-flow: row;
  justify-content: space-around;
}

.HJM-chart .HJM-data li.hide {
    max-width: 0;
    opacity: 0;
}

.HJM-chart .HJM-data li {
  height: 100%;
  position: relative;
  flex-grow: 1;
  transition: all 200ms ease-in-out;
  max-width: 150px;
  display: flex;
  justify-content: center;
}

.HJM-chart .HJM-data li .bar {
  display: block;
  width: 80%;
  background: steelblue;
  position: absolute;
  bottom: 0;
  transition: height 1000ms ease-in-out, background 500ms ease-in, filter 200ms ease-in-out;
}

.HJM-chart .HJM-data li .bar:hover {
  filter: brightness(1.2);
  cursor: pointer;
}

.HJM-chart .HJM-data li .bar:hover::before {
  content: attr(data-value) attr(data-unit);
  position: absolute;
  bottom: calc(100% + 5px);
  text-align: center;
  font-size: 0.85em;
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
}

.HJM-chart .HJM-data li span {
  width: 100%;
  position: absolute;
  bottom: -2em;
  left: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;
			let styleSheet = document.createElement("style");
			styleSheet.type = "text/css";
			styleSheet.title = "HJM-barChart";
			styleSheet.innerText = cssInject
				.replace(/\n/g, "")
				.replace(/\s{2,}/g, " ")
				.replace(/;\s*/g, ";");
			document.head.appendChild(styleSheet);
		}
	}

	class EncodingCentre {
		constructor(active, bench, max) {
			this.injected = false;
			this.fullscreen = false;
			this.active = active;
			this.syncing = false;
			this.bench = bench;
			this.max = max;
			this.mouse = false;
			this.scrollDistance = 10;
			this.template();
			this.style();
			this.elements();
			this.loadActive();
			this.loadBench();
			setTimeout(() => {
				this.scrolling();
				this.listeners();
			}, 0);
		}

		wheelScroll(ev) {
			ev.preventDefault();
			if (this.controls.container.classList.contains("disable-scrolling")) return false;
			if (ev.detail < 0 || ev.wheelDelta > 0 || ev.deltaY < 0) this.scrollUp();
			else this.scrollDown();
		}

		disableScrolling() {
			this.el.inner.style.marginTop = "0px";
			this.controls.container.classList.add("disable-scrolling");
		}

		recalculate(minus = 0) {
			this.boxHeight -= minus;
			this.dotInc = (this.scHeight / 100) * (100 / Math.floor(this.boxHeight / this.scrollDistance));
			if (this.boxHeight <= this.scrollDistance * 2) this.disableScrolling();
			else this.scrollUp();
			if (this.bench.length === 0) return this.zeroBench();
		}

		cancelOffer(ev) {
			let parent = ev.target.closest("tr");
			ev.target.disabled = true;
			let title = $(parent.firstChild).text();
			if (!confirm(`Are you sure you want to cancel your encode offer for ${title}?`))
				return (ev.target.disabled = false);
			else {
				this.active--;
				this.el.count.innerHTML = this.active;
				let id = parent.getAttribute("data-offerid");
				let options = { url: "/encodeoffers.php", method: "POST" };
				let formdata = new FormData();
				formdata.append("AntiCsrfToken", AntiCsrfToken);
				formdata.append("Id", id);
				formdata.append("action", "delete");
				options.data = formdata;

				ajax(options).then((res) => {
					$(parent).fadeTo("slow", "0.01", () =>
						$(parent).slideUp("fast", () => {
							$(parent).remove();
							if (activeCount <= 0)
								this.el.current.innerHTML = `<div style='text-align:center;padding:5px 0px;font-size:0.7rem;color:orange;font-weight:bold;'><em>You have no active encodes</em></div>`;
						})
					);
					cache.update_encodeHistory();
				});
			}
		}

		scrolling() {
			this.view = $(this.el.scrollbox).height() - this.scrollDistance * 2;
			let comp = getComputedStyle(this.controls.bar);
			this.scHeight = $(this.controls.bar).height() - this.scrollDistance;
			this.boxHeight =
				$("#encoding-centre-current").height() +
				$("#encoding-centre-bench").height() +
				$("#encoding-centre-actions").height() -
				this.view;
			this.dotPosition = 0;
			this.scrollPosition = 0;
			this.dotInc = (this.scHeight / 100) * (100 / Math.floor(this.boxHeight / this.scrollDistance));
			this.scrollInc = this.scrollDistance;
			if (this.boxHeight <= 0) this.disableScrolling();
		}

		scrollDown(ev) {
			let full = false;
			this.scrollPosition += this.scrollInc;
			if (this.scrollPosition > this.boxHeight - this.scrollInc / 2) {
				this.scrollPosition = this.boxHeight;
				full = true;
			} else if (this.scrollPosition > this.boxHeight) this.scrollPosition = this.boxHeight;
			this.el.inner.style.marginTop = "-" + this.scrollPosition + "px";

			this.dotPosition += this.dotInc;
			if (this.dotPosition > this.scHeight || full) this.dotPosition = this.scHeight;
			this.controls.dot.style.marginTop = this.dotPosition + "px";
		}

		scrollHold(ev, action) {
			if (ev.type === "mousedown") {
				let interval = 150;
				let cb = action === "up" ? this.scrollUp.bind(this) : this.scrollDown.bind(this);
				cb();
				this.mouse = setInterval(cb, interval);
			} else {
				clearInterval(this.mouse);
				this.mouse = false;
			}
		}

		scrollUp() {
			let full = false;
			this.scrollPosition -= this.scrollInc;
			if (this.scrollPosition < 0) this.scrollPosition = 0;
			else if (this.scrollPosition < this.scrollInc / 2) {
				this.scrollPosition = 0;
				full = true;
			}
			this.el.inner.style.marginTop = "-" + this.scrollPosition + "px";

			this.dotPosition -= this.dotInc;
			if (this.dotPosition < 0 || full) this.dotPosition = 0;
			this.controls.dot.style.marginTop = this.dotPosition + "px";
		}

		elements() {
			this.el = {};
			this.el.count = this.dom.querySelector("#encoding-centre-active-count");
			this.el.max = this.dom.querySelector("#encoding-centre-active-max");
			this.el.scrollbox = this.dom.querySelector(".ec-scrollbox");
			this.el.inner = this.dom.querySelector(".ec-scrollbox-inner");
			this.el.current = this.dom.querySelector("#encoding-centre-current");
			this.el.bench = this.dom.querySelector("#encoding-centre-bench ul");
			this.el.actions = this.dom.querySelector("#encoding-centre-actions");
			this.el.resync = this.el.actions.querySelector("button");
			this.el.back = this.dom.querySelector("#ec-back-button");
			this.el.fullscreen = this.dom.querySelector(".fullscreen-icon-outer");
			this.controls = {
				up: this.dom.querySelector(".ec-up"),
				down: this.dom.querySelector(".ec-down"),
				bar: this.dom.querySelector(".ec-scrollbar"),
				dot: this.dom.querySelector(".ec-dot"),
				container: this.dom.querySelector("#encoding-centre-controls"),
			};
		}

		autoRenewChange() {
			let offerid = this.closest("tr").getAttribute("data-offerid");
			for (let x of cache.data.currentlyEncoding.active) {
				if (x.offerid == offerid) x.renew = !!this.checked;
			}
			cache.save("currentlyEncoding");
		}

		goFullscreen() {
			this.fullscreen = true;
			let title = `Encoding Bench`;
			let html = "<div id='HJM-fullscreen-bench'></div>";
			HJMModal.update({ mode: "fullscreen", title, body: html });
			this.el.fullscreenBench = document.querySelector("#HJM-fullscreen-bench");
			this.loadBench();
			this.fullscreen = false;
			this.loadBenchBound = this.loadBench.bind(this);
			document.querySelector(".HJM-modal-container").addEventListener("modalClosed", this.loadBenchBound);
		}

		listeners() {
			this.controls.up.addEventListener("mousedown", (ev) => this.scrollHold(ev, "up"));
			this.controls.down.addEventListener("mousedown", (ev) => this.scrollHold(ev, "down"));
			this.controls.up.addEventListener("mouseup", (ev) => this.scrollHold(ev, "up"));
			this.controls.down.addEventListener("mouseup", (ev) => this.scrollHold(ev, "down"));
			this.el.scrollbox.addEventListener("wheel", this.wheelScroll.bind(this));
			let checks = this.el.current.querySelectorAll("input[type=checkbox");
			for (let check of checks) {
				check.addEventListener("change", this.autoRenewChange);
			}
			let cancels = this.el.current.querySelectorAll("button.ec-cancel");
			let ups = this.el.current.querySelectorAll("button.ec-upload");
			for (let cancel of cancels) {
				cancel.addEventListener("click", this.cancelOffer.bind(this));
			}
			let attaches = this.el.current.querySelectorAll("button.ec-attach");
			for (let attach of attaches) {
				attach.addEventListener("click", this.modal.bind(this));
			}
			for (let up of ups) {
				up.addEventListener("click", this.uploadOffer.bind(this));
			}
			this.el.back.addEventListener("click", this.leaveCentre);
			this.el.fullscreen.addEventListener("click", this.goFullscreen.bind(this));
			this.el.resync.addEventListener("click", this.resync.bind(this));
		}

		resync() {
			if (this.syncing === true) return false;
			this.syncing = true;
			let spinner = this.el.actions.querySelector("i");
			this.el.resync.disabled = true;
			let stop = function () {
				spinner.classList.remove("spin-anticlockwise");
				spinner.removeEventListener("animationiteration", stop);
			};
			spinner.classList.add("spin-anticlockwise");
			cache.benchEncodes({ forceUpdate: true }).then(() => {
				this.active = cache.data.currentlyEncoding.active;
				this.bench = cache.data.currentlyEncoding.bench;
				this.el.count.innerHTML = this.active.length;
				this.loadActive();
				this.loadBench();
				setTimeout(() => {
					this.scrolling();
					this.recalculate();
					this.listeners();
				}, 0);
				spinner.addEventListener("animationiteration", stop);
				this.el.resync.disabled = false;
				this.syncing = false;
			});
		}

		uploadOffer(ev) {
			cache.load("attachments");
			let group = ev.target.getAttribute("data-groupid");
			let offer = ev.target.closest("tr").getAttribute("data-offerid");
			let attach = cache.data.attachments.filter((x) => x.offerid == offer);
			if (attach.length > 0) cache.data.attach = attach[0];
			else cache.data.attach = {};
			cache.data.attach.groupid = group;
			cache.save("attach");
			window.location.href = "/upload.php?groupid=" + group;
		}

		leaveCentre() {
			UIlock = false;
			$("#UI-padlock-icon").hide();
			$(".HJMcontainer").css("margin-left", "0px");
			$(".HJMcontainer2").css("margin-left", barWidth + "px");
		}

		zeroActive() {
			this.el.current.innerHTML = `<table><thead><tr><th>&nbsp;</th></tr></thead><tbody><tr><td style="text-align: center; font-style: italic; font-size: 0.9rem; padding: 0.4em;">You currently have no active encodes</td></tr></tbody></table>`;
		}

		loadActive() {
			if (this.active.length === 0) return this.zeroActive();
			this.sortActive();
			let html = `<table><thead><tr><th>Title</th><th>Resolution</th><th>Time Started</th><th>Auto-Renew</th><th> </th></tr></thead><tbody>`;
			for (let i = 0; i < this.active.length; i++) {
				let group = this.active[i].link.match(/(?:id=)(\d{1,})/)[1];
				html += `<tr data-offerid="${this.active[i].offerid}"><td><a href="${
					this.active[i].link
				}" target="_blank">${truncate(this.active[i].title, 30)} [${this.active[i].year}]</a></td>
                        <td>${this.active[i].res}</td>
                        <td>${relativeDate(this.active[i].time, true)}</td>
                        <td style="text-align: center;"><input type="checkbox" ${
							this.active[i].renew ? "checked" : ""
						}></td>
                        <td>
                            <div class="button-group">
                                <button class="ec-cancel">cancel</button>
                                <button class="ec-attach">attach</button>
                                <button class="ec-upload" data-groupid="${group}">upload</button>
                            </td></tr>`;
			}
			html += "</table>";
			this.el.current.innerHTML = html;
		}

		sortActive() {
			this.active.sort(function (a, b) {
				var aTime = new Date(a.time).getTime();
				var bTime = new Date(b.time).getTime();
				return aTime - bTime;
			});
		}

		deleteBenchItem(ev) {
			let tg = ev.target.closest("li");
			$(tg).fadeTo("slow", "0.01", () => {
				$(tg).slideUp("fast", () => {
					$(tg).remove();
					this.updateBench();
					this.recalculate(18);
				});
			});
		}

		zeroBench() {
			let container = this.fullscreen ? this.el.fullscreenBench : this.el.bench;
			container.innerHTML = `<div style="text-align: center;grid-column-start:1;grid-column-end: span 2;font-size: 0.9rem;"><span style="text-align:center;font-style: italic;">You currently have no benched encodes</span><p style="text-align:center;font-size: 0.7rem;">Hold Shift and click on a torrent link to add encodes to the bench</p></div>`;
		}

		loadBench(ev) {
			if (ev && ev.type == "modalClosed") {
				this.bench = cache.data.currentlyEncoding.bench;
				document.querySelector(".HJM-modal-container").removeEventListener("modalClosed", this.loadBenchBound);
			}
			let container = this.fullscreen ? this.el.fullscreenBench : this.el.bench;
			if (this.bench.length === 0) return this.zeroBench();
			let bench = "";
			for (let x of this.bench) {
				bench += `<li draggable="true" class="ec-bench-list-item" data-id="${x.id}" data-title="${
					x.title
				}" data-year="${x.year}" data-res="${x.res}" data-comment="${x.comment}">${truncate(x.title, 50)} ${
					x.year
				} @ ${x.res} <span class="close-bench-item" title="Remove item from bench">x</span></li>`;
			}
			container.innerHTML = bench;
			let items = container.querySelectorAll(".ec-bench-list-item");
			let drag = new dragIt();
			for (let i of items) {
				i.addEventListener("dragstart", drag.dragStart);
				i.addEventListener("dragover", drag.dragOver);
				let boundUpdate = this.updateBench.bind(container);
				i.addEventListener("dragend", () => drag.dragEnd(boundUpdate));
				i.querySelector(".close-bench-item").addEventListener("click", this.deleteBenchItem.bind(this));
			}

			function dragIt() {
				this.el;

				this.dragStart = (e) => {
					e.dataTransfer.effectAllowed = "move";
					e.dataTransfer.setData("text/plain", null);
					this.el = e.target;
				};

				this.dragOver = (e) => {
					if (this.isBefore(this.el, e.target)) e.target.parentNode.insertBefore(this.el, e.target);
					else e.target.parentNode.insertBefore(this.el, e.target.nextSibling);
				};

				this.dragEnd = (cb) => {
					this.el = null;
					cb();
				};

				this.isBefore = function (el1, el2) {
					if (el2.parentNode === el1.parentNode) {
						for (var cur = el1.previousSibling; cur; cur = cur.previousSibling) {
							if (cur === el2) return true;
						}
					}
					return false;
				};
			}
		}

		updateBench() {
			var array = [];
			$(this)
				.find("li")
				.each(function () {
					var data = {};
					data.id = $(this).attr("data-id");
					data.title = $(this).attr("data-title");
					data.year = $(this).attr("data-year");
					data.res = $(this).attr("data-res");
					data.comment = $(this).attr("data-comment");
					array.push(data);
				});
			cache.data.currentlyEncoding.bench = array;
			cache.save("currentlyEncoding");
		}

		template() {
			let outer = document.createElement("div");
			outer.id = "HJM-encoding-centre-container";
			outer.innerHTML = `<div id="ec-back-button" class="back-button" title="Return to Menu">&laquo;</div>
                            <div class="fullscreen-icon-outer" title="Switch to Bench Fullscreen View" style="position: absolute; top: 2rem;"><div></div></div>
                            <div id="active-encodes">
                                <h1>Encoding Centre: <span id="encoding-centre-active-count">${this.active.length}</span> / <span id="encoding-centre-active-max">${this.max}</span> Active</h1>
                                <div class="ec-scrollbox">
                                    <div class="ec-scrollbox-inner">
                                        <div id="encoding-centre-current"><h3>

                                        </div>
                                        <div id="encoding-centre-bench">
                                            <h3>The Bench</h3>
                                            <ul></ul>
                                        </div>
                                        <div id="encoding-centre-actions"><button><i class="icon-sync"></i> Sync Encoding Centre</button></div>
                                    </div>
                                </div>
                            </div>
                            <div id="encoding-centre-controls">
                                <div class="ec-up">&#8593</div>
                                <div class="ec-scrollbar"><div class="ec-dot"></div></div>
                                <div class="ec-down">&#8595;</div>
                            </div>
                        </div>`;
			this.dom = outer;
		}

		modal(ev) {
			cache.load("attachments");
			const defaultScanText = "Mediainfo log will be automatically scanned. Results will show here...";
			let offer = ev.target.closest("tr").getAttribute("data-offerid");
			let idx = cache.data.currentlyEncoding.active.findIndex((x) => x.offerid == offer);
			let data = cache.data.currentlyEncoding.active[idx];

			let atidx = cache.data.attachments.findIndex((x) => x.offerid == offer);
			let attach;
			if (atidx < 0) {
				atidx = cache.data.attachments.length;
				attach = {
					offerid: offer,
					comptitles: "Source, Encode",
					pl: "",
					comp: "",
					mediainfo: "",
					screens: "",
				};
			} else attach = cache.data.attachments[atidx];
			let title = `Encoding Offer Details for ${data.title} [${data.year}]`;
			let html = `<div id="encode-attachments">
        <form id="attach"><input type="hidden" name="offerid" value="${attach.offerid}"/>
        <input type="hidden" name="groupid" value="${data.groupid}"/>
        <input type="hidden" name="textres" value="${data.textres}"/>
        <table><tr><td>Resolution: </td><td>${data.res}</td></tr>
        <tr><td>Time Added: </td><td>${relativeDate(data.time)}</td></tr>
        <tr><td>Auto-Renew: </td><td>${data.renew ? "Yes" : "No"}</td></tr>`;
			if (data.comment) html += `<tr><td>Comment: </td><td>${data.comment}</td></tr></table>`;
			html += `<div class="form-group"><label for="pl">Source PL:</label> <input type="text" name="pl" class="form-control" placeholder="Permanent link for your source. Requires ##source## tag in saved template." value="${attach.pl}"></div>
        <div class="form-group"><label for="screens">Screenshots:</label> <textarea class="form-control" name="screens" placeholder="One per line. Requires ##screens## tag in your saved template">${attach.screens}</textarea></div>
        <div class="form-group"><label for="comptitles">Comparison Titles:</label> <input type="text" name="comptitles" value="${attach.comptitles}" class="form-control"></div>
        <div class="form-group"><label for="comp">Comparison Screens:</label> <textarea class="form-control" name="comp" placeholder="One per line. Replaces [comparison][/comparison] tag in your template">${attach.comp}</textarea></div>
        <div class="form-group">
            <label for="mediainfo">Mediainfo Log:</label>
            <div class="HJM-mediainfo-input-container">
                <textarea class="form-control HJM-mediainfo-input" id="mediainfo" name="mediainfo" placeholder="Paste your mediainfo log here (no BBCode tags). Replaces [mediainfo][/mediainfo] tag in your saved template">${attach.mediainfo}</textarea>
            </div>
        </div>
        </form>
        <div class="mi-scanner-results-bar fullX">${defaultScanText}</div>
        </div>`;
			HJMModal.autoHide = true;
			HJMModal.update({ mode: "fullscreen", title, body: html });
			setTimeout(() => {
				let el = document.querySelector("#encode-attachments");
				el.addEventListener("change", this.saveAttachments.bind(atidx));
			}, 0);
			let lastScannedLog = "";
			let callback = attachmentMediainfoResults;
			HJM_mediainfoListener(callback);
			if (attach.mediainfo !== "") attachmentMediainfoResults($("#mediainfo.HJM-mediainfo-input").val());

			function attachmentMediainfoResults(log) {
				if (!log) {
					$(".mi-scanner-results-bar").css("cursor", "initial").text(defaultScanText);
					lastScannedLog = "";
					mediainfoResultsStripe(undefined, false);
					return false;
				}
				if (lastScannedLog == log) return false;
				else lastScannedLog = log;
				saveStack("attachmentMediainfoResults");
				let mi = new MediainfoScanner(log);
				checkGuideDupes(mi.feedback);
				let results = mediainfoTallies(mi);
				let feedbackPage = mediainfoResultsBar({ results, mi });
				mediainfoResultsStripe(results, feedbackPage);
				const changeEvent = new Event("change", { bubbles: true });
				document.querySelector("#mediainfo").dispatchEvent(changeEvent);
			}
		}

		saveAttachments(ev) {
			ev.srcElement.value = ev.srcElement.value.trim();
			// active index is bound to 'this'
			let formdata = {};
			let el = ev.srcElement;
			let form = el.closest("form");
			$(form)
				.serializeArray()
				.map((x) => (formdata[x.name] = x.value));
			cache.data.attachments[this] = formdata;
			cache.save("attachments");
		}

		style() {
			const cssInject = `<style>#HJM-encoding-centre-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-flow: row;
            position: relative;
        }

        #encode-attachments {
            width: ${barWidth}px;
            margin: 0 auto;
        }

        #encode-attachments table {
            margin-bottom: 1rem;
        }

        #encode-attachments h3 {
            padding: 0.3rem 1rem;
            width: 100%;
            background: steelblue;
            white-space: nowrap;
        }

        #encode-attachments td:first-child {
            text-align: right;
        }

        #encode-attachments td:last-child {
            text-align: left;
        }

        #encode-attachments td {
            padding: 0.3rem 1rem;
        }

        i.icon-sync {
            height: 1.3rem;
            width: 1.3rem;
            background: url(https://ptpimg.me/96y566.png);
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            margin-right: 1rem;
            filter: invert(1);
        }

        #encoding-centre-actions button {
            margin: 0.5rem auto;
            padding: .5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
            user-select: none;
            border: 1px solid transparent;
            padding: .275rem .75rem;
            font-size: 0.9rem;
            line-height: 1.5;
            border-radius: .25rem;
            transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        }

        #encoding-centre-actions button:hover {
            color: #fff;
            background-color: #5a6268;
            border-color: #545b62;
        }

        #encoding-centre-actions button:active {
            color: #fff;
            background-color: #545b62;
            border-color: #4e555b;
        }

        thead th:nth-child(1), thead th:nth-child(4), thead th:nth-child(5), tbody td:nth-child(5) {
            text-align: center;
        }

        h1 {
            margin: 4px 0;
        }

        .button-group {
            display: flex;
            flex-flow: row;
            width: 100%;
            padding: 0.1rem 0;
        }

        .button-group button {
            margin: 0;
            padding: 0.1rem 0.2rem;
            font-size: 0.6rem;
            border-radius: 0;
            border: 1px solid ${css.border};
            cursor: pointer;
            outline: none;
            background: none;
            font-family: Lato, Helvetica Neue, Arial, Helvetica, sans-serif;
            user-select: none;
            font-weight: bold;
            transition: all 100ms ease-in-out;
            background: ${css.buttonBackground};
        }

        .button-group button:first-child {
            border-radius: 5px 0 0 5px;
            border-left: 1px solid ${css.border};
            border-top: 1px solid ${css.border};
            border-bottom: 1px solid ${css.border};
            border-right: 0;

        }

        .button-group button:last-child {
            border-radius: 0 5px 5px 0;
            border-right: 1px solid ${css.border};
            border-top: 1px solid ${css.border};
            border-bottom: 1px solid ${css.border};
            border-left: 0;
        }

        button.ec-cancel {
            color: #ff695e;
        }

        button.ec-attach {
            color: steelblue;
        }

        button.ec-upload {
            color: #21ba45;
        }

        button.ec-cancel:hover {
            background: #ff695e;
            color: #eee;
        }

        button.ec-attach:hover {
            background: steelblue;
            color: #eee;
        }

        button.ec-upload:hover {
            background: #21ba45;
            color: #eee;
        }

        #active-encodes {
            width: calc(100% - 1.4rem);
            height: 100%;
            padding-left: 2rem;
            display: flex;
            flex-flow: column;
        }

        #active-encodes ul {
            list-style-type: none;
            margin: 0;
            padding: 0;

        }

        #encoding-centre-current table {
            width: 100%;
            font-size: 0.6rem;
        }

        #encoding-centre-current thead tr, #encoding-centre-bench h3 {
            background: ${css.backgroundShade};
        }

        #encoding-centre-bench h3 {
            text-align: center;
            font-size: 0.7rem;
            margin: 0.2rem 0;
        }

        #encoding-centre-current th {
            padding: 0.1rem 0;
        }

        #encoding-centre-current td:nth-child(2) {
            padding-right: 0.2rem;
        }

        .ec-scrollbox {
            width: 100%;
            height: 100%;
            overflow-y: hidden;
            padding: 0 0.5rem;
        }

        .ec-scrollbox-inner {
            height: 100%;
            transition: margin-top 80ms ease-out;
        }

        #encoding-centre-controls {
            height: 100%;
            color: white;
            font-weight: bold;
            display: flex;
            flex-flow: column;
            justify-content: space-between;
            align-items: flex-end;
            transition: opacity 100ms ease-in-out;
        }

        #encoding-centre-controls.disable-scrolling {
            opacity: 0;
            pointer-events: none;
        }

        .ec-scrollbar {
            flex-grow: 2;
            width: 1.4rem;
            background: ${css.border};
            display: flex;
            justify-content: center;
            padding: 0.5rem 0;
            position: relative;
            overflow-y: hidden;
        }

        .ec-scrollbar::after {
            content: "";
            top: 0.25rem;
            left: 0.25rem;
            right: 0.25rem;
            bottom: 0.25rem;
            position: absolute;
            z-index: 1;
            background: ${css.gradient1};
            border-radius: 10px;
        }

        .ec-dot {
            z-index: 2;
            border-radius: 10px;
            width: 0.6rem;
            height: .5rem;
            background: ${css.text};
            transition: margin-top 80ms ease-out;
        }

        #encoding-centre-bench {
            padding: 0 2rem;
        }

        .ec-bench-list-item {
            position: relative;
            width: 100%;
            margin: 5px 0;
            padding: 2px 2px 2px 40px !important;
            cursor: move;
            list-style: none;
            background: steelblue;
            text-shadow: none !important;
            color: #fff;
        }

        .ec-bench-list-item:before {
            content: "☰";
            position: absolute;
            left: 10px;
            top: 0;
            font-size: 1rem;
            line-height: 1.2rem;
            color: #ccc;
        }

        span.close-bench-item {
            position: absolute;
            right: 0;
            padding-right: 10px;
            height: 100%;
            top: 0;
            font-size: 1rem;
            line-height: 1rem;
            color: #ccc;
            padding-left: 8px;
            transition: all 150ms;
        }

        span.close-bench-item:hover {
            color: white;
            cursor: pointer;
        }</style>`;
			if (!this.injected) $("head").append(cssInject);
			this.injected = true;
		}
	}

	class HJM_Modal {
		constructor({ mode }) {
			this.mode = mode;
			this.active = false;
			this.autoHide = false;
			this.style();
			this.elements();
			this.interaction();
			this.scrollPos = 0;
			this.scrollSize = 50;
			this.scrollInterval = 40;
			this.wheelOn = false;
			this.clickOn = false;
			this.events();
		}

		events() {
			const hideModalBound = this.hideModal.bind(this);
			const showModalBound = this.showModal.bind(this);
			document.body.addEventListener("lightboxOpen", hideModalBound);
			document.body.addEventListener("lightboxClose", showModalBound);
		}

		hideModal() {
			if (this.autoHide !== true) return false;
			this.outer.style.display = "none";
		}

		showModal() {
			if (this.autoHide !== true) return false;
			this.outer.style.display = "flex";
		}

		update({ mode, title, body, theme = "" }) {
			if (mode) this.mode = mode;
			else if (mode === false) this.mode = null;
			this.inner.className = "HJM-modal-inner";
			if (this.mode) this.inner.classList.add(this.mode);
			if (this.mode == "fullscreen") this.outer.classList.add(this.mode);
			if (theme) this.inner.classList.add(theme);
			this.title.innerHTML = title;
			this.body.innerHTML = body;
			this.show();
			setTimeout(() => {
				this.resetScroll();
				this.calculateScroll();
			}, 100);
		}

		elements() {
			this.outer = document.createElement("div");
			this.outer.className = "HJM-modal-container";
			this.close = this.outer.appendChild(document.createElement("div"));
			this.close.className = "HJM-modal-close";
			this.close.innerHTML = "<div>X</div>";
			this.inner = this.outer.appendChild(document.createElement("div"));
			this.inner.className = "HJM-modal-inner";
			this.inner.classList.add(this.mode);
			this.scrollbar = this.inner.appendChild(document.createElement("div"));
			this.scrollbar.className = "HJM-modal-scrollbar";
			this.scrollbarDot = this.scrollbar.appendChild(document.createElement("div"));
			this.scrollbarDot.className = "HJM-modal-scrollbar-dot";
			this.content = this.inner.appendChild(document.createElement("div"));
			this.content.className = "HJM-modal-content";
			this.title = this.content.appendChild(document.createElement("div"));
			this.title.className = "HJM-modal-title";
			this.body = this.content.appendChild(document.createElement("div"));
			this.body.className = "HJM-modal-body";
			this.footer = this.content.appendChild(document.createElement("div"));
			this.footer.className = "HJM-modal-footer";

			document.querySelector("#extra6").appendChild(this.outer);
		}

		resetScroll() {
			this.scrollPos = 0;
			this.content.style.marginTop = 0;
			this.scrollbarDot.style.top = 0;
		}

		calculateScroll() {
			let imgs = this.body.querySelectorAll("img");
			let promises = [];
			for (let img of imgs) {
				if (img.complete) continue;
				let promise = new Promise((resolve, reject) => {
					img.onload = function () {
						resolve();
					};
				});
				promises.push(promise);
			}
			Promise.all(promises).then(() => {
				if ($(this.body).height() > $(this.outer).height()) {
					this.showScrollbar(true);
					this.boundScroll = this.scroll.bind(this);
					if (this.wheelOn !== true) {
						this.content.addEventListener("wheel", this.boundScroll);
						this.wheelOn = true;
					}
					this.scrollableAmount = $(this.content).height() - $(this.outer).height(); //diff
					this.scrollPercent = 100 / this.scrollableAmount; // percent
					this.dotAmount = $(this.outer).height() - this.scrollSize;
					this.dotPercent = this.dotAmount / 100;
					this.drag = false;
					this.dragOffBound = this.dragOff.bind(this);
					this.dragMoveBound = this.dragMove.bind(this);
					this.dragOnBound = this.dragOn.bind(this);
					if (this.clickOn !== true) {
						this.scrollbar.addEventListener("mousedown", this.dragOnBound);
						this.clickOn = true;
					}
				} else this.showScrollbar(false);
			});
		}

		dragMove(ev) {
			ev.preventDefault();
			if (this.drag === false) return false;
			let newPos = ev.clientY - $(this.scrollbarDot).height();
			if (newPos < 0) newPos = 0;
			this.scrollbarDot.style.top = newPos + "px";
			let newPercent = (100 / this.dotAmount) * newPos;
			this.scrollPos = newPercent * (this.scrollableAmount / 100);
			this.content.style.marginTop = `-${this.scrollPos}px`;
		}

		dragOn(ev) {
			ev.preventDefault();
			this.drag = true;
			this.outer.addEventListener("mouseup", this.dragOffBound);
			this.outer.addEventListener("mouseleave", this.dragOffBound);
			this.outer.addEventListener("mousemove", this.dragMoveBound);
		}

		dragOff(ev) {
			ev.preventDefault();
			this.outer.removeEventListener("mouseup", this.dragOffBound);
			this.outer.removeEventListener("mouseleave", this.dragOffBound);
			this.outer.removeEventListener("mousemove", this.dragMoveBound);
			setTimeout(() => {
				this.drag = false;
			}, 100);
		}

		showScrollbar(state) {
			if (state) this.inner.classList.add("scrolling-notification");
			else this.inner.classList.remove("scrolling-notification");
		}

		scroll(ev) {
			if (!this.inner.classList.contains("scrolling-notification")) return false;
			if (ev.detail < 0 || ev.wheelDelta > 0 || ev.deltaY < 0) this.scrollUp(ev);
			else this.scrollDown(ev);
		}

		scrollUp(ev) {
			let move = Math.round(Math.abs(ev.deltaY) / 50);
			if (move < 1) move = 1;
			this.scrollPos -= this.scrollInterval * move;
			if (this.scrollPos < 0) this.scrollPos = 0;
			this.content.style.marginTop = `-${this.scrollPos}px`;
			let percent = this.scrollPercent * this.scrollPos;
			this.scrollbarDot.style.top = percent * this.dotPercent + "px";
		}

		scrollDown(ev) {
			let move = Math.round(Math.abs(ev.deltaY) / 50);
			if (move < 1) move = 1;
			this.scrollPos += this.scrollInterval * move;
			if (this.scrollPos > this.scrollableAmount) this.scrollPos = this.scrollableAmount;
			this.content.style.marginTop = `-${this.scrollPos}px`;
			let percent = this.scrollPercent * this.scrollPos;
			this.scrollbarDot.style.top = percent * this.dotPercent + "px";
		}

		show() {
			this.tempUIlock = UIlock;
			UIlock = true;
			$("#UI-padlock-icon").show();
			this.position = $("html").scrollTop() ? $("html").scrollTop() : $("body").scrollTop();
			$("body").addClass("lightbox__scroll-lock");
			$("body").css({
				top: -this.position + "px",
				left: "-15px",
				"background-position": "0 -" + (this.position + 75) + "px",
			});
			this.outer.style.display = "flex";
			setTimeout(() => {
				this.outer.classList.add("show");
				this.calculateScroll();
			}, 0);
		}

		hide(ev) {
			if (ev.target.classList.contains("mi-scanner-results-bar")) return false;
			if (this.drag === true) return false;
			if (ev.target.closest(".HJM-modal-content")) return false;
			this.outer.classList.remove("show");
			this.outer.classList.remove("fullscreen");
			this.outer.dispatchEvent(new CustomEvent("modalClosed"));
			this.body.innerHTML = "";
			this.autoHide = false;
		}

		transitionEnd(ev) {
			if (ev.type !== "transitionend" || !ev.srcElement.classList.contains("HJM-modal-container")) return false;
			if (this.active) {
				this.outer.style.display = "none";
				this.active = false;
				$("body").removeClass("lightbox__scroll-lock");
				$("html,body").scrollTop(this.position);
				document.body.removeAttribute("style");
				UIlock = this.tempUIlock;
				if (!UIlock) $("#UI-padlock-icon").hide();
			} else this.active = true;
		}

		interaction() {
			this.outer.addEventListener("transitionend", this.transitionEnd.bind(this));
			this.close.addEventListener("click", this.hide.bind(this));
			this.outer.addEventListener("click", this.hide.bind(this));
		}

		style() {
			let cssInject = `<style>.HJM-modal-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1002;
            display: none;
            justify-content: center;
            transition: opacity 300ms ease-out;
            opacity: 0;
            color: ${css.textLight};
            overflow: hidden;
            font-family: ${css.font};
            font-size: 14px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.004);
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
        }

        .HJM-modal-container.fullscreen {
            background: ${css.modalBackground};
        }

        .HJM-modal-container a {
            font-weight: bold;
            color: darkgoldenrod;
        }

        .HJM-modal-container a:hover {
            text-decoration: underline;
        }

        .HJM-modal-container.show {
           opacity: 1;
        }

        .HJM-modal-scrollbar {
            position: absolute;
            height: 100%;
            width: 10px;
            background: #333;
            right: -10px;
        }

        .HJM-modal-scrollbar-dot {
            position: absolute;
            width: 10px;
            padding: 0 1px;
            background: #555;
            height: 50px;
            cursor: pointer;
        }

        .HJM-modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
            background: #333;
            color: #ccc;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-family: "Arial Black", verdana, sans-serif;
            transition: all 100ms ease-in-out;
            cursor: pointer;
            z-index: 2;
        }

        .HJM-modal-close:hover {
            background: #555;
        }

        .HJM-modal-close > div {
            line-height: 0;
        }

        .HJM-modal-title {
            width: 100%;
            text-align: center;
            background: steelblue;
            color: white;
            padding: 1rem;
            font-size: 1rem;
        }

        .HJM-modal-body {
            width: 100%;
            padding: 3rem;
        }

        .HJM-modal-body img {
            max-width: 100%;
        }

        .HJM-modal-content {
            display: flex;
			flex-flow: column;
			max-width: 100%;
        }

        .HJM-modal-inner {
            z-index: 1;
            position: relative;
        }

        .HJM-modal-inner:not(.scrolling-notification) {
            display: flex;
            align-items: center;
        }

        .HJM-modal-inner:not(.scrolling-notification) .HJM-modal-scrollbar {
            display: none;
        }

        .HJM-modal-inner.notification {
            max-width: 1140px;
        }

        .HJM-modal-inner.fullscreen {
            color: ${css.text};
            text-shadow: ${css.textShadow};
        }

        #bbcode-txt {
            min-width: 800px;
        }

        .HJM-modal-inner.fullscreen .HJM-modal-content {
            background: ${css.modalContentBackground};
            max-width: 1140px;
        }
        </style>`;
			$("head").append(cssInject);
		}
	}

	class HJM_Cache {
		constructor() {
			this.defaults();
			this.settings = GM_getValue("HJM_cacheControl-settings");
			this.delay = this.settings.delay ? 500 : 0;
			this.timer = GM_getValue("HJM_cacheControl-timer");
			if (!this.checkCache("ptpRank")) this.update_ptpRank();
		}

		defaults(reset = false) {
			this.timer = {};
			this.data = {};
			this.settings = {};
			this.settings.refresh = 3600000;
			this.settings.colour = {};
			this.settings.template = defaultTemplate;
			this.settings.theme = "dark";
			this.data.ptpEncoder = false;
			this.data.encodeHistory = [];
			this.data.memberEncodes = [];
			this.data.scholarshipFund = {};
			this.data.currentlyEncoding = { active: [], bench: [] };
			this.data.attachments = [];
			this.data.attach = {};

			if (reset) {
				this.resetTimers();
				this.updateSettings();
				this.save(["encodeHistory", "memberEncodes", "scholarshipFund", "currentlyEncoding"]);
				alert("HJ Member Toolkit has been reset. Page will now reload.");
				location.reload();
			} else {
				let array = ["encodeHistory", "memberEncodes", "currentlyEncoding", "attachments", "attach"];
				for (var a of array) {
					storageDefaults("HJM_cacheControl-" + a, this.data[a]);
				}
				if (window.location.href.search(/upload.php/i) < 0) {
					GM_setValue("HJM_cacheControl-attach", {});
				}
				storageDefaults("HJM_cacheControl-settings", this.settings);
				storageDefaults("HJM_debugLog", []);
				storageDefaults("HJM_cacheControl-timer", this.timer);
			}

			function storageDefaults(to, from) {
				if (typeof GM_getValue(to) == "undefined" || !GM_getValue(to)) {
					GM_setValue(to, from);
				}
			}
		}

		save(fields = []) {
			if (fields.constructor !== Array) fields = [fields];
			for (let f of fields) GM_setValue("HJM_cacheControl-" + f, this.data[f]);
		}

		load(fields = []) {
			if (fields.constructor !== Array) fields = [fields];
			for (let f of fields) this.data[f] = GM_getValue("HJM_cacheControl-" + f);
		}

		log(save = false, logline) {
			let log;
			try {
				log = JSON.parse(GM_getValue("HJM_debugLog"));
			} catch (e) {
				log = [];
			}
			if (!save) return log;
			if (log.length > 100) log = log.slice(-100);
			log.push(windowID + "\n" + logline);
			GM_setValue("HJM_debugLog", JSON.stringify(log));
		}

		updateTimer(timer) {
			this.timer[timer] = new Date().getTime();
			GM_setValue("HJM_cacheControl-timer", this.timer);
		}

		updateSettings() {
			GM_setValue("HJM_cacheControl-settings", this.settings);
		}

		resetTimers() {
			this.timer = {};
			GM_setValue("HJM_cacheControl-timer", null);
		}

		checkCache(item) {
			let check = (this.timer[item] || 0) + this.settings.refresh;
			return check >= new Date().getTime();
		}

		benchEncodes(options = { forceUpdate: false }) {
			saveStack("cache Control: benchEncodes");
			this.load("currentlyEncoding");
			let bench = Array.from(this.data.currentlyEncoding.bench);
			let self = this;
			let addCount = 0;
			return new Promise((resolve, reject) => {
				(function loop() {
					if (bench.length > 0) {
						let toAdd = bench.shift();
						let x = {
							res: toAdd.res,
							groupid: toAdd.id,
							comment: toAdd.comment,
						};
						addEncodeOffer(x, false)
							.then(() => {
								addCount++;
								loop();
							})
							.catch((e) => {
								endLoop(toAdd);
							});
					} else endLoop();
				})();

				function endLoop(remainder) {
					if (remainder) bench.unshift(remainder);
					self.data.currentlyEncoding.bench = bench;
					self.save("currentlyEncoding");
					if (addCount === 0 && options.forceUpdate === false) return resolve();
					else {
						self.update_encodeHistory().then(() => resolve());
					}
				}
			});
		}

		update_encodeHistory(prog = "") {
			return new Promise((resolve, reject) => {
				const self = this;
				saveStack("cache Control: update encodeHistory");
				this.updateTimer("encodeHistory");
				let encodeHistory = [];
				let options = { url: permData.encodeHistory };
				if (prog) prog.init(5, 1);
				ajax(options)
					.then((res) => {
						const dom = self.parse_html(res);
						let results = parseInt(
							dom.querySelector(".search-form__footer__results").textContent.replace(/\D/gi, ""),
							10
						);
						let pages = Math.ceil(results / 50);
						let promises = [Promise.resolve(res)];
						for (let i = 2; i <= pages; i++)
							promises.push(ajax({ url: permData.encodeHistory + "&page=" + i }));
						return Promise.all(promises);
					})
					.then((res) => {
						for (let i = 0; i < res.length; i++) {
							const dom = self.parse_html(res[i]);
							const rows = dom.querySelectorAll(".table.table--panel-like tbody tr").forEach((row) => {
								let data = {};
								data.link = row.querySelector("td a.l_movie").getAttribute("href");
								data.title = row.querySelector("td a.l_movie").textContent;
								data.res = row.querySelector("td:first-child").textContent.split(" - ").pop();
								data.textres = data.res.trim();
								data.res =
									/SD x264/.test(data.res) === true ? "DVDRip / 480p" : data.res.match(/\d{3,4}p/)[0];
								data.userid = row.querySelector("td a.username").getAttribute("href").split("id=")[1];
								data.username = row.querySelector("td a.username").textContent;
								data.time = row.querySelector("td span.time").getAttribute("title");
								data.year = row
									.querySelector("td:first-child")
									.textContent.match(/ \[\d{4}\] /gi)[0]
									.replace(/\W/g, "");

								encodeHistory.push(data);
							});
						}
						this.data.encodeHistory = encodeHistory;
						if (prog) prog.load = 2;
						this.save("encodeHistory");
						this.update_currentlyEncoding().then(() => {
							if (prog) prog.complete();
							resolve();
						});
					})
					.catch((e) => {
						this.error("Error updating site's encode offers history");
						console.log(e);
						reject();
					});
			});
		}

		update_scholarshipFund() {
			return new Promise((resolve, reject) => {
				saveStack("cache Control: update scholarshipFund");
				this.updateTimer("scholarshipFund");
				let options = {
					url: "/forums.php?action=get_post&post=1106415",
					method: "GET",
				};
				ajax(options)
					.then((res) => {
						let active = res.match(/(?:\[hide=Active Fund Grants\])([\W|\w]*?)(?:\[\/hide\])/i)[1];

						active = active.split("[hr]");
						if (active[0].search(/none/i) >= 0) active = [];
						active = active.filter(function (x) {
							if (x != null || x != "" || x != undefined) return x;
						});
						this.data.scholarshipFund = { active };
						this.save("scholarshipFund");
						resolve();
					})
					.catch((e) => {
						this.error("Error updating Scholarship Fund records");
						console.log(e);
						reject();
					});
			});
		}

		update_currentlyEncoding() {
			return new Promise((resolve, reject) => {
				const self = this;
				saveStack("cache Control: update currentlyEncoding");
				let newEncodes = [];
				this.load(["currentlyEncoding", "encodeHistory", "attachments"]);
				let oldEncodes = JSON.parse(JSON.stringify(this.data.currentlyEncoding.active));

				// Check which encodes from the Encode Offers page belong to user

				for (let x of this.data.encodeHistory) if (x.userid == user.userid) newEncodes.push(x);

				// Creates array of unique links and converts them to promises for the torrent group

				let promises = [],
					promises2 = [];
				let links = new Set(newEncodes.map((x) => x.link));

				for (let link of links) promises.push(ajax({ url: link }));

				Promise.all(promises)
					.then((res) => {
						// Assign each unique torrent group to an object with its groupid as key
						let groups = {};
						for (let i = 0; i < res.length; i++) {
							const dom = self.parse_html(res[i]);

							let g = dom.querySelector("input[name=groupid]");

							g = g ? g.value : "";

							const tmp = dom.querySelector("#encode-offers-table tbody");

							groups[g] = tmp ? tmp.querySelectorAll("tr") : null;
						}

						return groups;
					})
					.then((groups) => {
						// Retrieve detailed information on each encode offer
						for (let x of newEncodes) {
							x.groupid = x.link.match(/(?:&|\?)(?:id=)(\d{1,})/)[1];

							for (let o of groups[x.groupid]) {
								let encRes = o.querySelector("td:nth-child(1)").innerHTML;

								if (encRes) encRes = encRes.split("<span")[0].trim();
								let user = o.querySelector("td:nth-child(2) a").getAttribute("href").split("=")[1];

								if (user == x.userid && encRes == x.textres) {
									x.offerid = o.getAttribute("id").split("row_")[1];
									x.comment =
										o.querySelector("td:nth-child(1)").querySelectorAll("div").length >= 1
											? o.querySelector("td:nth-child(1)").querySelector("div").innerHTML
											: null;

									x.renew = false;
									x.active = true;
								}
							}
						}
						return true;
					})
					.then(() => {
						// Compare the new list against the cached one and carry forward any auto-renew options
						// Also, check if they expired naturally (not completed or cancelled) and re-submit encode offer if so (and auto-renew is on)
						for (let o of oldEncodes) {
							let found = false;
							for (let n of newEncodes) {
								if (n.offerid == o.offerid) {
									found = true;
									if (o.renew === true) n.renew = true;
								}
							}
							if (!found && o.renew === true) {
								let prom = checkExpired(o).then((res) => {
									if (res === true) return addEncodeOffer(o);
								});
								promises2.push(prom);
							}
						}
						return Promise.all(promises2);
					})
					// Somewhere here need to carry forward the old offerid and match it with the new one and pass on attachments #TODO
					.then(() => {
						// Save updated currently encoding list locally and to TM storage
						this.data.currentlyEncoding.active = newEncodes;
						this.save("currentlyEncoding");
						// If any encode offers were made, update the encodeHistory cache again
						if (promises2.length > 0) {
							this.update_encodeHistory().then(() => {
								// Carry forward any attachments for the old offer by updating the offerid linked to the attachments
								this.data.attachments.forEach((a) => {
									this.data.currentlyEncoding.active.forEach((c) => {
										if (a.groupid == c.groupid && a.textres == c.textres) {
											a.offerid = c.offerid;
										}
									});
								});
								this.save("attachments");
								resolve();
							});
						} else {
							// Remove attachments for any non-active encode offers
							this.data.attachments = this.data.attachments.filter((at) =>
								this.data.currentlyEncoding.active.find(({ offerid }) => at.offerid == offerid)
							);
							this.save("attachments");
							resolve();
						}
					})
					.catch((e) => {
						console.log(e);
						this.error("Error updating currently encoding list");
						reject();
					});
			});
		}

		parse_html(input) {
			const parser = new DOMParser();
			const dom = parser.parseFromString(input, "text/html");
			return dom;
		}

		update_memberEncodes() {
			return new Promise((resolve, reject) => {
				let self = this;
				saveStack("cache Control: update memberEncodes");
				this.updateTimer("memberEncodes");
				let memberEncodes = [];
				let link = `/torrents.php?type=uploaded&userid=${user.userid}&filelist=handjob`;
				let count = 0,
					percent,
					first = true;
				let HJM_progress = new Progress();
				retrieve(link);

				function retrieve(url) {
					let options = { url, method: "GET" };
					ajax(options)
						.then((res) => {
							count++;
							let json = JSON.parse(res.match(/(?:{"Movies":)([\w\W]*)(?:,"Authkey")/i)[1]);
							const dom = self.parse_html(res);

							// Calculate the percentage towards the total for each page if this is page 1

							if (first) {
								let results = parseInt(
									dom.querySelector("span.search-form__footer__results").textContent,
									10
								);

								let perpage = json.length;
								let roundtotal = perpage * Math.ceil(results / perpage);
								HJM_progress.init(roundtotal / perpage, count);
							} else HJM_progress.load = count;

							// Add each encode's data to the array

							let last;

							const captureRes = function (title) {
								title = title.split(">x264")[1];
								if (/\d{3,4}x\d{3}/i.test(title)) return "dvdrip";
								else if (/various/i.test(title)) return "various";
								else if (/\d{3,4}p/i.test(title)) return title.match(/\d{3,4}p/i)[0];
								else return "unknown";
							};

							const captureSource = function (title) {
								title = title.split(">x264")[1];
								if (/DVD/i.test(title)) return "dvd";
								else if (/TV/i.test(title)) return "tv";
								else if (/VHS/i.test(title)) return "vhs";
								else if (/Blu-ray/i.test(title)) return "bluray";
								else return null;
							};

							for (let i = 0; i < json.length; i++) {
								if (!json[i].CategoryName) json[i].CategoryName = "Feature Film";
								let encode = {
									id: json[i].GroupingQualities[0].Torrents[0].TorrentId,
									group: json[i].GroupId,
									year: json[i].Year,
									tags: json[i].Tags,
									cat: json[i].CategoryName.toLowerCase().split("s")[0],
									time: json[i].GroupingQualities[0].Torrents[0].Time.match(
										/title=[^A-Z]*([^\\"]*)/i
									)[1],
									size: json[i].GroupingQualities[0].Torrents[0].Size,
									snatched: json[i].GroupingQualities[0].Torrents[0].Snatched,
									seeders: json[i].GroupingQualities[0].Torrents[0].Seeders,
									leechers: json[i].GroupingQualities[0].Torrents[0].Leechers,
									imdb: json[i].ImdbId,
									res: captureRes(json[i].LatestTorrentTitle),
									source: captureSource(json[i].LatestTorrentTitle),
									title: json[i].Title,
								};
								memberEncodes.push(encode);
								// Grab earliest uploaded date for cakeDay
								if (i === json.length - 1) last = encode.time.split(",")[0];
							}

							// If there's a next page, repeat this function to gather its data
							if (dom.querySelector("a.pagination__link--next")) {
								let newurl = "/" + dom.querySelector("a.pagination__link--next").getAttribute("href");

								first = false;
								retrieve(newurl);
							} else {
								self.data.cakeDay = last;
								self.data.memberEncodes = memberEncodes;
								self.save(["cakeDay", "memberEncodes"]);
								setTimeout(() => {
									resolve();
								}, 0);
							}
						})
						.catch((e) => {
							self.error("Error updating member encodes list");
							console.log(e);
							reject();
						});
				}
			});
		}

		update_ptpRank() {
			return new Promise((resolve, reject) => {
				const self = this;
				saveStack("cache Control: update ptpRank");
				this.updateTimer("ptpRank");

				let url = $("#nav_userinfo .user-info-bar__link").attr("href");

				ajax({ url })
					.then((res) => {
						const dom = self.parse_html(res);
						let encoder;
						this.data.ptpRank = Array.from(dom.querySelectorAll("div.sidebar .panel__heading__title"))
							.filter((x) => /personal/i.test(x.textContent))[0]
							.parentNode.nextElementSibling.querySelector("li:first-child")
							.textContent.replace(/^.*\:/i, "")
							.trim()
							.toLowerCase();

						try {
							encoder = dom
								.querySelector(
									'div.main-column div.tabs__panel#general div.panel__heading a[href*="torrents.php?type=uploaded"] img'
								)
								.getAttribute("src")
								.split("/")
								.pop();
						} catch (e) {
							encoder = "";
						}

						this.data.ptpEncoder = /encoder.*\.png/.test(encoder) ? true : false;
						this.save(["ptpEncoder", "ptpRank"]);
						resolve();
					})
					.catch((e) => {
						this.error("Error updating PTP Rank");
						console.log(e);
						reject();
					});
			});
		}

		update_handjobGuide() {
			return new Promise((resolve, reject) => {
				const self = this;
				let HJM_progress = new Progress();
				HJM_progress.init(2, 1);
				saveStack("cache Control: update handjobGuide");
				this.updateTimer("handjobGuide");
				let options = { url: "/wiki.php?action=article&id=263", method: "GET" };
				ajax(options)
					.then((res) => {
						const dom = self.parse_html(res);
						this.data.handjobGuide = dom.querySelector(".main-column .panel__body").innerHTML;
						this.save("handjobGuide");
						HJM_progress.load = 2;
						resolve();
					})
					.catch((e) => {
						this.error("Error updating HANDJOB Guide cache");
						reject();
					});
			});
		}

		error(e) {
			console.log(e);
		}
	}

	/* *************************************
	 *            AUTH FUNCTIONS
	 * ************************************* */

		async function HJM_logoutFromAPI() {
			if (!API_LOGIN_REQUIRED || !_hjm_access_token) {
				GM_deleteValue("HJMaccessToken");
				location.reload();
				return;
			}
			ajax({
				api: true,
				url: ROOT + "/auth/logout",
		})
			.then((res) => {
				GM_deleteValue("HJMaccessToken");
				location.reload();
			})
			.catch((e) => {
				GM_deleteValue("HJMaccessToken");
				location.reload();
			});
	}

	function getLoginCredentials() {
		return new Promise(async (resolve, reject) => {
			const totalSteps = 6;
			let currentStep = 0;
			const postBlocklist = GM_getValue("postBlocklist", []);
			const bar = document.querySelector("#api-login-progress");
			bar.classList.add("show-progress");
			bar.querySelector("span").style.width = "0%";
			const nextProgressStep = () => {
				currentStep++;
				const progress = Math.ceil((100 / totalSteps) * currentStep);
				bar.querySelector("span").style.width = progress + "%";
			};

			const data = { username: user.username, userid: user.userid, script: "member" };
			// 1. Get a verification token from the API
			const { verificationToken } = (await ajax({
				api: true,
				url: ROOT + "/auth/verification-token",
				method: "POST",
				data: JSON.stringify(data),
			}).catch((e = {}) => {
				e.data = data;
				return reject({
					message: "Couldn't get verification token from the server",
					errorObject: e,
				});
			})) || { verificationToken: null };
			nextProgressStep();

			if (!verificationToken) return reject("No verification token");

			// 2. Find a recent forum post by the user to use for verifying token
			const recentPostsURL = `${PTP}/userhistory.php?action=posts&userid=${data.userid}&showunread=0&group=0`;

			const recentPostsRaw = await ajax({
				url: recentPostsURL,
			}).catch((e) => {
				e.data = data.userid;
				return reject({
					message: "Couldn't retrieve recent post to amend",
					errorObject: e,
				});
			});
			nextProgressStep();

			const recentPosts = parseHTMLtoDOM(recentPostsRaw);
			const postForVerification = Array.from(recentPosts.querySelectorAll("div.forum-post"))
				.filter((post) => {
					const postId = parseInt(post.id.replace(/[\D]/g, ""), 10);
					return postBlocklist.includes(postId) === false;
				})
				.pop();
			const postForVerificationNode = postForVerification.querySelector(
				".forum-post__heading > span:first-child > a"
			);
			const threadId = parseInt(postForVerificationNode.href.match(/(?:threadid=)(\d+)/)[1], 10);
			const postId = parseInt(postForVerificationNode.href.match(/(?:postid=)(\d+)/)[1], 10);

			if (!threadId || !postId)
				return reject({
					message: "Thread ID and/or post ID were invalid",
					errorObject: { threadId, postId },
				});

			// 3. Retrieve the content of the post from PTP so it can be reverted afterwards
			const postContent = await ajax({
				url: `${PTP}/forums.php?action=get_post&post=${postId}`,
			}).catch((e) => {
				e.data = postId;
				return reject({
					message: "Couldn't save forum post body",
					errorObject: e,
				});
			});
			nextProgressStep();

			if (!postContent) return reject({ message: "Post content was empty" });

			// 4. Add the verification token and POST the updated post content to PTP
			const newPostContent = postContent + `\n\n[size=1][hide= ]${verificationToken}[/hide][/size]`;

			const formData = new FormData();
			formData.append("AntiCsrfToken", AntiCsrfToken);
			formData.append("body", newPostContent);
			formData.append("post", postId);
			formData.append("key", "1");
			const postForVerificationEditURL = `${PTP}/forums.php?action=takeedit`;

			const postEdited = await ajax({
				method: "POST",
				data: formData,
				url: postForVerificationEditURL,
			}).catch((e) => {
				e.data = {
					AntiCsrfToken,
					newPostContent,
					postId,
					postForVerificationEditURL,
				};
				return reject({
					message: "Error while trying to edit user's post with verification token",
					errorObject: e,
				});
			});

			if (/(lack the permission to edit|thread is locked)/i.test(postEdited)) {
				postBlocklist.push(postId);
				GM_setValue("postBlocklist", postBlocklist);
				return reject({
					message:
						"Forum post selected for verification is either locked or uneditable.<br><br>Please try again and a different post will be selected.",
					override: true,
				});
			}

			nextProgressStep();

			// 5. Send a GET request to the API with the information about where to find the verification token
			const { accessToken } = (await ajax({
				api: true,
				url: `${ROOT}/auth/verification-token/${threadId}/${postId}/${verificationToken}`,
				headers: {
					Accept: "application/json",
				},
			}).catch((e) => {
				e.data = {
					threadId,
					postId,
					verificationToken,
				};
				return reject({
					message: "Error while sending thead/post ID location to API server",
					errorObject: e,
				});
			})) || { accessToken: null };
			nextProgressStep();

			if (!accessToken)
				return reject({
					message: "Returned access token was null",
				});

			// 6. Revert the edits to the user's forum post
			formData.delete("body");
			formData.append("body", postContent);

			const postReverted = await ajax({
				method: "POST",
				data: formData,
				url: postForVerificationEditURL,
			}).catch((e) => {
				e.data = {
					postContent,
				};
				return reject({
					message: "Error while reverting user's forum post",
					errorObject: e,
				});
			});
			nextProgressStep();

			GM_setValue("HJMaccessToken", accessToken);
			_hjm_access_token = accessToken;
			_logged_in = true;
			setUserData();

			// 7. Profit
			resolve();
		});
	}

	/* *************************************
	 *         VERSION UPDATES
	 * ************************************* */

	const versionUpdate = GM_getValue("HJM_versionUpdate", "0");
	// versionCompare(a,b) returns 0 = a newer, 1 = equal, 2 = b newer
	if (versionCompare("0.3", versionUpdate) < 2) {
		GM_setValue("HJM_cacheControl-memberEncodes", []);
		GM_setValue("HJM_versionUpdate", "0.3");
	}
	if (versionCompare("0.4", versionUpdate) < 2) {
		GM_deleteValue("HJM_cacheControl-notifications");
		GM_deleteValue("HJM_cacheControl-readAnnouncements");
		GM_deleteValue("HJM_cacheControl-membership");
		GM_setValue("HJM_versionUpdate", "0.4");
	}

	/* *************************************
	 *         SCRIPT START
	 * ************************************* */

	const cache = new HJM_Cache();
	if (cache.settings.debug) HJM_debugLink();

	HJM_shiftClick()
		.then(() => HJM_loadTheme())
		.then(() => HJM_injectStyle())
		.then(() => {
			HJMModal = new HJM_Modal({ mode: "fullscreen" });
				if (API_LOGIN_REQUIRED && _logged_in === false) {
				const msg = `<div><p>To speed up the script, prevent users from breaching their PTP quota and to ensure live data is available at all times, the HJ Member Toolkit is gradually switching to using a secure API to retrieve data required for the script. This will also allow far more complex features in the future.</p>
				<p>First though, the API needs to perform an automated login to ensure that only PTP members can access it. No information other than your username/id is sent during this check, and it only needs to be done once per year (as long as you use the same browser and don't wipe your browsing data).</p>
				<p>You can logout from the Toolkit Settings panel. You will then need to deactivate the script to prevent this screen from appearing again.</p>
				<p><strong>Important: </strong>You will need to have at least 1 post to the PTP forums that isn't locked or archived for this login process to complete.</p>
				</div>
				<div id="api-login-progress" class="menu-progress stripes blue" style="margin-top: 1em; display: flex; position: relative; align-items: center; justify-content: flex-start; bottom: unset; padding: 4px 5px;"><span></span></div>
				<div style="width: 50%; margin: 0 auto;"><button id="login-to-api" class="block-button bsinfo" style="margin-top: 1.5em; margin-bottom:0.5em;">Login to HANDJOB API</button></div>
				<div id="api-login-status" style="margin-top: 1rem; max-height: 0; overflow: hidden; transition: max-height 150ms ease-in; background: black; color: white; border-radius: 4px; font-family: monospace;"><div style="padding: 0.5rem 1rem;">Login complete. Reloading page...</div></div>`;
				HJMModal.update({
					mode: "notification",
					theme: "info",
					title: "Please Login to HANDJOB API",
					body: msg,
				});

				const status = document.querySelector("#api-login-status");
				const button = document.querySelector("#login-to-api");
				button.addEventListener("click", () => {
					button.disabled = true;
					getLoginCredentials()
						.then(() => {
							status.querySelector("div").textContent = "Login complete. Reloading page...";
							status.style.maxHeight = "40px";
							setTimeout(() => location.reload(), 3000);
						})
						.catch((e) => {
							const bar = document.querySelector("#api-login-progress");
							bar.classList.remove("show-progress");
							if (e.override === true) {
								status.querySelector("div").innerHTML = `Error logging in: ${e.message}`;
							} else
								status.querySelector("div").innerHTML = `Error logging in: ${
									e.message
								}<br><br><pre>${JSON.stringify(
									e.errorObject,
									null,
									2
								)}</pre><br><br>Please copypaste the above and send it in a PM to <a href="https://passthepopcorn.me/inbox.php?action=compose&to=103454&subject=Error+information+from+HANDJOB+API+login">OTMOP</a>. Do <em>not</em> post it in a forum thread.`;
							status.style.maxHeight = "600px";
							button.disabled = false;
						});
				});
				return false;
			}
			HJM_uploadPage();

			HJM_scholarshipLinks();

			HJM_loadBadge()
				.then(() => HJM_loadMenuLinks())
				.then(() => HJM_setToolbarSwitches())
				.then(() => {
					const a = HJM_displayHJRank();
					const b = HJM_loadAnnouncements();
					return Promise.all([a, b]);
				})
				.then((res) => HJM_showAnnouncements(res[1]))
				.then(() => HJM_loadEncodeHistory())
				.then(() => HJM_historyButton())
				.then(() => HJM_requestLinks())
				.then(() => iwetListener())
				.then(() => uploadAttach())
				.then(() => {
					$("#HJM_loading").val("done");
				})
				.catch(function (e) {
					HJM_errorMessage(defaultError, e);
				});
		})
		.catch(function (e) {
			HJM_errorMessage(defaultError, e);
		});

	function uploadAttach() {
		return new Promise((resolve, reject) => {
			cache.load("attach");
			let attach = cache.data.attach;
			let group = attach.groupid;
			let reg = new RegExp(group, "i");
			if (
				window.location.href.search(/upload.php/i) < 0 ||
				/warning/i.test(document.title) ||
				!attach.groupid ||
				window.location.href.search(reg) < 0
			)
				return resolve();
			let template = cache.settings.template;
			if (!template) template = "";

			reg = /##source##\n?/i;
			if (reg.test(template) && attach.pl) template = template.replace(reg, attach.pl);
			else if (reg.test(template)) template = template.replace(reg, "");
			else if (attach.pl) template += "\n\nSource: " + attach.pl;

			reg = /\[mediainfo\][\w\W]*\[\/mediainfo\]/i;
			let replace = `[mediainfo]${attach.mediainfo}[/mediainfo]`;
			if (reg.test(template) && attach.mediainfo) template = template.replace(reg, replace);
			else if (attach.mediainfo) template += "\n\n" + replace;

			reg = /\[comparison=[\w\W]*\[\/comparison\]/i;
			replace = `[comparison=${attach.comptitles}]${attach.comp}[/comparison]`;
			if (reg.test(template) && attach.comp) template = template.replace(reg, replace);
			else if (attach.comp) template += "\n\n" + replace;

			reg = /##screens##\n?/i;
			if (reg.test(template) && attach.screens) template = template.replace(reg, attach.screens);
			else if (reg.test(template)) template = template.replace(reg, "");
			else if (attach.screens) template += "\n\n" + attach.screens;
			insertUploadTemplate(template);
			if (attach.mediainfo) {
				autocompleteUpload($("#release_desc").val());
				setTimeout(() => {
					let loc = $("#upload_table").offset().top;
					$("html, body").scrollTop(loc - 100);
					let piece = $("#piecesizeresults").html();
					let mtc = piece
						.split("<br>")
						.pop()
						.match(/(.*[A-Z]iB)(?:.*)$/)[1];
					new RegExp(mtc);
					$("#piecesizeresults").html(piece.replace(mtc, `<span class="highlight-text">` + mtc + "</span>"));
				}, 0);
			} else {
				$("#internalrip").prop("checked", true);
				$("#codec").val("x264");
				$("#container").val("MKV");
			}
			resolve();
		});
	}

	function generateID(length = 10) {
		let idArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
		let id = "";
		for (let i = 0; i < length; i++) {
			id += idArr[Math.floor(Math.random() * idArr.length)];
		}
		return id;
	}

	function HJM_debugLink() {
		if (window.location.href.search(/subject=Member%20Toolkit%20Bug%20Report/i) >= 0) pasteMessage();
		else {
			let div = `<div id="debugLink"><img src="https://ptpimg.me/3u5hi8.png"></div>`;
			$("body").append(div);
			$("#debugLink").click(function () {
				let link = `https://passthepopcorn.me/inbox.php?action=compose&to=103454&subject=Member Toolkit Bug Report`;
				window.location = link;
			});
		}

		function pasteMessage() {
			let report = cache.log();
			$("#quickpost").val(report.join("\n\n"));
		}
	}

	function iwetListener() {
		saveStack("iwetListener");
		return new Promise((resolve, reject) => {
			if (window.location.href.search(/torrents.php/i) <= 0) return resolve();
			else {
				$(document).on("click", "#OfferAnEncodeDialogForm :submit", function (e) {
					cache.settings.forceRefresh = true;
					cache.updateSettings();
				});
				resolve();
			}
		});
	}

	function checkExpired(x) {
		// Checked and working
		saveStack("checkExpired");
		return new Promise((resolve, reject) => {
			var options = {
				url: "https://passthepopcorn.me/encodeoffers.php?search=&format%5B%5D=SdX264&format%5B%5D=Sd576p&format%5B%5D=Hd720p&format%5B%5D=Hd1080p&state%5B%5D=Expired&order_by=time&order_way=desc",
				method: "GET",
			};

			ajax(options).then((raw) => {
				let table = $("table.table tbody", raw);
				$(table)
					.find("tr")
					.each(function () {
						let userid = $(this).find("td:nth-child(2) a").attr("href").split("id=").pop();
						let res = $(this).find("td:nth-child(1)").html().split(" - ").pop().trim();
						let groupid = $(this)
							.find('td:nth-child(1) a[href*="torrents.php"]')
							.attr("href")
							.split("id=")
							.pop();
						let time = new Date($(this).find("td:nth-child(4) span.time").attr("title")).getTime();
						let xtime = new Date(x.time).getTime();
						if (userid == x.userid && res == x.textres && groupid == x.groupid && time >= xtime)
							return resolve(true);
					});
				resolve(false);
			});
		});
	}

	// Used by update_benchEncodes and update_currentlyEncoding

	function addEncodeOffer(x, refresh = true) {
		// comment, groupid, link, offerid, renew, res, textres, time, title, userid, username, year
		// Need x.res, x.groupid, x.comment
		saveStack("addEncodeOffer");
		return new Promise((resolve, reject) => {
			var format = "";
			if (x.res.search(/dvd|480p/i) >= 0) format = "SdX264";
			else if (x.res.search(/576p/i) >= 0) format = "Sd576p";
			else if (x.res.search(/720p/i) >= 0) format = "Hd720p";
			else if (x.res.search(/1080p/i) >= 0) format = "Hd1080p";
			else reject("Error: unknown resolution");

			let options = { url: "/encodeoffers.php", method: "POST" };
			let formData = new FormData();
			formData.append("AntiCsrfToken", AntiCsrfToken);
			formData.append("action", "add");
			formData.append("Format", format);
			formData.append("GroupId", x.groupid);
			formData.append("Comment", x.comment);
			options.data = formData;
			ajax(options).then((res) => {
				if (refresh) {
					cache.update_encodeHistory();
				}
				let json = JSON.parse(res);
				let error = json.Result == "Error" ? json.Message : false;
				if (error) reject(error);
				else resolve("Resolving" + x.groupid);
			});
		});
	}

	function HJM_historyButton() {
		if (window.location.href.search(/threadid=13617/i) < 0 && !cache.settings.global) return true;
		if (window.location.href.search(/forums.php/) < 0) return true;
		saveStack("HJM_historyButton");
		var inject = `<div id="handjob-history-icon" class="bbcode-toolbar__button" title="Insert Encoding History"><div class="HJM-submit-loader HJM-fade" id="insertHistory-loader"></div></div>`;
		$("#Bbcode_Toolbar div.js-bbcode-toolbar__emoticon-button").after(inject);
		cache.load("memberEncodes");

		$("#handjob-history-icon").on("click", function () {
			var ccReturn = cache.checkCache("memberEncodes");
			if (ccReturn && cache.data.memberEncodes.length > 0) {
				insertHistory();
			} else {
				$("#insertHistory-loader").addClass("HJM-fadeIn");
				cache.update_memberEncodes().then(() => {
					$("#insertHistory-loader").removeClass("HJM-fadeIn");
					insertHistory();
				});
			}
		});

		function insertHistory() {
			saveStack("insertHistory");
			var encodes = createBBCodeList(true);
			encodes = encodes.reverse();
			var encList = [],
				opts = {},
				randArray = [];

			var rainbow = new Rainbow();
			rainbow.setNumberRange(0, encodes.length);

			var optAr = ["num", "break", "bold", "italic", "underline", "reverse", "pad", "colour", "randstops"];
			optAr.map((x) => {
				opts[x] = cache.settings.colour["BBCode-options-" + x] || "";
			});
			for (let z = 1; z < 5; z++) {
				opts["colourStop" + z] = cache.settings.colour["colourStop" + z] || null;
			}

			if (opts.colour == "grad" || (opts.colour == "rand" && opts.randstops))
				rainbow.setSpectrum(opts.colourStop1, opts.colourStop2, opts.colourStop3, opts.colourStop4);
			else if (opts.colour == "rand")
				rainbow.setSpectrum("#9400D3", "#4B0082", "#0000FF", "#00FF00", "#FFFF00", "#FF7F00", "#FF0000");

			for (let a = 0; a < encodes.length; a++) {
				randArray.push(a);
			}
			randArray = shuffle(randArray);

			for (let i = 0; i < encodes.length; i++) {
				let int = "";
				var digit = i + 1;
				if (opts.pad) {
					var totLength = encodes.length.toString().length;
					while (digit.toString().length < totLength) {
						digit = "0" + digit;
					}
				}
				if (opts.break.search(/##/) >= 0 && opts.num) int = opts.break.replace("##", digit);
				else {
					if (opts.break) int = opts.break;
					if (opts.num) int = `${digit}${int}`;
				}
				if (opts.bold && int) int = "[b]" + int + "[/b]";
				if (opts.italic && int) int = "[i]" + int + "[/i]";
				if (opts.underline && int) int = "[u]" + int + "[/u]";
				if (opts.colour == "grad") int = `[color=#${rainbow.colourAt(i)}]${int}[/color]`;
				else if (opts.colour == "rand") {
					int = `[color=#${rainbow.colourAt(randArray[i])}]${int}[/color]`;
				}
				if (int) int += " ";
				encList.push(int + encodes[i]);
			}

			if (opts.reverse) encList = encList.reverse().join("\n");
			else encList = encList.join("\n");
			var label = cache.settings.colour["BBCode-label"] || "My HANDJOB Encodes";
			encList = `[hide=${label}]${encList}[/hide]`;

			var el = "";
			if ($('textarea[id^="editbox"]').length == 1) {
				el = $('textarea[id^="editbox"]').get(0).id;
			} else el = "quickpost";

			var sel = $jq("#" + el).getSelection();
			$jq("#" + el).insertText(encList, sel.start, "collapseToEnd");
			$("#" + el).focus();
			return false;
		}
	}

	function HJM_loadTheme() {
		saveStack("HJM_loadTheme");
		return new Promise((resolve, reject) => {
			let bkg = invert($("body").css("background-color"));
			let selectedTheme = cache.settings.theme || "dark";
			css.feedbackColours = {
				advisory: "#e8e66c",
				warning: "#e08f2b",
				error: "#cd5c5c",
				pass: "#90ee90",
			};
			switch (selectedTheme) {
				case "dark":
					css.type = "dark";
					css.font = "Roboto, sans-serif";
					css.background = "#1A1A1A";
					css.backgroundBreak = css.background;
					css.backgroundShade = "#4e4e4e";
					css.backgroundContainer = "#inherit";
					css.tooltipBackground = "#008cee";
					css.guideBlocks = "inherit";
					css.badge = `rgb(${bkg})`;
					css.border = "#555555";
					css.text = "#ffffff";
					css.text2 = "#d9eaff";
					css.text3 = "#d9ffea";
					css.textLight = "#cccccc";
					css.textShadow = "";
					css.link = "#ffffff";
					css.hover = "#999999";
					css.gradient1 = "#444444";
					css.gradient2 = "#111111";
					css.captionBackground = "#d2691e";
					css.captionText = css.text;
					css.modalBackground = "rgba(0,0,0,0.7)";
					css.modalContentBackground = css.background;
					break;
				case "light":
					css.type = "light";
					css.font = "'Signika Negative', sans-serif";
					css.background = "#f8f8ff";
					css.backgroundBreak = css.background;
					css.backgroundContainer = "#inherit";
					css.backgroundShade = "#d2d2d2";
					css.tooltipBackground = "#c6efe3";
					css.guideBlocks = "inherit";
					css.badge = `rgb(${bkg})`;
					css.border = "#999999";
					css.link = "#3f219a";
					css.text = "#1a1a1a";
					css.text2 = "#487fc3";
					css.text3 = "#3ea7a7";
					css.textLight = "#333333";
					css.textShadow = "";
					css.hover = "#339933";
					css.gradient1 = "#bbbbbb";
					css.gradient2 = "#eeeeee";
					css.captionBackground = "#d2691e";
					css.captionText = "#fff";
					css.modalBackground = "rgba(0,0,0,0.7)";
					css.modalContentBackground = css.background;
					break;
				case "beach":
					css.type = "light";
					css.font = "Roboto, sans-serif";
					css.background = "center / cover no-repeat url(https://ptpimg.me/18399k.png), #ffffff";
					css.backgroundContainer = "#fff";
					css.backgroundShade = "#d2d2d285";
					css.backgroundBreak = "inherit";
					css.tooltipBackground = "#dbdc84";
					css.guideBlocks = "initial";
					css.badge = `rgb(${bkg})`;
					css.border = "#999999";
					css.link = "#8c8652";
					css.text = "#512d98";
					css.text2 = "#487fc3";
					css.text3 = "#3ea7a7";
					css.textLight = "#333333";
					css.textShadow = "";
					css.hover = "#736a11";
					css.gradient1 = "#eeeeeed4";
					css.gradient2 = "#b4f3f363";
					css.captionBackground = "#d2691e";
					css.captionText = "#fff";
					css.modalBackground = css.background;
					css.modalContentBackground = "rgba(255,255,255,0.85)";
					break;
				case "space":
					css.type = "dark";
					css.font = "Roboto, sans-serif";
					css.background = "center / cover no-repeat url(https://ptpimg.me/jv030w.jpg), #000000";
					css.backgroundBreak = css.background;
					css.backgroundShade = "#000";
					css.backgroundContainer = "#00000099";
					css.tooltipBackground = "#008cee";
					css.guideBlocks = "initial";
					css.badge = `rgb(${bkg})`;
					css.border = "#555555";
					css.text = "#ffffff";
					css.text2 = "#d9eaff";
					css.text3 = "#d9ffea";
					css.textLight = "khaki";
					css.textShadow =
						"-2px 0px 2px #000000, 0px -2px 2px #000000, 0px 2px 2px #000000, 2px 0px 2px #000000";
					css.link = "#ffffff";
					css.hover = "#bbbbbb";
					css.gradient1 = "#44444499";
					css.gradient2 = "#111111";
					css.captionBackground = "#d2691e";
					css.captionText = css.text;
					css.modalBackground = css.background;
					css.modalContentBackground = "rgba(0,0,0,0.85)";
					css.buttonBackground = "#1a1a1a";
			}
			resolve();
		});

		function invert(rgb) {
			rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
			for (var i = 0; i < rgb.length; i++) {
				rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
				if (i < 3) {
					if (rgb[i] < 128) rgb[i] += 50;
					else rgb[i] -= 50;
				}
			}
			return rgb;
		}
	}

	function HJM_shiftClick() {
		return new Promise((resolve, reject) => {
			const elements = document.querySelectorAll('a[href*="torrents.php?id="]');
			for (let i = 0; i < elements.length; i++) {
				if (cache.settings.shiftclick) elements[i].classList.add("show-context-menu");
			}
			$("body").on("click", 'a[href*="torrents.php?id="]', function (e) {
				if (e.shiftKey) {
					e.preventDefault();
					clicked(e);
				}
			});

			resolve();

			function clicked(ev) {
				let tgt = ev.currentTarget.href;
				let xpos = ev.pageX + 50;
				let ypos = ev.pageY - $(document).scrollTop() - 75;
				if (xpos + 300 > $(window).width()) xpos -= 400;
				if (ypos + 200 > $(window).height()) ypos -= 100;
				else if (ypos <= 0) ypos = 10;
				var html = `<div id="bench-popup" style="padding:10px;border-radius:10px;border:2px solid #555;background:#000;color:#fff;width:400px;position:fixed;z-index:9999;left:${xpos}px;top:${ypos}px;">
<ul class="select-multiple">
    <li data-value="DVDRip">DVDRip</li>
    <li data-value="480p">480p BluRay</li>
    <li data-value="576p">576p BluRay</li>
    <li data-value="720p">720p BluRay</li>
    <li data-value="1080p">1080p BluRay</li>
    <span>-- Select Resolution(s) --</span>
</ul>
    <textarea id="bench-comment" style="margin-top:10px;width:100%;height:50px;" placeholder="Comment (default: HANDJOB)"></textarea>
<button type="button" class="bbcode-copy-button" id="bench-submit" style="width: auto;padding: 2px 10px;margin-bottom: 2px;">Add to Encode Bench</button></div>`;
				HJMlightbox(html, true);
				let resSelect = new SelectMultiple(".select-multiple");
				$("#bench-res").focus();
				$("#bench-submit").keypress(function (e) {
					if (e.which == 13) {
						$("#bench-submit").click();
						return false;
					}
				});
				$("#bench-submit").on("click", function () {
					cache.load("currentlyEncoding");
					if (resSelect.chosen.length === 0) {
						$("#bench-popup").append(
							"<div class='lightbox-msg BS-alert-danger' style='display:none;text-align:center;position:relative;min-width:0;transform:unset;'>You haven't selected a resolution</div>"
						);
						$("#bench-popup .lightbox-msg")
							.slideDown("fast")
							.delay(2000)
							.slideUp("slow", function () {
								$("#bench-popup .lightbox-msg").remove();
							});
					} else {
						var tid = tgt.match(/(?:&|\?)(?:id=)(\d{1,})/)[1];
						var options = { url: tgt, method: "GET" };

						ajax(options).then((raw) => {
							let title = $("h2.page__title", raw).text().trim();
							let year = title.match(/\[\d{4}\]/g)[0];
							let benchComment = $("#bench-comment").val();
							if (!benchComment) benchComment = "HANDJOB";
							title = title.split(/[\d{4}]/)[0].trim();

							for (let item of resSelect.chosen) {
								let dupe = false;
								for (let x of cache.data.currentlyEncoding.bench) {
									if (tid == x.id && item == x.res) {
										dupe = true;
									}
								}
								if (!dupe) {
									cache.data.currentlyEncoding.bench.push({
										id: tid,
										title,
										year,
										res: item,
										comment: benchComment,
									});
									cache.save("currentlyEncoding");
								}
							}
							$("#lightbox").trigger("click");
						});
					}
				});
			}
		});
	}

	function HJM_uploadPage() {
		saveStack("HJM_uploadePage");
		if (window.location.href.search(/upload.php/i) < 0) return true;
		getPTPRank();
		var container = $("#release_desc_row");
		var toolbar = $(container).find("#Bbcode_Toolbar");
		var textarea = $(container).find("textarea#release_desc");
		var icon = `<div id="handjob-template-icon" class="bbcode-toolbar__button" title="Insert HANDJOB Template" style="background-color: rgb(221, 221, 221);
                background-image: url(&quot;https://ptpimg.me/sb54rt.png&quot;); background-repeat: no-repeat; background-position: center center; background-size: cover; cursor: pointer;"></div>`;
		$(toolbar).find('div[style*="clear: both"]').before(icon);

		var redMode = false;
		$("#handjob-template-icon").on("click", function () {
			if (redMode) autocompleteUpload($("#release_desc").val());
			else insertUploadTemplate(cache.settings.template);
		});
		$("#release_desc").on("keyup", function () {
			let text = $(this).val();
			if (text.search(/General(\s|\S)*Video/gm) >= 0) {
				redMode = true;
				$("#handjob-template-icon")
					.addClass("seeing-red")
					.attr("title", "Mediainfo log detected: Autocomplete Upload Form");
			} else {
				redMode = false;
				$("#handjob-template-icon").removeClass("seeing-red").attr("title", "Insert HANDJOB Template");
			}
		});
	}

	function autocompleteUpload(data) {
		saveStack("autocompleteUpload");
		$("#internalrip").prop("checked", true);
		$("#codec").val("x264");
		$("#container").val("MKV");
		let parse = {},
			res;
		data = data.replace(/\\/g, "/");
		let step1 = data.match(/(?:Complete name(\s)*:(\s*))(.*?)$/m).pop();
		let filesize = data
			.match(/(?:File size(\s)*:(\s*))(.*?)$/m)
			.pop()
			.trim()
			.split(" ");
		parse.filename = step1.split("/").pop();
		let baseMult = 0;
		switch (filesize[1]) {
			case "KiB":
				baseMult = 1024;
				break;
			case "MiB":
				baseMult = 1048576;
				break;
			case "GiB":
				baseMult = 1073741824;
				break;
			case "TiB":
				baseMult = 1099511627776;
				break;
			case "PiB":
				baseMult = 1125899906842624;
				break;
			case "EiB":
				baseMult = 1152921504606846976;
				break;
			default:
				baseMult = 1;
		}
		$("#BaseMultiplier").val(baseMult);
		$("#TorrentSize").val(parseFloat(filesize[0])).trigger("keyup");

		if ($("#PieceSizeCalculator").hasClass("hidden")) {
			$("input#file").next("a").trigger("click");
		}

		let psresults = document.querySelector("#piecesizeresults");
		let regex = /(Recommended [^B]*B)/;
		psresults.innerHTML = psresults.innerHTML.replace(regex, "<span class='highlight-text'>$1</span>");

		try {
			res = parse.filename.match(/\d{3,4}p/i)[0];
		} catch (e) {
			res = null;
		}
		if (res) {
			$("select#resolution").val(res).trigger("change");
			$("select#source").val("Blu-ray");
		} else if (parse.filename.search(/dvdrip|vhsrip/i) >= 0) {
			$("select#resolution").val("Other").trigger("change");
			if (parse.filename.search(/dvdrip/i) >= 0) $("select#source").val("DVD");
			else $("select#source").val("VHS");
			let wd = parseInt(data.match(/(?:Width\s*:\s*)([0-9]+)/m)[1], 10);
			let ht = parseInt(data.match(/(?:Height\s*:\s*)([0-9]+)/m)[1], 10);
			$("#other_resolution_width").val(wd);
			$("#other_resolution_height").val(ht);
		}

		parse.subs = data.match(/Text\s?(#\d{1,})?(\s|\S)*?\n\n/gm);
		parse.audio = data.match(/Audio\s?(#\d{1,})?(\s|\S)*?\n\n/gm);
		var engsub = false;
		try {
			parse.languages = parse.subs.map((x) => {
				let l = x.match(/(?:Language(\s)*:\s*)(.*?)$/m);
				l = l ? l.pop() : "";
				if (l == "English") engsub = true;
				let t = x.match(/(?:Title(\s)*:\s*)(.*?)$/m);
				t = t ? t.pop() : "";
				if (l) return { lang: l, title: t };
			});
		} catch (e) {
			parse.languages = [];
		}

		try {
			parse.audioTracks = parse.audio.map((x) => {
				let l = x.match(/(?:Language(\s)*:\s*)(.*?)$/m);
				l = l && l.length > 0 ? l.pop() : "";
				let d = x.match(/(?:Default(\s)*:\s*)(.*?)$/m);
				d = d && d.length > 0 ? d.pop() : "";
				let t = x.match(/(?:Title(\s)*:\s*)(.*?)$/m);
				t = t && t.length > 0 ? t.pop() : "";
				return { lang: l, title: t, default: d };
			});
		} catch (e) {
			parse.audioTracks = [];
		}

		var comm = false,
			dub = false,
			engdef = false,
			nengdef = false,
			dual = false,
			second = false;

		for (let i of parse.audioTracks) {
			if (i.title.search(/dub/i) >= 0 && i.lang == "English" && i.default.search(/yes/i) >= 0) dub = true;
			if (i.title.search(/commentary/i) >= 0) comm = true;
			else if (i.default.search(/yes/i) >= 0) {
				if (i.lang == "English") engdef = true;
				else nengdef = true;
			} else if (i.lang == "English" && i.title.search(/score/i) < 0) second = true;
		}
		if (nengdef && second) dual = true;
		let worthy = cache.data.ptpRank;
		if (worthy.search(/user/i) >= 0 || worthy.search(/member/i) >= 0 || worthy.search(/power/i) >= 0)
			worthy = false;
		else worthy = true;
		if (!engsub && nengdef && worthy) $("#no_english_subtitles").prop("checked", true);
		else if (worthy) $("#no_english_subtitles").prop("checked", false);

		let exist = $("#remaster_title").val();
		if ((dub || dual || comm) && $("#remaster_true").hasClass("hidden")) $("#remaster").trigger("click");
		if (comm && exist.search(/with commentary/i) < 0) {
			$("div#remaster_tags a:contains('With Commentary')")[0].click();
		} else if (!comm && exist.search(/with commentary/i) >= 0) {
			$("div#remaster_tags a:contains('With Commentary')")[0].click();
		}
		if (dub && exist.search(/english dub/i) < 0) {
			$("div#remaster_tags a:contains('English Dub')")[0].click();
		} else if (!dub && exist.search(/english dub/i) >= 0) {
			$("div#remaster_tags a:contains('English Dub')")[0].click();
		}
		if (dual && exist.search(/dual audio/i) < 0) {
			$("div#remaster_tags a:contains('Dual Audio')")[0].click();
		} else if (!dual && exist.search(/dual audio/i) >= 0) {
			$("div#remaster_tags a:contains('Dual Audio')")[0].click();
		}
		if (!dub && !dual && !comm && !$("#remaster_true").hasClass("hidden")) $("#remaster").trigger("click");

		var PTPsubs = {
			none: 44,
			english: 3,
			english_forced: 50,
			english_intertitles: 51,
			spanish: 4,
			french: 5,
			arabic: 22,
			brazilian: 49,
			bulgarian: 29,
			chinese: 14,
			croatian: 23,
			czech: 30,
			danish: 10,
			dutch: 9,
			estonian: 38,
			finnish: 15,
			german: 6,
			greek: 26,
			hebrew: 40,
			hindi: 41,
			hungarian: 24,
			icelandic: 28,
			indonesian: 47,
			italian: 16,
			japanese: 8,
			korean: 19,
			latvian: 37,
			lithuanian: 39,
			norwegian: 12,
			persian: 52,
			polish: 17,
			portuguese: 21,
			romanian: 13,
			russian: 7,
			serbian: 31,
			slovak: 42,
			slovenian: 43,
			swedish: 11,
			thai: 20,
			turkish: 18,
			ukrainian: 34,
			vietnamese: 25,
		};

		$("ul.languageselector input[type=checkbox]").prop("checked", false);
		for (let x of parse.languages) {
			let str = x.lang.toLowerCase();
			if (x.lang == "english") {
				if (x.title.search(/forced|non-english/i) >= 0) str = "english_forced";
				else if (x.title.search(/intertitle/i) >= 0) str = "english_intertitles";
			} else if (x.lang.search(/portuguese/i) >= 0) {
				if (x.title.search(/brazil/i) >= 0) str = "brazilian";
			}

			$("#subtitle_" + PTPsubs[str]).prop("checked", true);
		}
		if (parse.languages.length === 0) $("#subtitle_" + PTPsubs["none"]).prop("checked", true);
	}

	function HJM_loadBadge() {
		saveStack("HJM_loadBadge");
		return new Promise((resolve, reject) => {
			var html = `<div class="HJ-toolkit-badge HJ-hover" title="Open HandJob toolkit">HandJob<i class="HJ-toolkit-member-toolbar-announcements-alert"> </i></div>
<div id="HJM-error-message-bar" title="Click to Dismiss"><span id="HJM-error-message">This is for vital messages</span></div>
<div class="HJ-toolkit-member-toolbar">
<main>
<section class="HJ-toolkit-member-toolbar-announcements"></section>
<section class="HJ-toolkit-slide-wrapper">
<div class="HJMcontainer HJslidecontainer"><div class="HJ-toolkit-member-toolbar-flex" style="height: unset;">
<div class="HJ-toolkit-member-toolbar-links"></div>
<div class="HJ-toolkit-member-toolbar-settings">
<div class="HJM-switches-container">
<div title="Display HANDJOB rank in bottom-right of forum posts"><input type="checkbox" id="switch-HJMsettings-rank" name="switch-HJMsettings-rank" class="switch HJMinput"/><label for="switch-HJMsettings-rank">Display Member Ranks</label></div>
<div title="Display currently active encodes beneath each forum post"><input type="checkbox" id="switch-HJMsettings-active" name="switch-HJMsettings-active" class="switch HJMinput"/><label for="switch-HJMsettings-active">Display Active Encodes</label></div>
<div title="Add buttons to request links to display request information and 'I Will Encode This' form"><input type="checkbox" id="switch-HJMsettings-requests" name="switch-HJMsettings-requests" class="switch HJMinput"/><label for="switch-HJMsettings-requests">Request Quickforms</label></div>
</div>
<div class="HJ-toolkit-member-toolbar-services">
<div class="services-text">
    <div class="menu-progress stripes blue"><span></span></div>
    <span class="services-text-inner">This is where it goes</span></div>
<span class="handjob-services-icon" id="HJMencodingCentre" data-text="Encoding Centre" title="Encoding Centre">&#9638;</span>`;

			if (!user.rankShort || user.userid == "103454" || /nonmember|associate|madeguy/i.test(user.rankShort))
				html += `<span class="handjob-services-icon" id="HJCreateApproval" data-text="Create Approval Post" title="Create Approval Post">&#10003;</span>`;

			html += `<span class="handjob-services-icon" id="HJMemberProfile" data-text="Member Profile" title="Member Profile">&#9673;</span>
<span class="handjob-services-icon" id="HJM_MIScanner" data-text="Mediainfo Scanner" title="Mediainfo Scanner">&#8981;</span>
<span class="handjob-services-icon" id="HJM_Guide" data-text="Guide" title="Guide">&#9776;</span>
<span class="handjob-services-icon" id="HJM_uploadTemplate" data-text="Edit Upload Template" title="Edit Upload Template">&#8679;</span>
<span class="handjob-services-icon" id="HJM_finishEncode" data-text="Finish Encode" title="Finish Encode">&#9632;</span>
<span class="handjob-services-icon" id="HJM_settings" data-text="Toolkit Settings" title="Toolkit Settings">&#9881;</span>
</div>
</div>
</div>
</div><div class="HJMcontainer2 HJslidecontainer"></div>
</section>
</main>
<div id="UI-padlock-icon" title="Toolbar locked">&#9679;</div></div>`;

			var listeners = () => {
				$(".handjob-services-icon").hover(
					function () {
						if ($(".menu-progress").hasClass("show-progress")) return false;
						$(".services-text-inner").html($(this).attr("data-text"));
						$(".services-text").addClass("show-services-text");
					},
					function () {
						if ($(".menu-progress").hasClass("show-progress")) return false;
						$(".services-text").removeClass("show-services-text");
					}
				);
				document.querySelector(".HJ-toolkit-member-toolbar-services").addEventListener("click", menuClick);

				function menuClick(ev) {
					let target = ev.target.id;
					if (target === "HJMencodingCentre") HJM_encodingCentre();
					else if (target === "HJCreateApproval") createApprovalPost();
					else if (target === "HJM_MIScanner") mainMediainfoScanner();
					else if (target === "HJMemberProfile") loadMemberProfile();
					else if (target === "HJM_uploadTemplate") editUploadTemplate();
					else if (target === "HJM_Guide") handjobGuide();
					else if (target === "HJM_finishEncode") loadFinishEncode();
					else if (target === "HJM_settings") loadSettingsPage();
				}
				$(".HJ-toolkit-badge").on("click", () => HJM_loadMemberToolbar());
				$(".switch.HJMinput").change(function () {
					let tempid = $(this).attr("id").replace("switch-", "");
					let obj = tempid.split("-").pop();
					if ($(this).is(":checked")) {
						cache.settings[obj] = true;
						cache.updateSettings();
						HJM_toggleFeature(tempid, true);
					} else {
						cache.settings[obj] = false;
						cache.updateSettings();
						HJM_toggleFeature(tempid, false);
					}
				});
					$("#HJM-error-message-bar").on("click", function () {
						$("#HJM-error-message-bar").removeClass("show-error-message");
					});
					$(document)
						.off("click.HJMToolbarHeight")
						.on("click.HJMToolbarHeight", ".HJ-toolkit-member-toolbar .back-button", () => HJM_setToolbarHeight());
				};

				try {
					$("body").append(html);
					mountToolbarLauncher();
					listeners();
					$(".HJ-toolkit-badge").fadeIn("fast");
					resolve();
				} catch (e) {
					reject(e);
				}
			});
		}

			function mountToolbarLauncher() {
				const badge = document.querySelector(".HJ-toolkit-badge");
				const menu = document.querySelector("#menu ul, nav ul, .main-menu ul, .site-menu ul");
				if (!badge || !menu) return;
				const item = document.createElement("li");
				item.className = "HJ-toolkit-menu-item";
				item.appendChild(badge);
				menu.appendChild(item);
				document.body.classList.add("HJM-toolbar-in-menu");
			}

			function HJM_setToolbarHeight(height = barHeight) {
				$(".HJ-toolkit-slide-wrapper, .HJslidecontainer").css("height", height + "px");
			}

		function loadSettingsPage() {
			saveStack("loadSettingsPage");
			HJM_setToolbarHeight();
		let html = `<div class="back-button" title="Return to Menu">&laquo;</div>
		        <div style="flex-flow: column" class="HJ-toolkit-member-toolbar-flex HJM-settings-panel">
            <h1 style="margin-bottom: 5px;">Toolkit Settings</h1>
            <div id="HJM-settings-container" class="flex-container">
				<div class="HJM-col" style="justify-content: space-between;">
					<div>
						<div class="HJM-row profile-input" style="flex-direction: column">
							<label for="HJM-settings-style">Toolbar style:</label>
							<select name="HJM-settings-style" id="HJM-settings-style"><option value="dark" selected>Dark</option><option value="light">Light</option><option value="beach">Beach</option><option value="space">Space</option></select>
						</div>
						<div class="HJM-row profile-input" style="flex-direction: column">
							<label for="HJM-settings-cacheTime">Cache Time:</label>
							<select name="HJM-settings-cacheTime" id="HJM-settings-cacheTime">
								<option value="1">1 Minute (debugging)</option>
								<option value="15">15 Minutes</option>
								<option value="30">30 Minutes</option>
								<option value="45">45 Minutes</option>
								<option value="60" selected>60 Minutes</option>
								<option value="90">90 Minutes</option>
								<option value="120">2 Hours</option>
								<option value="240">4 Hours</option>
								<option value="480">8 Hours</option>
								<option value="720">12 Hours</option>
								<option value="1440">1 Day</option>
								<option value="2880">2 Days</option>
								<option value="5760">4 Days</option>
								<option value="10080">1 Week</option>
							</select>
						</div>
					</div>
						<div class="HJM-row profile-input" style="margin-top: 1rem;">
							<button id="logout-from-api" class="block-button bswarning">Clear saved API token</button>
					</div>
                </div>
                <div class="HJM-col" style="padding: 0 1em;">
                    <div class="HJM-settings-checkbox">
                        <input type="checkbox" id="HJM-settings-shiftclick" value="1" title="Shows context-menu cursor when hovering over a torrent link">
						<label for="HJM-settings-shiftclick" title="Shows context-menu cursor when hovering over a torrent link">Torrent Links Cursor</label>
                    </div>
                    <div class="HJM-settings-checkbox">
                        <input type="checkbox" id="HJM-settings-global" value="1" title="Enables the display of active encodes, HJ rank and request quickforms on all PTP forum threads">
                        <label for="HJM-settings-global" title="Enables the display of active encodes, HJ rank and request quickforms on all PTP forum threads">Enable global functions</label>
                    </div>
                    <div class="HJM-settings-checkbox">
                        <input type="checkbox" id="HJM-settings-debug" value="1" title="Switches on the facility to report debugging issues to the tool's administrator">
                        <label for="HJM-settings-debug" title="Switches on the facility to report debugging issues to the tool's administrator">Enable debug mode</label>
                    </div>
                    <div class="HJM-settings-checkbox">
                        <input type="checkbox" id="HJM-settings-delay" value="1" title="If you're having an issue with PTP requests, enable this to increase the delay between data calls.">
                        <label for="HJM-settings-delay" title="If you're having an issue with PTP requests, enable this to increase the delay between data calls.">Enable slow updates</label>
                    </div>
                    <button id="show-manual" class="block-button bsinfo" style="margin-top: 0.5em; margin-bottom:0.5em;">Show Toolkit Manual</button>
                    <button id="reset-cache" class="block-button bsdanger">Reset Settings and Cache</button>
                </div>
            </div>
        </div>`;

		$(".HJMcontainer2").html(html);
		$(".HJMcontainer").css("margin-left", -barWidth + "px");
		$(".HJMcontainer2").css("margin-left", "0px");
		if (cache.settings.theme) $("#HJM-settings-style").val(cache.settings.theme);
		if (cache.settings.refresh) $("#HJM-settings-cacheTime").val(cache.settings.refresh / 60 / 1000);
		if (cache.settings.global) $("#HJM-settings-global").prop("checked", "checked");
		if (cache.settings.debug) $("#HJM-settings-debug").prop("checked", "checked");
		if (cache.settings.delay) $("#HJM-settings-delay").prop("checked", "checked");
		if (cache.settings.shiftclick) $("#HJM-settings-shiftclick").prop("checked", "checked");

		$("#HJM-settings-style").on("change", function () {
			cache.settings.theme = $(this).val();
			cache.updateSettings();
		});

		$("#HJM-settings-cacheTime").on("change", function () {
			cache.settings.refresh = $(this).val() * 60 * 1000;
			cache.updateSettings();
		});

		$("#HJM-settings-global").on("change", function () {
			cache.settings.global = $(this).is(":checked") ? true : false;
			cache.updateSettings();
		});

		$("#HJM-settings-shiftclick").on("change", function () {
			cache.settings.shiftclick = $(this).is(":checked") ? true : false;
			cache.updateSettings();
		});

		$("#HJM-settings-debug").on("change", function () {
			cache.settings.debug = $(this).is(":checked") ? true : false;
			cache.updateSettings();
		});

		$("#HJM-settings-delay").on("change", function () {
			cache.settings.delay = $(this).is(":checked") ? true : false;
			cache.updateSettings();
		});

		$("#reset-cache").on("click", function () {
			if (
				!confirm(
					`This will reset all settings including upload/BBCode templates, encode bench and notifications and then reload the page. Are you sure you wish to continue?`
				)
			)
				return false;
			else {
				cache.defaults(true);
			}
		});

		$("#show-manual").on("click", function () {
			HJM_userManual();
		});

		$("#logout-from-api").on("click", function () {
			HJM_logoutFromAPI();
		});

		$(".back-button").on("click", (e) => {
			e.preventDefault();
			$(".HJMcontainer").css("margin-left", "0px");
			$(".HJMcontainer2").css("margin-left", barWidth + "px");
		});
	}

	function HJM_userManual() {
		let title = `Members Toolkit: User Guide`;
		let html = `<p>Welcome to Members Toolkit. This fork keeps the local helper tools available even when the legacy API is unavailable.</p>

	        <h3 class="guide-subheading">Toolbar</h3>
	        <p>Use the badge to open the toolkit. The toolbar gives access to the centre, profile tools, scanner, guide cache, upload template, finish helper, and settings.</p>

	        <h3 class="guide-subheading">Centre</h3>
	        <p>The centre manages active offers, saved bench items, attachments, renewals, and upload shortcuts. Cache settings control how often the toolkit refreshes page-derived data.</p>

	        <h3 class="guide-subheading">Templates and Scanner</h3>
	        <p>The upload template stores reusable BBCode. The scanner checks pasted media logs and reports likely issues before submission.</p>

	        <h3 class="guide-subheading">Profile and Lists</h3>
	        <p>The profile area summarizes local encode history and can build styled BBCode lists from cached data.</p>

	        <h3 class="guide-subheading">API Status</h3>
	        <p>API-backed rank badges and API messages are optional in this fork. If no saved API token is available, those areas stay quiet and the rest of the toolkit continues to load.</p>

	        <h3 class="guide-subheading">Settings</h3>
	        <p>Settings control toolbar style, cache time, global helper behavior, debug logging, slower update pacing, cache reset, and saved API token clearing.</p>`;
		HJMModal.update({ mode: "fullscreen", title, body: html });
	}

	function HJM_encodingCentre() {
		saveStack("HJM_encodingCentre");
		UIlock = true;
		var ccReturn = cache.checkCache("encodeHistory");
		if (ccReturn) {
			cache.load("encodeHistory");
			if (!cache.data.encodeHistory) {
				cache.update_encodeHistory(new Progress()).then(() => {
					render();
				});
			} else render();
		} else {
			cache
				.update_encodeHistory(new Progress())
				.then(() => cache.update_ptpRank)
				.then(() => render());
		}

		function render() {
			cache.load(["ptpEncoder", "currentlyEncoding", "handjobGuide"]);

			var data = cache.data.currentlyEncoding.active;
			let bench = cache.data.currentlyEncoding.bench;
			var maxEnc = cache.data.ptpEncoder ? 3 : 1;
			let ec = new EncodingCentre(data, bench, maxEnc);
			$(".HJMcontainer2").html(ec.dom);
			$(".HJMcontainer").css("margin-left", -barWidth + "px");
			$(".HJMcontainer2").css("margin-left", "0px");
			setTimeout(() => {
				$("#UI-padlock-icon").show();
			}, 300);
		}
	}

	function loadFinishEncode() {
		saveStack("loadFinishEncode");
		UIlock = true;
		var html = `<div class="back-button" title="Return to Menu">&laquo;</div><div style="flex-flow: column" class="HJ-toolkit-member-toolbar-flex"><h1 style="margin-bottom: 5px;">Finish Your Encode</h1>
<div id="HJM-finish-container">
<div class="HJM-row" style="margin-bottom:5px;"><input type="text"  style="border:3px solid ${
			css.border
		}" id="HJM-finish-pl" class="fullX" placeholder="Enter your completed encode's PL here..."><input type="hidden" id="prevFinishPL" value="">
<div style="display: flex;position: absolute;right: 14px;top: 17px;font-size: 9px;flex-flow: column;align-items: center;text-align: center;">Post to<br>HANDJOB<input type="checkbox" style="margin-top: 5px;" id="handjobThread" class="finish-check" title="Posts your finished encode to both the HANDJOB thread and the ${new Date().getFullYear()} collection"></div></div>
<div class="HJM-row" style="flex-flow:column">
    <div class="HJM-row" style="flex-flow:column">
        <div class="HJM-row mini-header">I Will Encode This:</div>
        <div class="HJM-row finish-block">
            <div class="HJM-finish-section"><div class="fullX select-bar-container hide-check"><select class="finish-encode-select-bar" id="select-finish-iwet"><option>-- Waiting for data --</option></select></div></div>
            <div style="padding:2px;"><input type="checkbox" class="finish-check" id="finish-check-iwet" title="Finish this encode offer"></div>
        </div>
    </div>
    <div class="HJM-row" style="flex-flow:column">
        <div class="HJM-row mini-header">The HANDJOB Scholarship Fund:</div>
        <div class="HJM-row finish-block">
            <div class="HJM-finish-section"><div class="fullX select-bar-container hide-check"><select class="finish-encode-select-bar" id="select-finish-hsf"><option>-- Waiting for data --</option></select></div></div>
            <div style="padding:2px;"><input type="checkbox" class="finish-check" id="finish-check-hsf" title="Complete this grant"></div>
        </div>
    </div>
    <div class="HJM-row" style="flex-flow:column">
        <div class="HJM-row mini-header">Requests:</div>
        <div class="HJM-row finish-block">
            <div class="HJM-finish-section"><div class="fullX select-bar-container hide-check"><select class="finish-encode-select-bar" id="select-finish-request"><option>-- Waiting for data --</option></select><div style="display:none; top:0;right:17px;" class="help-tip inverted" id="request-comment-tip"><p id="request-comment">Testing</p></div></div></div>
            <div style="padding:2px;"><input type="checkbox" class="finish-check" id="finish-check-requests" title="Fill this request"></div>
            <div class="HJM-submit-checkmark" id="finish-check-status">&check;</div>
        </div>
    </div>
</div>
<input type="hidden" id="HJM_torrent-group-id" value="">
<input type="hidden" id="HJM_torrent-link" value="">
<div class="HJM-submit-loader" id="finish-loader" style="top: calc(50% - 25px);right: 18px;"></div>
<div class="HJM-submit-checkmark filter-disabled HJ-hover" id="finish-check-complete"></div>
</div></div>`;

		function checkReqLink(url) {
			saveStack("checkReqLink");
			if (url.search(/torrents.php/i) < 0) return false;
			else if (url.trim().search(/\s/) >= 0) return false;
			else if (url.search(/[^0-9A-Za-z&-.=:\/\?]/) >= 0) return false;
			else return true;
		}

		$(".HJMcontainer2").html(html);
		$(".HJMcontainer").css("margin-left", -barWidth + "px");
		$(".HJMcontainer2").css("margin-left", "0px");
		setTimeout(() => {
			$("#UI-padlock-icon").show();
			$("#HJM-finish-pl").focus();
		}, 300);

		$("#select-finish-request").on("change", function () {
			updateRequestComment($(this));
		});

		function updateRequestComment(el) {
			saveStack("updateRequestComment");
			var selected = $(el).find("option:selected");
			selected = $(selected).attr("data-comment");
			if (selected) {
				$("#request-comment").html(selected);
				$("#request-comment-tip").fadeIn("fast");
			} else $("#request-comment-tip").fadeOut("fast");
		}

		var timer = null;
		$("#HJM-finish-pl")
			.on("paste keyup", function (ev) {
				if ($(this).hasClass("error-message")) $(this).val("");
				$(this).removeClass("error-message");
				$(".select-bar-container").removeClass("fail").addClass("hide-check");
				$("#finish-check-status").hide();
				$("#finish-check-complete").addClass("filter-disabled");
				$(".finish-check").prop("disabled", false).prop("checked", false);
				$(".finish-encode-select-bar").prop("disabled", false).html("<option>-- Waiting for data --</option>");
				if (timer) {
					window.clearTimeout(timer);
				}

				timer = window.setTimeout(() => {
					timer = null;
					scanFinishPL($(this));
				}, 1500);
			})
			.on("focus", function () {
				if ($(this).hasClass("error-message")) $(this).val("");
				$(this).removeClass("error-message");
			});

		$(".back-button").on("click", (e) => {
			e.preventDefault();
			UIlock = false;
			$("#UI-padlock-icon").hide();
			$(".HJMcontainer").css("margin-left", "0px");
			$(".HJMcontainer2").css("margin-left", barWidth + "px");
		});

		function scanFinishPL(elem) {
			saveStack("scanFinishPL");
			var prev = $("#prevFinishPL").val();
			var pl = $(elem).val();
			if (!pl) return false;
			if (pl == prev) return false;
			else $("#prevFinishPL").val(pl);
			$("#finish-loader").fadeIn("fast");
			var good = checkReqLink(pl);
			if (!good) {
				$("#finish-loader").fadeOut("fast", function () {
					$("#finish-check-status").addClass("fail").html("X").fadeIn("fast");
				});
				$(elem).val(`-- Not a valid torrent link --`).addClass("error-message");
				return false;
			}
			$("#HJM_torrent-link").val(pl);
			$("#handjobThread").prop("checked", true);
			var plid = pl.split("?")[1].split("&");
			for (let a of plid) {
				let el = a.split("=");
				if (el[0] == "id") $("#HJM_torrent-group-id").val(el[1]);
			}
			let a = getActiveRequests(pl);
			let b = cache.update_encodeHistory();
			let c = cache.update_scholarshipFund();

			Promise.all([a, b, c])
				.then((res) => {
					var requests = res[0];
					processResults(requests);
				})
				.catch((e) => {
					$("#finish-loader").fadeOut("fast", function () {
						$("#finish-check-status").addClass("fail").html("X").fadeIn("fast");
					});
					$("#HJM-finish-pl").val(`-- ${e} --`).addClass("error-message");
					console.log(e.stack);
				});
		}

		function processResults(requests) {
			var hsf = [];
			var encodeOffers = [];
			var encoded = "";
			var gpStatus = false;
			requests = requests.filter((x) => {
				if (x.type == "encodeOffer") encodeOffers.push(x);
				if (x.type == "encoded") encoded = x.encoded;
				if (x.type == "gpStatus") gpStatus = x.gpStatus;
				return !x.type;
			});

			// var override = "576p";
			// if (override) encoded = override;

			// Checks for active HSF grants
			for (let x of cache.data.scholarshipFund.active) {
				var edate = x.match(/(?:\[b\])(.*?)(?:\[\/b\])/i)[1];
				let grantee = x.match(/(?:user.php\?id=)(\d*)/i)[1];
				var id = x.match(/(?:torrents.php\?)(.*?)(?:\))/i)[1];
				id = id.split("&");
				var groupId = "";
				for (let a of id) {
					let el = a.split("=");
					if (el[0] == "id") groupId = el[1];
				}
				var second = x.split("\n")[1];
				var res = second
					.split("/")[0]
					.replace(/[^0-9A-Za-z\s]/i, "")
					.replace("ndash;", "")
					.trim();
				hsf.push({ date: edate, userid: grantee, res: res, groupId: groupId });
			}

			// ## Check Requests
			$("#finish-loader").fadeOut("fast");
			var html = "";

			// Converts all bounties to MiB and then sorts from highest to lowest
			requests.sort(function (a, b) {
				var stripper = function (x) {
					if (x.search(/mib/i) >= 0) x = parseFloat(x);
					else if (x.search(/gib/i) >= 0) x = parseFloat(x) * 1000;
					else if (x.search(/tib/i) >= 0) x = parseFloat(x) * 1000000;
					return x;
				};
				a = stripper(a.bounty);
				b = stripper(b.bounty);

				return b - a;
			});

			for (let x of requests) {
				if (!x.codec) continue;
				let tmpenc = encoded;
				if (tmpenc == "dvd") tmpenc = "other";
				var reg = new RegExp(tmpenc, "i");
				if (x.res.search(/any/i) >= 0 || x.res.search(reg) >= 0) {
					if (x.gp.search(/yes/i) >= 0 && !gpStatus) continue;
					if (tmpenc.search(/\d{3,4}p/i) >= 0 && x.sources.search(/(any|blu-ray)/i) < 0) continue;
					else if (tmpenc == "other" && x.sources.search(/(dvd|any)/i) < 0) continue;

					var title = "";
					if (x.comment) {
						x.comment = x.comment.replace(/<li>/g, "\n");
						x.comment = x.comment
							.replace(/(<([^>]+)>)/gi, "")
							.trim()
							.replace(/\n/g, "<br>");
						title = ` data-comment="${x.comment}"`;
					}
					html += `<option value="${x.reqid}"${title}>ID: ${x.reqid} – ${x.res} for ${x.bounty}`;
					if (x.gp.search(/yes/i) >= 0) html += " (GP)";
					html += `</option>`;
				}
			}
			if (!html) {
				let text = requests.length == 0 ? "Found no requests" : "Found no requests that are fillable";
				$("#select-finish-request").html(`<option>... ${text}</option>`);
				$("#finish-check-requests").prop("disabled", true);
				$("#select-finish-request").prop("disabled", true);
			} else {
				$("#finish-check-requests").prop("checked", true);
				$("#select-finish-request").html(html);
			}

			html = "";
			for (let b of hsf) {
				if (b.userid == user.userid && b.groupId == $("#HJM_torrent-group-id").val())
					html += `<option value="${b.date}">${b.date} – HSF Grant for this film at ${b.res}</option>`;
			}
			if (!html) {
				html = "<option>... No HSF grants for this film found</option>";
				$("#select-finish-hsf").prop("disabled", true);
				$("#finish-check-hsf").prop("disabled", true).prop("checked", false);
			} else $("#finish-check-hsf").prop("checked", true);
			$("#select-finish-hsf").html(html);

			// hsf = array of {data, groupId, userid, res}
			// requests = array of {bounty,codec,container,encoded,gp,reqid,res}
			// hist = array of {link,title,res,username,userid,year,time,timerel}
			// encoded = dvd,480p,576p etc.

			// ## Check IWET

			html = "";
			for (let c of encodeOffers) {
				var enc = encoded === "dvd" || encoded === "480p" ? "SD x264" : enc;
				if (c.res.search(enc) < 0) continue;
				else if (c.userid == user.userid)
					html += `<option value="${c.id}">ID: ${c.id} – ${c.res}: ${c.time}</option>`;
			}
			if (!html) {
				html = "<option>... No active encodes for this film and resolution found</option>";
				$("#select-finish-iwet").prop("disabled", true);
				$("#finish-check-iwet").prop("disabled", true);
			} else $("#finish-check-iwet").prop("checked", true);

			$("#select-finish-iwet").html(html);
			$(".filter-disabled").removeClass("filter-disabled");

			$("#finish-check-complete")
				.unbind()
				.on("click", () => processFinishedEncode());
			updateRequestComment($("#select-finish-request"));
		}

		function processFinishedEncode() {
			saveStack("processFinishedEncode");
			if ($(".finish-check:checked").length == 0) {
				$("#finish-loader").fadeOut("fast", function () {
					$("#finish-check-status").addClass("fail").html("X").fadeIn("fast");
				});
				$("#HJM-finish-pl").val(`-- You did not select any tasks to perform --`).addClass("error-message");
				return false;
			}
			$("#finish-check-complete").addClass("filter-disabled").unbind();
			$("#finish-loader").fadeIn("fast");
			var pl = $("#HJM_torrent-link").val();
			var iwetid = $("#select-finish-iwet").val();
			var iwetstatus = $("#finish-check-iwet").is(":checked");
			var hsf = $("#finish-check-hsf").is(":checked");
			var reqid = $("#select-finish-request").val();
			var reqstatus = $("#finish-check-requests").is(":checked");
			var groupId = $("#HJM_torrent-group-id").val();
			var handjob = $("#handjobThread").is(":checked");

			var promises = [];
			if (iwetstatus === true) {
				let options = { url: "/encodeoffers.php", method: "POST" };
				let formdata = new FormData();
				formdata.append("AntiCsrfToken", AntiCsrfToken);
				formdata.append("Id", iwetid);
				formdata.append("action", "finish");
				formdata.append("TorrentLink", pl);
				options.data = formdata;

				let promise = ajax(options).then((res) => {
					return new Promise((resolve, reject) => {
						cache.update_encodeHistory().then(() => resolve(res));
					});
				});

				promises.push(promise);
			}

			if (reqstatus === true) {
				let options = { url: "/requests.php", method: "POST" };
				let formdata = new FormData();
				formdata.append("AntiCsrfToken", AntiCsrfToken);
				formdata.append("requestid", reqid);
				formdata.append("action", "takefill");
				formdata.append("link", pl);
				options.data = formdata;

				promises.push(ajax(options));
			}

			if (hsf === true) {
				var options = { url: "/forums.php", method: "POST" };
				var body = pl;
				var formData = new FormData();
				formData.append("AntiCsrfToken", AntiCsrfToken);
				formData.append("action", "reply");
				formData.append("thread", "28365");
				formData.append("body", body);
				formData.append("merge", "checked");
				options.data = formData;

				promises.push(ajax(options));
			}

			if (handjob === true) {
				{
					let options = { url: "/forums.php", method: "POST" };
					let body = pl;
					let formData = new FormData();
					formData.append("AntiCsrfToken", AntiCsrfToken);
					formData.append("action", "reply");
					formData.append("thread", "13617");
					formData.append("body", body);
					formData.append("merge", "checked");
					options.data = formData;

					promises.push(ajax(options));
				}

				{
					let options = { url: "/collages.php", method: "POST" };
					let body = pl;
					let formData = new FormData();
					formData.append("AntiCsrfToken", AntiCsrfToken);
					formData.append("action", "add_torrent");
					formData.append("collageid", collection.id);
					formData.append("url", pl);
					options.data = formData;

					promises.push(ajax(options));
				}
			}

			Promise.all(promises).then((res) => {
				$(".finish-encode-select-bar").prop("disabled", true);
				$(".finish-check").prop("disabled", true);
				var iwetData = {},
					reqData = {};
				var fail = 0;
				if (iwetstatus) {
					var json = JSON.parse(res[0]);
					iwetData = { status: json.Result, message: json.Message };
				}

				for (let a of res) {
					if (a.finalUrl && a.finalUrl.search(/requests.php/i) >= 0) {
						if (a.status != 200)
							reqData = {
								status: "error",
								code: a.status,
								message: "Refresh the page to see error message",
							};
						else reqData = { page: "requests", status: "done", code: 200 };
					}
				}
				if (iwetData.status) {
					if (iwetData.status.search(/ok/i) >= 0) {
						$("#select-finish-iwet").closest(".select-bar-container").removeClass("hide-check");
						$("#select-finish-iwet").html("<option>-- Encode offer has been finished --</option>");
					} else {
						fail++;
						$("#select-finish-iwet")
							.closest(".select-bar-container")
							.removeClass("hide-check")
							.addClass("fail");
						$("#select-finish-iwet").html(`<option>-- ${iwetData.message} --</option>`);
					}
				}
				if (reqData.status == "done") {
					$("#select-finish-request").closest(".select-bar-container").removeClass("hide-check");
					$("#select-finish-request").html("<option>-- Request has been filled --</option>");
				} else if (reqData.status == "error") {
					fail++;
					$("#select-finish-request")
						.closest(".select-bar-container")
						.removeClass("hide-check")
						.addClass("fail");
					$("#select-finish-request").html(`<option>-- Error: ${reqData.message} --</option>`);
				}
				if (hsf === true) {
					$("#select-finish-hsf").closest(".select-bar-container").removeClass("hide-check");
					$("#select-finish-hsf").html("<option>-- Application to complete: submitted --</option>");
				}
				var s = res.length > 1 ? "s" : "";
				if (fail > 0) {
					$("#finish-loader").fadeOut("fast", function () {
						$("#finish-check-status").addClass("fail").html("X").fadeIn("fast");
					});
					$("#HJM-finish-pl")
						.val(`-- ${fail} out of ${res.length} task${s} failed --`)
						.addClass("error-message");
				} else {
					$("#finish-loader").fadeOut("fast", function () {
						$("#finish-check-status").removeClass("fail").html("&check;").fadeIn("fast");
					});
					$("#HJM-finish-pl").val(`-- All ${res.length} task${s} completed --`);
				}
			});
		}
	}

	function getActiveRequests(link) {
		saveStack("getActiveRequests");
		return new Promise((resolve, reject) => {
			var requests = [];
			var options = { url: link, method: "GET" };
			var encodeOffers = [];
			var encData = [];
			let resData = [];

			ajax(options)
				.then((raw) => {
					let el = $("a#PermaLinkedTorrentToggler", raw);
					if (el.length === 0) return reject("Not a valid torrent group, or torrent id");
					let gpStatus =
						$(el)
							.prev("a")
							.html()
							.search(/quality.gif/i) >= 0
							? true
							: false;
					let encoded = $(el).text();
					if (encoded.search(/\d{3,4}x\d{3}/) >= 0) encoded = "dvd";
					else encoded = encoded.match(/\d{3,4}p/i)[0];
					let d1 = { type: "encoded", encoded: encoded };
					let d2 = { type: "gpStatus", gpStatus: gpStatus };
					encData.push(d1);
					encData.push(d2);

					if ($("table#encode-offers-table", raw).length >= 0) {
						$("table#encode-offers-table", raw)
							.find("tbody tr")
							.each(function () {
								let data = {
									type: "encodeOffer",
									id: $(this).attr("id").split("_").pop(),
								};
								data.userid = $(this).find("td:nth-child(2) a.username").attr("href").split("=")[1];
								data.time = $(this).find("td:nth-child(3)").text().trim();
								data.res = $(this).find("td:nth-child(1)").html().split("<span")[0].trim();
								encodeOffers.push(data);
							});
					}

					let reqs = [];
					if ($("table#requests", raw).length > 0) {
						$("table#requests", raw)
							.find("tbody tr")
							.each(function () {
								let info = $(this).find("td:nth-child(1)").html();
								let link = info.match(/(?:href=")(.*?)(?:")/i)[1].replace("&amp;", "&");
								reqs.push({ link: link, encoded: encoded });
							});
					}

					let promises = [];
					reqs.map((p) => {
						promises.push(loadRequestUrl("/" + p.link, p.encoded));
					});

					return Promise.all(promises);
				})
				.then((res) => {
					resData.push(...res);
					let data = resData.concat(encodeOffers);
					data = data.concat(encData);
					resolve(data);
				});
		});
	}

	function editUploadTemplate() {
		saveStack("editUploadTemplate");
		UIlock = true;
		setTimeout(() => {
			$("#UI-padlock-icon").show();
		}, 300);
		var template = cache.settings.template ? cache.settings.template : defaultTemplate;
		var html = `<div class="back-button" title="Return to Menu">&laquo;</div><div style="flex-flow: column" class="HJ-toolkit-member-toolbar-flex"><h1>Edit Upload Template</h1>
<div id="HJM-template-container">
<div id="Bbcode_Template_Toolbar">
                <div title="Bold (Ctrl+B)" class="bbcode-toolbar__button js-bbcode-toolbar__bold-button" style="background-position: -72px 0;"></div>
                <div title="Italic (Ctrl+I)" class="bbcode-toolbar__button js-bbcode-toolbar__italic-button" style="background-position: -288px 0;"></div>
                <div title="Underline (Ctrl+U)" class="bbcode-toolbar__button js-bbcode-toolbar__underline-button" style="background-position: -578px 0;"></div>
                <div title="Strikethrough (Ctrl+S)" class="bbcode-toolbar__button js-bbcode-toolbar__strikethrough-button" style="background-position: -542px 0;"></div>
                <div title="Link (Ctrl+H or Ctrl+K)" class="bbcode-toolbar__button js-bbcode-toolbar__link-button" style="background-position: -324px 0;"></div>
                <div title="Hide" class="bbcode-toolbar__button js-bbcode-toolbar__hide-button" style="background-position: -216px 0;"></div>
                <div title="Spoiler" class="bbcode-toolbar__button js-bbcode-toolbar__spoiler-button" style="background-position: -504px 0; width: 26px;"></div>
                <div title="Size" class="bbcode-toolbar__button js-bbcode-toolbar__size-button" style="background-position: -468px 0;"></div>
                <div title="Color" class="bbcode-toolbar__button js-bbcode-toolbar__color-button" style="background-position: -144px 0;"></div>
                <div title="MediaInfo" class="bbcode-toolbar__button js-bbcode-toolbar__mediainfo-button" style="background-position: -396px 0;"></div>
                <div title="Align center (Ctrl+Shift+E)" class="bbcode-toolbar__button js-bbcode-toolbar__align-center-button" style="background-position: 0 0;"></div>
                <div title="Align right (Ctrl+Shift+R)" class="bbcode-toolbar__button js-bbcode-toolbar__align-right-button" style="background-position: -36px 0;"></div>
                <div title="Code" class="bbcode-toolbar__button js-bbcode-toolbar__code-button" style="background-position: -108px 0;"></div>
                <div title="List" class="bbcode-toolbar__button js-bbcode-toolbar__list-button" style="background-position: -360px 0;"></div>
                <div title="Screenshot comparison" class="bbcode-toolbar__button js-bbcode-toolbar__comparison-button" style="background-position: -665px 0;"></div>
                <div id="handjob-hr-icon" class="bbcode-toolbar__button" title="Horizontal rule" style="background-image: url(${icons.horizontalRule}); background-repeat: no-repeat; background-position: center center; background-size: cover;"></div>
                <div style="clear: both"></div>
            </div>
<textarea class="noresize fullX" style="height: 110px;font-size: 11.5px;" id="HJMuploadTemplate" name="uploadTemplate" placeholder="Enter your upload template here">${template}</textarea>
<div id="HJM-template-save-icon" class="HJ-hover" title="Save Template"></div>
<div style="display: block;right: 15px;top:calc(50%);width:40px;height:40px;line-height:40px;font-size:25px;" class="HJM-submit-checkmark HJM-fade" id="template-check">&check;</div>
</div></div>`;

		$(".HJMcontainer2").html(html);
		disableToolbar(true);
		var handjobToolbar = new BbcodeToolbar("#HJMuploadTemplate", "#Bbcode_Template_Toolbar");

		$(".HJMcontainer").css("margin-left", -barWidth + "px");
		$(".HJMcontainer2").css("margin-left", "0px");

		$("#handjob-hr-icon").on("click", function () {
			var sel = $jq("#HJMuploadTemplate").getSelection();
			if (sel.length === 0) $jq("#HJMuploadTemplate").insertText("[hr]", sel.start, "collapseToEnd");
			else $jq("#HJMuploadTemplate").surroundSelectedText("[hr]", "[hr]");
			$("#HJMuploadTemplate").focus();
			return false;
		});

		$("#HJM-template-save-icon").on("click", function () {
			cache.settings.template = $("#HJMuploadTemplate").val();
			cache.updateSettings();
			$("#template-check").addClass("HJM-fadeIn");
			setTimeout(() => $("#template-check").removeClass("HJM-fadeIn"), 2000);
		});

		$(".back-button").on("click", (e) => {
			setTimeout(() => {
				disableToolbar(false);
				$("HJMcontainer2").html("");
			}, 500);
			e.preventDefault();
			UIlock = false;
			$("#UI-padlock-icon").hide();
			$(".HJMcontainer").css("margin-left", "0px");
			$(".HJMcontainer2").css("margin-left", barWidth + "px");
		});
	}

	function disableToolbar(state) {
		//var array = ["js-bbcode-toolbar__link-button","js-bbcode-toolbar__size-button","js-bbcode-toolbar__color-button"];
		if (state) {
			toolbarClasses = [];
			$("#Bbcode_Toolbar")
				.find(".bbcode-toolbar__button")
				.each(function () {
					if (
						$(this).attr("title") &&
						$(this)
							.attr("title")
							.search(/handjob/i) < 0
					) {
						let ele = $(this).attr("class").split(" ")[1];
						if (ele) {
							let sh = ele.split("__")[1].replace("-button", "").replace("-", " ");
							let obj = { title: sh, class: ele };
							toolbarClasses.push(obj);
						}
					}
				});
			for (let x of toolbarClasses) {
				$("#Bbcode_Toolbar")
					.find("." + x.class)
					.removeClass(x.class);
			}
		} else {
			$("#Bbcode_Toolbar")
				.find(".bbcode-toolbar__button")
				.each(function () {
					if ($(this).attr("title")) {
						for (let x of toolbarClasses) {
							let reg = new RegExp(x.title, "i");
							if ($(this).attr("title").search(reg) >= 0) $(this).addClass(x.class);
						}
					}
				});
		}
	}

	function HJM_setToolbarSwitches() {
		saveStack("HJM_setToolbarSwitches");
		return new Promise((resolve, reject) => {
			if (cache.settings.rank) document.querySelector("#switch-HJMsettings-rank").checked = true;
			else document.querySelector("#switch-HJMsettings-rank").checked = false;

			if (cache.settings.active) document.querySelector("#switch-HJMsettings-active").checked = true;
			else document.querySelector("#switch-HJMsettings-active").checked = false;

			if (cache.settings.requests) document.querySelector("#switch-HJMsettings-requests").checked = true;
			else document.querySelector("#switch-HJMsettings-requests").checked = false;
			return resolve();
		});
	}

		function HJM_displayHJRank() {
			saveStack("HJM_displayHJRank");
			return new Promise(async (resolve, reject) => {
				if (!_hjm_access_token) return resolve();
				const posts = document.querySelectorAll(".forum_post:not(.forum-post--is-reply)");

			const shouldDisplayRanks = (() => {
				// No: if it's not a forum page
				if (/forums.php/i.test(window.location.href) === false) return false;
				// No: if displayRanks isn't enabled
				else if (!cache.settings.rank) return false;
				// Yes: if this is a HANDJOB forum thread and global functions aren't enabled
				else if (/threadid=(13617|28365|13644)([^0-9]|$)/i.test(window.location.href) || cache.settings.global)
					return true;
				// Yes: if anything else
				else return false;
			})();

			const options = {
				api: true,
				url: ROOT + "/membership/ranks/",
			};

			if (shouldDisplayRanks === false) return resolve();

			const userids = new Set();
			userids.add(user.userid);
			posts.forEach((post) => {
				const id = parseInt(post.querySelector("a.username").getAttribute("href").split("id=").pop(), 10);
				userids.add(id);
			});
			options.url += Array.from(userids).join(",");

			const { data: results } = await ajax(options).catch((e) => {
				console.log("There was an error connecting to the API. Some features may be unavailable.");
				return [];
			});

			if (!results || !Array.isArray(results) || results.length === 0) return resolve();

			const userData = {};
			results.forEach((item) => {
				userData[item.userid] = item;
			});

			const appendRank = ({ el, shortRank, fullRank, canApprove = false }) => {
				const check = canApprove
					? `<img src="/static/common/symbols/badge_checker.png" title="This member can approve encodes" class="handjob-approver">`
					: "";

				const node = document.createElement("div");
				node.className = "HJM-fade handjob-rank " + shortRank;
				node.innerHTML = `HANDJOB RANK: ${fullRank} ${check}`;
				el.querySelector(".forum-post__body").appendChild(node);
			};

			posts.forEach((post) => {
				const id = parseInt(post.querySelector("a.username").getAttribute("href").split("id=").pop(), 10);
				const data = userData[id];
				if (data)
					appendRank({
						el: post,
						shortRank: data.rank_short,
						fullRank: data.rank_full,
						canApprove: data.can_approve,
					});
			});
			$(".handjob-rank").addClass("HJM-fadeIn");
			$(".forum-post__bodyguard").addClass("expand-bodyguard");
			resolve();
		});
	}

		function HJM_loadAnnouncements() {
			saveStack("HJM_loadAnnouncements");
			return new Promise((resolve, reject) => {
				if (!_hjm_access_token) return resolve([]);
				ajax({
					api: true,
					url: ROOT + "/messages/inbox",
				})
					.then((result) => {
						resolve(result.data || []);
					})
					.catch((e) => {
						console.log("There was an error connecting to the API. Some features may be unavailable.");
						resolve([]);
					});
			});
		}

	function HJM_showAnnouncements(messages) {
		saveStack("HJM_showAnnouncements");
		return new Promise((resolve, reject) => {
				const messagesBadge = document.querySelector(".HJ-toolkit-member-toolbar-announcements-alert");
				const el = document.querySelector(".HJ-toolkit-member-toolbar-announcements");
				messages = Array.isArray(messages) ? messages : [];

			const updateMessages = function (inbox) {
				if (inbox.length > 0) messagesBadge.setAttribute("data-notifications", inbox.length);
				else messagesBadge.removeAttribute("data-notifications");
				let html = "";

				for (let i = 0; i < inbox.length; i++) {
					html += `<div class="BS-alert BS-alert-${inbox[i].theme} hj-message-bar" data-message-id="${inbox[i].message_id}">
								${inbox[i].subject}
								<div class="delete-alert" title="Delete Notification">
									&times;
								</div>
							</div>`;
				}
				el.innerHTML = html;
				el.style.display = "block";
			};

			const readMessage = (id) => {
				return ajax({
					api: true,
					url: ROOT + "/messages/" + id,
				})
					.then((message) => {
						return message;
					})
					.catch((e) => {
						console.log(e);
					});
			};

			const deleteMessage = (id) => {
				const answer = confirm("Are you sure you want to delete this message? This cannot be undone.");
				if (answer === true) {
					return ajax({
						api: true,
						url: ROOT + "/messages/" + id,
						method: "DELETE",
					}).then((response) => {
						return response;
					});
				} else return false;
			};

			const messageHandler = async (ev) => {
				const isDelete = ev.target.closest(".delete-alert") ? true : false;
				const messageId = ev.target.closest(".hj-message-bar")?.dataset?.messageId;

				if (isDelete === true) {
					const inbox = await deleteMessage(messageId);
					if (inbox) updateMessages(inbox);
				} else if (!messageId) return false;
				else {
					const message = await readMessage(messageId);
					HJMModal.update({
						mode: "notification",
						theme: message.theme,
						title: message.subject,
						body: message.body,
					});
				}
			};

			updateMessages(messages);
			el.addEventListener("click", messageHandler);
			resolve();
		});
	}

	function HJMlightbox(html, exclude = false) {
		const eventLightOpen = new CustomEvent("lightboxOpen", {
			bubbles: true,
			cancelable: true,
		});
		const eventLightClose = new CustomEvent("lightboxClose", {
			bubbles: true,
			cancelable: true,
		});
		document.body.dispatchEvent(eventLightOpen);

		let tempUIlock = UIlock;
		UIlock = true;
		$("#UI-padlock-icon").show();
		var scroll = $("html").scrollTop() ? $("html").scrollTop() : $("body").scrollTop();
		$("body").css("top", -scroll);
		let lb = $("#lightbox");
		$(lb).html(html).removeClass("hidden");
		$("#lightbox__shroud").removeClass("hidden");
		$("body").addClass("lightbox__scroll-lock");
		$(lb)
			.unbind()
			.on("click", function (e) {
				if ($(e.target).parents(".lightbox-hsf").length > 0 || $(e.target).hasClass("lightbox-hsf")) return;
				$(lb).removeClass("flex-centre");
				if ($("#handjob-guide-overlay").is(":visible")) return;
				if ($(e.target).parents("#handjob-guide-overlay").length > 0) return;
				if ($(e.target).is("button, button div, a")) return;
				if (exclude) {
					if (!$(e.target).is("div.lightbox")) {
						return;
					}
				}
				UIlock = tempUIlock;
				if (!UIlock) $("#UI-padlock-icon").hide();
				$(lb).html("").addClass("hidden").removeClass("expandlb");
				$("#lightbox__shroud").addClass("hidden");
				$("body").removeClass("lightbox__scroll-lock");
				$("html,body").scrollTop(scroll);
				document.body.dispatchEvent(eventLightClose);
			});
	}

	function HJM_loadEncodeHistory() {
		saveStack("HJM_loadEncodeHistory");
		return new Promise((resolve, reject) => {
			var force = false;

			if (cache.settings.forceRefresh === true) {
				force = true;
				cache.settings.forceRefresh = false;
				cache.updateSettings();
			}

			cache.load("encodeHistory");
			let ccReturn = cache.checkCache("encodeHistory");
			if (cache.data.encodeHistory && ccReturn && !force) {
				processActive();
			} else {
				cache
					.update_encodeHistory()
					.then(() => cache.benchEncodes())
					.then(() => processActive())
					.catch((e) => console.log(e));
			}

			function processActive() {
				if (
					window.location.href.search(/forums.php(.*?)threadid=(13617|28365|13644)([^0-9]|$)/i) < 0 &&
					!cache.settings.global
				)
					return resolve();
				if (window.location.href.search(/forums.php/i) < 0) return resolve();
				cache.data.encodeHistory.sort(function (a, b) {
					var aTime = new Date(a.time).getTime();
					var bTime = new Date(b.time).getTime();
					return aTime - bTime;
				});
				cache.save("encodeHistory");
				if (!cache.settings.active) return resolve();
				$(".forum_post").each(function () {
					addFooter($(this));
					var userid = $(this).find("a.username").attr("href");
					userid = userid.split("id=")[1];
					if (!userid) userid = $(this).find("a.username").attr("data-userid");
					var encodes = [];
					for (var x of cache.data.encodeHistory) {
						if (userid == x.userid) {
							var relative = relativeDate(x.time);
							encodes.push(
								`<a href="${x.link}">${x.title}</a> [${x.year}] – ${x.res} – <span title="${new Date(
									x.time + " GMT"
								)}">started ${relative}</span>`
							);
						}
					}
					var encString = encodes.join("<br>");
					$(this).find(".forum-post__footer-body").html(encString);
					if (!encString) $(this).find(".forum-post__footer").remove();
				});
				$(".forum-post__footer").addClass("show-footer");
				resolve();
			}

			function addFooter(el) {
				$(el).append(`<div class='forum-post__footer fullX'>
                            <div class="forum-post__footer-container">
                              <div class='forum-post__footer-header'>Encoding:</div>
                              <div class='forum-post__footer-body'></div>
                            </div>
                          </div>`);
			}
		});
	}

	function relativeDate(input, short = false) {
		input += " GMT+0000";
		let local = new Date();
		let current = local.getTime();
		current = Math.floor(current / 1000);
		input = new Date(input).getTime();
		input = Math.floor(input / 1000);
		let diff = current - input;
		var d = Math.floor(diff / 86400);
		var h = Math.floor((diff % 86400) / 3600);
		var m = Math.floor(((diff % 86400) % 3600) / 60);
		var s = Math.floor(((diff % 86400) % 3600) % 60);
		[d, h, m, s].map((x) => (!x ? 0 : x));

		var disp = [];
		if (d) disp.push(d + (d == 1 ? " day" : " days"));
		if (h && short) disp.push(h + (h == 1 ? " hr" : " hrs"));
		else if (h) disp.push(h + (h == 1 ? " hour" : " hours"));
		if (m && short) disp.push(m + (m == 1 ? " min" : " mins"));
		else if (m) disp.push(m + (m == 1 ? " minute" : " minutes"));
		if (s && short) disp.push(s + (s == 1 ? " sec" : " secs"));
		else if (s) disp.push(s + (s == 1 ? " second" : " seconds"));
		disp.map((x) => x.replace("undefined", "0"));
		if (!disp[1]) return disp[0] + " ago";
		else return disp[0] + ", " + disp[1] + " ago";
	}

	function ajax(options) {
		if (!GM_getValue("HJM_last_ajax")) GM_setValue("HJM_last_ajax", 0);
		return new Promise((resolve, reject) => {
			let interval;
			if (!options.method) options.method = "GET";
			if (/^(\/|http|pass)/i.test(options.url) === false) options.url = "/" + options.url;

			if (options.api === true && !options.headers) {
				options.headers = {
					"Content-Type": "application/json",
					Accept: "application/json",
				};
				if (_hjm_access_token) options.headers.Authorization = "Bearer " + _hjm_access_token;
				return executeFetchAjax();
			}

			interval = setInterval(() => {
				console.log("Delaying Ajax Request for " + options.url);
				if (GM_getValue("HJM_last_ajax") < new Date().getTime() - cache.delay) executeFetchAjax();
			}, 50);

			function executeFetchAjax() {
				if (interval) {
					clearInterval(interval);
					GM_setValue("HJM_last_ajax", new Date().getTime());
				}
				logAjax();

				fetch(options.url, {
					method: options.method,
					headers: options.headers,
					body: options.data,
					credentials: "include",
				})
					.then((res) => {
						if (options.headers && options.headers.Accept === "application/json") return res.json();
						else return res.text();
					})
					.then((res) => {
						if (res && res.accessToken && res.loggedOut !== true) {
							_hjm_access_token = res.accessToken;
							GM_setValue("HJMaccessToken", res.accessToken);
						} else if (res.loggedOut === true) {
							GM_deleteValue("HJMaccessToken");
							res.data = [];
						}
						resolve(res);
					})
					.catch((e) => {
						console.log(typeof e.json);
						reject(options);
					});
			}
		});

		function logAjax() {
			if (!cache.settings.debug) return false;
			let local = new Date();
			let df = `${local.getFullYear()}-${zeroDate(local.getMonth() + 1)}-${zeroDate(local.getDate())} ${zeroDate(
				local.getHours()
			)}:${zeroDate(local.getMinutes())}:${zeroDate(local.getSeconds())}.${local.getMilliseconds()}`;
			let logline =
				df +
				": HJM Ajax to " +
				options.url +
				"\n[indent]via " +
				previousFunctions.slice().reverse().join("\n~> ") +
				"[/indent]";
			cache.log(true, logline);
		}
	}

	function zeroDate(d) {
		if (d < 10) return "0" + d;
		else return d;
	}

	function saveStack(fn) {
		previousFunctions.push(fn);
		previousFunctions = previousFunctions.slice(-6);
	}

	function HJM_errorMessage(eMessage, e) {
		$("#HJM-error-message").html(eMessage);
		$("#HJM-error-message-bar").addClass("show-error-message");
		console.log(e);
		console.log(e.stack);
	}

	function HJM_requestLinks() {
		saveStack("HJM_requestLinks");
		return new Promise((resolve, reject) => {
			if (cache.settings.requests === false) return resolve();
			if (
				window.location.href.search(/forums.php(.*?)threadid=(13617|28365|13644)([^0-9]|$)/i) < 0 &&
				!cache.settings.global
			)
				return resolve();
			else if (window.location.href.search(/forums.php/i) < 0) return resolve();

			$('a[href*="requests.php?action=view"]:not(blockquote a)').each(function () {
				$(this).after("<div class='encode-this'>&#x21E9</div>");
			});

			$(".encode-this").on("click", function () {
				if ($(this).html() == "⇧") $(this).html("⇩");
				else $(this).html("⇧");
				loadRequestForm($(this));
			});
			resolve();
		});
	}

	function getPTPRank() {
		saveStack("getPTPRank");
		return new Promise((resolve, reject) => {
			cache.updateTimer("ptpRank");
			cache.load("ptpRank");
			var ccReturn = cache.checkCache("ptpRank");

			if (ccReturn && cache.data.ptpRank) {
				resolve();
			} else {
				cache.update_ptpRank().then(() => resolve());
			}
		});
	}

	function HJM_scholarshipLinks() {
		saveStack("HJM_scholarshipLinks");
		return new Promise((resolve, reject) => {
			if (window.location.href.search(/torrents.php/i) < 0) return resolve();

			getPTPRank()
				.then(() => {
					if (cache.data.ptpRank.search(/vip|user|member|poweruser/i) < 0) return resolve();

					$("#torrent-table")
						.find(".group_torrent_header .torrent-info-link")
						.each(function () {
							if (
								$(this)
									.text()
									.search(/bd50|bd25|dvd5|dvd9|remux/i) >= 0
							) {
								let torrentid = $(this)
									.attr("onclick")
									.match(/(?:#torrent_)(\d+)/)[1];
								let groupid = $(this)
									.attr("onclick")
									.match(/(?:show_description\(')(\d+)/)[1];
								let el = $(this)
									.closest("td")
									.find(".basic-movie-list__torrent__action")
									.html()
									.split("|");
								let size = $(this).closest("td").next("td").text();
								el.splice(
									1,
									0,
									`<a href="#" class="HSF_inline_application" data-size="${size}" data-groupid="${groupid}" data-torrentid="${torrentid}" title="Apply for HANDJOB Scholarship Grant">HSF</a>`
								);
								$(this).closest("td").find(".basic-movie-list__torrent__action").html(el.join(" | "));
							}
						});

					$(".HSF_inline_application").on("click", function () {
						let data = {
							size: $(this).attr("data-size"),
							groupid: $(this).attr("data-groupid"),
							torrentid: $(this).attr("data-torrentid"),
						};
						$("#lightbox").addClass("flex-centre");
						var res = ["DVDRip", "480p", "576p", "720p", "1080p"];
						let insert = "";
						for (let x of res) {
							insert += `<input class="hsf-checkbox hsf-res-checkbox" type="checkbox" id="hsf-check-${x.toLowerCase()}" value="1"> <label for="hsf-check-${x.toLowerCase()}">${x}</label>`;
						}

						let html = `<div class="lightbox-hsf"><h2><img src="${logos.scholarshipFund}"></h2>
<div class="HSF-input-form">
    <div class="HJM-request-row" style="justify-content: center;padding-bottom: 20px;"><span>Sending grant request for ${data.size}</span></div>
    ${insert}
    <div class="HJM-request-row" id="hsf-iwet-break"><input class="hsf-checkbox" type="checkbox" id="hsf-iwet-send" value="1" checked="checked"> <label for="hsf-iwet-send">Add as 'Currently Encoding'</label></div>
    <div class="HJM-request-row" style="position:relative;">
        <button type="button" data-size="${data.size}" data-id="${data.groupid}" data-torrentid="${data.torrentid}" id="hsf-post-button">Post Grant Request</button>
        <div class="HJM-submit-checkmark" id="hsf-check">&check;</div>
        <div class="HJM-submit-loader" id="hsf-loader"></div>
    </div>
    <div class="HJM-request-row BS-alert-danger BS-alert flex-centre" id="hsf-iwet-error">Error Message</div>
</div>
</div>`;
						HJMlightbox(html);

						$("#hsf-post-button").on("click", function () {
							let title = $("h2.page__title").text();
							let filmYear = title.match(/\[\d{4}\]/)[0];
							let filmTitle = title.split(/\[\d{4}\]/)[0].trim();
							var data = {
								size: $(this).attr("data-size"),
								id: $(this).attr("data-id"),
								torrentid: $(this).attr("data-torrentid"),
							};
							$("#hsf-check").hide().removeClass("fail").html("&check;");
							$("#hsf-loader").fadeIn("fast");
							var fail = true;
							$(".hsf-res-checkbox").each(function () {
								if ($(this).is(":checked")) fail = false;
							});
							if (fail) {
								processError("You haven't selected a resolution to encode");
								return reject();
							}
							if ($("#hsf-iwet-send").is(":checked")) {
								var format, group;
								$(".hsf-res-checkbox").each(function () {
									if ($(this).is(":checked")) format = $(this).attr("id").split("-").pop();
								});
								if (format == "dvdrip") format = "dvd";
								else format = format.replace("p", "");
								group = $("#hsf-post-button").attr("data-id");
								HJM_encodeThis({
									format,
									groupid: group,
									comment: "HANDJOB",
									title: filmTitle,
									year: filmYear,
								})
									.then((res) => {
										addToScholarship();
									})
									.catch((ret) => {
										let proceed = processError(ret);
										if (proceed) {
											addToScholarship();
											resolve();
										} else reject();
									});
							} else addToScholarship();

							function addToScholarship() {
								$("#hsf-iwet-error").slideUp("fast").html();
								let checkVal = {},
									chstr = [],
									end = "";
								$(".hsf-checkbox").each(function () {
									let cid = $(this).attr("id").split("-").pop();
									if (cid === "send") return true;
									cid = cid.replace("dvdrip", "DVDRip");
									checkVal[cid] = $(this).is(":checked") ? true : false;
								});
								for (let key in checkVal) {
									if (checkVal[key]) chstr.push(key);
								}
								if (chstr.length > 1) end = "encodes";
								else end = "encode";
								chstr = chstr.join(", ");
								chstr = chstr.replace(/,\s(?=[^,]*$)/, " and ") + " " + end;
								let options = { url: "/forums.php", method: "POST" };
								let body = `https://passthepopcorn.me/torrents.php?id=${data.id}&torrentid=${data.torrentid}\n${data.size}\n${chstr}`;
								let formData = new FormData();
								formData.append("AntiCsrfToken", AntiCsrfToken);
								formData.append("action", "reply");
								formData.append("thread", "28365");
								formData.append("body", body);
								formData.append("merge", "checked");
								options.data = formData;

								ajax(options).then((res) => {
									$("#hsf-loader").fadeOut("fast", function () {
										$("#hsf-check").fadeIn("fast");
									});
								});
							}
						});
					});
					resolve();
					function processError(ret) {
						let format;

						cache.load("currentlyEncoding");
						format = ret.data.format === "dvd" ? "DVDRip" : ret.data.format + "p";
						let dupe = false;
						for (let x of cache.data.currentlyEncoding.bench) {
							if (ret.data.groupid == x.id && format == x.res) {
								dupe = true;
							}
						}
						if (!dupe) {
							cache.data.currentlyEncoding.bench.push({
								id: ret.data.groupid,
								title: ret.data.title,
								year: ret.data.year,
								res: format,
								comment: ret.data.comment,
							});
							cache.save("currentlyEncoding");
							return true;
						}

						$("#hsf-loader").fadeOut("fast", function () {
							$("#hsf-check").addClass("fail").html("X").fadeIn("fast");
							$("#hsf-check.fail").on("click", function () {
								$("#hsf-iwet-error").slideUp("fast");
								$(this).fadeOut("fast", function () {
									$(this).removeClass("fail").html("&check;");
								});
							});
						});
						$("#hsf-iwet-error").html(ret.error).slideDown("fast");
						return false;
					}
				})
				.catch((e) => console.log(e));
		});
	}

	function loadRequestUrl(url, enc) {
		saveStack("loadRequestUrl");
		return new Promise((resolve, reject) => {
			var options = { url, method: "GET" };
			ajax(options)
				.then((raw) => {
					let data = {};
					data.Link = $("h2.page__title", raw).find('a[href*="torrents.php"]').attr("href");
					$("#request-table tbody", raw)
						.find("tr")
						.each(function () {
							if ($(this).find("td:first-child").text().search(/vote/i) < 0) {
								if ($(this).find("td").length > 1) {
									data[$(this).find("td:first-child").text().trim()] = $(this)
										.find("td:nth-child(2)")
										.html()
										.trim();
								}
							}
						});
					if ($("#request-table tbody", raw).find("tr:last").find("td").length == 1) {
						data.Description = $("#request-table tbody", raw).find("td:last").html();
					}
					data.encoded = enc;
					for (let key in data) {
						data[key] = data[key].replace(/\s{2,}/, " ");
					}
					url = url.split("id=")[1];
					let processed = {
						comment: data.Description,
						reqid: url,
						codec: data["Acceptable codecs"],
						container: data["Acceptable containers"],
						res: data["Acceptable resolutions"],
						bounty: data["Bounty"],
						gp: data["Golden Popcorn only"],
						sources: data["Acceptable sources"],
						encoded: data.encoded,
					};
					resolve(processed);
				})
				.catch((e) => console.log(e));
		});
	}

	function loadRequestForm(el) {
		saveStack("loadRequestForm");
		var orel = el;
		el = $(el).prev('a[href*="requests.php?action=view"]');
		var reqForm = $(orel).parent().is("span") ? $(orel).parent("span") : orel;
		if (reqForm.next(".HJM-request-form").length > 0) {
			reqForm.next(".HJM-request-form").slideToggle("fast");
			return true;
		}

		let options = {};
		options.url = $(el).attr("href");
		options.method = "GET";

		ajax(options).then((raw) => {
			let data = {};
			data.Film = $(el).text().split(" > ").pop();
			data.Link = $("h2.page__title", raw).find('a[href*="torrents.php"]').attr("href");
			if (!data.Link) {
				insertRequestFormFail(
					reqForm,
					"'I Will Encode This' is only available for films with a valid PTP torrent group"
				);
				return false;
			}
			data.groupid = data.Link.match(/id=(\d*)/i)[1];

			$("#request-table tbody", raw)
				.find("tr")
				.each(function () {
					if ($(this).find("td:first-child").text().search(/vote/i) < 0) {
						if ($(this).find("td").length > 1) {
							data[$(this).find("td:first-child").text().trim()] = $(this)
								.find("td:nth-child(2)")
								.html()
								.trim();
						}
					}
				});
			if ($("#request-table tbody", raw).find("tr:last").find("td").length == 1) {
				data.Description = $("#request-table tbody", raw).find("td:last").html();
			}

			insertRequestForm(orel, data, reqForm, orel);
		});
	}

	function insertRequestFormFail(el, text) {
		var html = `<div class='HJM-request-row css-slide css-slide-closed' style='justify-content:center; display:none;'><div class='HJM-request-alert' style="display: block;">${text}</div></div>`;
		$(el)
			.unbind()
			.on("click", function () {
				$(this).next(".HJM-request-row").toggleClass("css-slide-closed");
				$(el).html("X");
			});
		$(el).after(html);
		$(el).next(".HJM-request-row").show().removeClass("css-slide-closed");
		$(el).css("background", "red");
	}

	function insertRequestForm(el, data, reqForm, orel) {
		saveStack("insertRequestForm");
		var torrentId = data.Link.split("id=")[1];
		var reg = new RegExp("=" + torrentId + "(D|$)", "g");
		var alertText = [];
		var warning = false;
		for (let x of cache.data.encodeHistory) {
			if (x.link.search(reg) >= 0) {
				let error = `<a href="/user.php?id=${x.userid}" title="Started ${relativeDate(x.time)}">${
					x.username
				}</a> currently has a ${x.res} encode in progress`;
				alertText.push(error);
				warning = true;
			}
		}
		let res = data["Acceptable resolutions"].split(",");
		let acc = data["Acceptable resolutions"];
		if (acc.search(/other/i) >= 0 || acc.search(/any/i) >= 0) res[0] = "dvd";
		else if (data["Acceptable sources"] == "DVD") res[0] = "dvd";
		else res[0] = parseInt(res[0]);
		let filmYear = data.Film.match(/\[\d{4}\]/)[0];
		let filmTitle = data.Film.split(/\[\d{4}\]/)[0].trim();
		let iwet = `<form class="HJM-IWET-form">
                    <div style="position: relative; display: initial;">
                        <select name="format" class="request-format-select">
                            <option value="dvd">DVDRip</option>
                            <option value="480">480p Blu-Ray</option>
                            <option value="576">576p Blu-Ray</option>
                            <option value="720">720p Blu-Ray</option>
                            <option value="1080">1080p Blu-Ray</option>
                        </select>
                        <div class="request-format-help help-tip" style="top: calc(50% - 10px);right: -27px;display:none;">
                            <p>A note designating DVD or 480p will be inserted into your Encode This comment for an SD x264 encode</p>
                        </div>
                    </div>
                    <div style="width: 100%; margin: 0 10px;">Comment:</div>
                    <textarea rows="3" name="comment">HANDJOB</textarea>
                    <button type="submit">I Will Encode This</button>
                    <input type="hidden" name="groupid" value="${data.groupid}">
                    <input type="hidden" name="title" value="${filmTitle}">
                    <input type="hidden" name="year" value="${filmYear}">
                </form>`;
		var html = `<div class="HJM-request-container"><div class="HJM-request-IWET">${iwet}<div class="HJM-submit-checkmark iwet-check">&check;</div><div class="HJM-submit-loader iwet-loader"></div></div><div class="HJM-request-info">`;
		delete data["Fill request"];
		let array = ["Category", "Acceptable resolutions", "Acceptable sources", "Bounty"];
		for (let i = 0; i < array.length; i++) {
			html += `<div class="HJM-request-row">
                     <div class="HJM-col">${array[i]}</div>
                     <div class="HJM-col">${data[array[i]]}</div>
                 </div>`;
		}
		if (data.Description) html += "<div class='HJM-request-row HJM-request-comment'>" + data.Description + "</div>";
		html += "</div></div>";
		var imdb, sourceTorrent;
		if (data["Source torrent"]) sourceTorrent = data["Source torrent"].match(/"(.*?)"/i)[1];
		else sourceTorrent = "";

		if (sourceTorrent)
			sourceTorrent =
				"<a href='" +
				sourceTorrent +
				"' class='HJ-hover' title='Source Torrent'><img src='" +
				icons.disc +
				"'></a>";

		if (data["IMDb link"])
			imdb = `<a href="${data["IMDb link"].replace(
				/(<([^>]+)>)/gi,
				""
			)}" class='HJ-hover' title='IMDb Link'><img src="${icons.imdb}"></a>`;
		else imdb = "";

		var insert = `<div class='HJM-request-form'><h1><a href='${data.Link}' title="PTP Torrent Group">${data.Film}</a>${imdb}${sourceTorrent}</h1>${html}<div class='HJM-request-row' style='justify-content:center'><div class='HJM-request-alert'></div></div></div>`;
		reqForm.after(insert);
		if (res[0] == "dvd" || res[0] == "480")
			reqForm.next(".HJM-request-form").find("select").next(".request-format-help").fadeIn("fast");
		else reqForm.next(".HJM-request-form").find("select").next(".request-format-help").fadeOut("fast");

		reqForm.next(".HJM-request-form").find("select").val(res[0]);
		$(".request-format-select").on("change", function () {
			if ($(this).val() == "dvd" || $(this).val() == "480") $(this).next(".request-format-help").fadeIn("fast");
			else $(this).next(".request-format-help").fadeOut("fast");
		});

		var z = reqForm.next(".HJM-request-form").find(".HJM-request-alert");
		if (data.Filled) {
			let h = data.Filled.match(/<a href="(.*?)">/i)[1];
			let t = $(data.Filled)
				.text()
				.replace(/\s{2,}/g, " ")
				.trim();
			alertText.push(
				`Request has already been <a href="${h}" title="${t}" class="HJM-request-alert-link">filled</a>`
			);
		}
		if (data["Golden Popcorn only"].search(/no/i) < 0) alertText.push("This request is Golden Popcorn only");
		if (data["Acceptable codecs"].search(/x264|any/i) < 0) alertText.push("Request doesn't include the x264 codec");
		if (data["Acceptable containers"].search(/mkv|any/i) < 0)
			alertText.push("Request doesn't include .mkv container");
		if (data["Acceptable sources"] == "DVD" && data["Acceptable resolutions"].search(/other|any/i) < 0)
			alertText.push("Unfillable: no 'Other' resolution for DVD source");
		if (warning && alertText.length == 1) z.addClass("BS-alert-warning");
		z.html(alertText.join("<br><br>"));
		if (z.html()) z.show();
		reqForm.next(".HJM-request-form").slideDown("fast");

		$(".HJM-request-form h1").on("click", function (e) {
			if ($(e.target).is("a,img")) {
				return;
			} else {
				$(this)
					.parent()
					.slideUp("fast", function () {
						$(orel).html("⇩");
					});
			}
		});

		$(".HJM-IWET-form").on("submit", function (e) {
			e.preventDefault();
			var el = $(this);
			var loader = $(el).nextAll(".iwet-loader");
			var check = $(el).nextAll(".iwet-check");
			$(loader).fadeIn("fast");
			$(this).find('button[type="submit"]').prop("disabled", true);
			var form = $(this).serializeArray();
			var formObj = {};

			for (let i = 0; i < form.length; i++) {
				formObj[form[i].name] = form[i].value;
			}

			HJM_encodeThis(formObj)
				.then((res) => {
					$(loader).fadeOut("fast", function () {
						$(check).fadeIn("fast");
					});
				})
				.catch((ret) => {
					let benchAdd = false,
						format;

					cache.load("currentlyEncoding");
					format = ret.data.format === "dvd" ? "DVDRip" : ret.data.format + "p";
					let dupe = false;
					for (let x of cache.data.currentlyEncoding.bench) {
						if (ret.data.groupid == x.id && format == x.res) {
							dupe = true;
						}
					}
					if (!dupe) {
						cache.data.currentlyEncoding.bench.push({
							id: ret.data.groupid,
							title: ret.data.title,
							year: ret.data.year,
							res: format,
							comment: ret.data.comment,
						});
						cache.save("currentlyEncoding");
						benchAdd = true;
					}

					$(loader).fadeOut("fast", function () {
						$(check)
							.addClass("fail")
							.html("X")
							.fadeIn("fast", function () {
								var html = "";
								var match = ret.error.match(/<a href(.*?)<\/a>(<br(.*?)>)?/g);
								if (match.length >= 1) {
									var int = ret.error.split("<a href")[0];
									var html = int + "<ul><li>";
									html += match.join("</li><li>") + "</li></ul>";
									html += benchAdd
										? `<span>The offer for ${ret.data.title} has been added to your bench instead`
										: "";
								} else html = ret.error;
								$(el)
									.closest(".HJM-request-form")
									.find(".HJM-request-alert")
									.after(
										`<div class='HJM-request-alert BS-alert-danger' style='margin-top: 5px'>${html}</div>`
									);
								$(el).closest(".HJM-request-form").find(".HJM-request-alert").last().slideDown("fast");
								setTimeout(function () {
									$(el).find('button[type="submit"]').prop("disabled", false);
									$(check).fadeOut("fast", () => {
										$(check).removeClass("fail").html("&check;");
									});
								}, 2000);
							});
					});
				});
		});
	}

	// USED BY HSF LINKS AND REQUEST QUICKFORMS

	function HJM_encodeThis(data) {
		saveStack("HJM_encodeThis");
		return new Promise((resolve, reject) => {
			var format = data.format,
				comment = "",
				backup = {};
			if (format == "dvd") {
				format = "SdX264";
				comment = "(DVDRip) ";
			} else if (format == "480") {
				format = "SdX264";
				comment = "(480p Encode) ";
			} else if (format == "576") format = "Sd576p";
			else format = "Hd" + format + "p";

			let options = { url: "/encodeoffers.php", method: "POST" };
			let formData = new FormData();
			formData.append("AntiCsrfToken", AntiCsrfToken);
			formData.append("action", "add");
			formData.append("Format", format);
			formData.append("GroupId", data.groupid);
			formData.append("Comment", comment + data.comment);
			options.data = formData;

			ajax(options).then((res) => {
				let json = JSON.parse(res);
				let error = json.Result == "Error" ? json.Message : false;
				if (error) reject({ error, data });
				else resolve();
			});
		});
	}

	function HJM_loadMenuLinks() {
		return new Promise((resolve, reject) => {
			var html = `<ul>
<li><a href="https://passthepopcorn.me/forums.php?action=viewthread&threadid=13617&gotolastread=1">Official HANDJOB Forum</a></li>
<li><a href="forums.php?action=viewthread&threadid=28365">The HANDJOB Scholarship Fund</a></li>
<li><a href="forums.php?action=viewthread&threadid=13644">Request a HANDJOB</a></li>
<li><a href="collages.php?id=${collection.id}">HANDJOB ${collection.year}: ${collection.title}</a></li>
<li class="li-break"><a href="wiki.php?action=article&id=263">The HANDJOB Guide</a></li>
<li><a href="wiki.php?action=article&id=224">The HANDJOB Guide to DVD encodes for Mac</a></li>
<li><a href="wiki.php?action=article&id=244">The HANDJOB Guide to Blu-Ray encodes for Mac</a></li>
</ul>`;
			try {
				$(".HJ-toolkit-member-toolbar-links").html(html);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

		function HJM_loadMemberToolbar() {
			HJM_setToolbarHeight();
			$(".HJ-toolkit-member-toolbar").fadeToggle("fast");
		var delay = 1000,
			setTimeoutConst;
		$(".HJ-toolkit-member-toolbar").on("mouseleave", function (ev) {
			const over = ev.target.tagName.toLowerCase();
			if (over === "select") return false;
			setTimeoutConst = setTimeout(function () {
				if (!UIlock) $(".HJ-toolkit-member-toolbar").fadeOut("fast");
			}, delay);
		});
		$(".HJ-toolkit-member-toolbar").on("mouseenter", () => {
			clearTimeout(setTimeoutConst);
		});
	}

	function HJM_toggleFeature(id, state) {
		if (state) {
			if (id.search(/rank/gi) >= 0 && $(".handjob-rank").length > 0) {
				$(".handjob-rank").addClass("HJM-fadeIn");
				$(".forum-post__bodyguard").addClass("expand-bodyguard");
			} else if (id.search(/rank/gi) >= 0) {
				$(".forum-post__bodyguard").addClass("expand-bodyguard");
				HJM_displayHJRank();
			} else if (id.search(/requests/gi) >= 0 && $(".encode-this").length > 0) $(".encode-this").fadeIn("fast");
			else if (id.search(/requests/gi) >= 0) HJM_requestLinks();
			else if (id.search(/active/gi) >= 0 && $(".forum-post__footer").length > 0)
				$(".forum-post__footer").addClass("show-footer");
			else if (id.search(/active/gi) >= 0) HJM_loadEncodeHistory();
		} else {
			if (id.search(/rank/gi) >= 0) {
				$(".handjob-rank").removeClass("HJM-fadeIn");
				$(".forum-post__bodyguard").removeClass("expand-bodyguard");
			} else if (id.search(/requests/gi) >= 0) $(".encode-this").hide();
			else if (id.search(/active/gi) >= 0) $(".forum-post__footer").removeClass("show-footer");
		}
	}

	function encodeResCount(data) {
		var resCount = { dvd: 0, p480: 0, p576: 0, p720: 0, p1080: 0 };
		for (let i = 0; i < data.length; i++) {
			switch (data[i].res) {
				case "dvdrip":
					resCount.dvd++;
					break;
				case "480p":
					resCount.p480++;
					break;
				case "576p":
					resCount.p576++;
					break;
				case "720p":
					resCount.p720++;
					break;
				case "1080p":
					resCount.p1080++;
					break;
			}
		}
		return resCount;
	}

	function loadMemberProfile() {
		saveStack("loadMemberProfile");
		cache.load("memberEncodes");
		var ccReturn = cache.checkCache("memberEncodes");
		if (ccReturn && cache.data.memberEncodes.length > 0) {
			showProfile();
		} else {
			$(".menu-loader").fadeIn("slow");
			cache
				.update_memberEncodes()
				.then(() => {
					cache.updateTimer("memberEncodes");
					cache.save("memberEncodes");
					$(".menu-loader").fadeOut("fast");
					showProfile();
				})
				.catch((e) => console.log(e));
		}

		function showProfile() {
			var resCount = encodeResCount(cache.data.memberEncodes);
			let uploadedSize = cache.data.memberEncodes.reduce(function (total, item) {
				let fl = /MiB/.test(item.size) ? parseFloat(item.size) / 1024 : parseFloat(item.size);
				return total + fl;
			}, 0);
			let uploadedFormat = uploadedSize >= 1024 ? "TiB" : "GiB";
			uploadedSize = uploadedSize >= 1024 ? uploadedSize / 1024 : uploadedSize;
			let mostSnatched = cache.data.memberEncodes.reduce(function (max, obj) {
				return parseInt(obj.snatched, 10) > parseInt(max.snatched, 10) ? obj : max;
			});
			let mostSeeded = cache.data.memberEncodes.reduce(function (max, obj) {
				return parseInt(obj.seeders, 10) > parseInt(max.seeders, 10) ? obj : max;
			});
			let lastUpload = cache.data.memberEncodes.sort((a, b) => {
				return new Date(b.time).getTime() - new Date(a.time).getTime();
			})[0];
			cache.load("cakeDay");
			var html = `<div class="back-button" title="Return to Menu">&laquo;</div><div style="flex-flow: column" class="HJ-toolkit-member-toolbar-flex">
        <h1>HANDJOB Profile: ${user.username}</h1>
<div id="HJM-profile-container" class="flex-container">
    <div class="HJM-row">
        <div class="HJM-col" style="width:40%;">
            <div class="HJM-row">
                <div class="HJM-profile-label">Rank:</div>
                <div>${user.rankFull}</div>
            </div>`;
			if (user.rankShort && user.rankShort != "nonmember") {
				html += `<div class="HJM-row">
                <div class="HJM-profile-label">HANDJOB Encodes:</div>
                <div style="position: relative">
                    <a href="/torrents.php?type=uploaded&userid=${user.userid}&filelist=handjob" target="_blank">${
					cache.data.memberEncodes.length
				}</a>
                </div>
            </div>
            <div class="twobytwogrid">
                <div>DVDRip:</div>
                <div>${resCount.dvd}</div>

                <div>480p:</div>
                <div>${resCount.p480}</div>

                <div>576p:</div>
                <div>${resCount.p576}</div>

                <div>720p:</div>
                <div>${resCount.p720}</div>

                <div>1080p:</div>
                <div>${resCount.p1080}</div>
            </div>
            <div class="HJM-row">
                <div class="HJM-col-50"><div class="HJM-profile-label">Member Since:</div></div>
                <div class="HJM-col-50"><div>${cache.data.cakeDay.replace(/\s(?=\d{4})/, ", ")}</div></div>
            </div>`;
			}
			html += `</div>
        <div class="HJM-col" style="width:60%;">
            <div class="HJM-row">
                <div class="HJM-profile-label">Total Upload Size: </div>
                <div>${uploadedSize.toFixed(2)} ${uploadedFormat}</div>
            </div>
            <div class="HJM-row">
                <div class="HJM-profile-label">Most Snatched: </div>
                <div><a href="/torrents.php?torrentid=${mostSnatched.id}&id=${
				mostSnatched.group
			}" target="_blank">${truncate(mostSnatched.title, 20)} [${mostSnatched.year}]</a> – ${
				mostSnatched.snatched
			} times</div>
            </div>
            <div class="HJM-row">
                <div class="HJM-profile-label">Most Seeded: </div>
                <div><a href="/torrents.php?torrentid=${mostSeeded.id}&id=${
				mostSeeded.group
			}" target="_blank">${truncate(mostSeeded.title, 20)} [${mostSeeded.year}]</a> – ${
				mostSeeded.seeders
			} seeders</div>
            </div>
            <div class="HJM-row">
                <div class="HJM-profile-label">Last Encode: </div>
                <div><a href="/torrents.php?torrentid=${lastUpload.id}&id=${
				lastUpload.group
			}" target="_blank">${truncate(lastUpload.title, 20)} [${lastUpload.year}]</a> – ${
				lastUpload.time.split(",")[0]
			}</div>
            </div>
            <button id="viewCharts" class="block-button illustrated-button bssuccess" style="margin-top:1em;">View Charts <img src="https://ptpimg.me/o5ofp7.png"></button>
            <button id="createBBCodeList" class="block-button bsinfo" style="margin-top: 0.5em;">Create/Style BBCode List</button>
        </div>

</div></div>`;
			$(".HJMcontainer2").html(html);
			$(".HJMcontainer").css("margin-left", -barWidth + "px");
			$(".HJMcontainer2").css("margin-left", "0px");

			$(".back-button").on("click", (e) => {
				e.preventDefault();
				UIlock = false;
				$("#UI-padlock-icon").hide();
				$(".HJMcontainer").css("margin-left", "0px");
				$(".HJMcontainer2").css("margin-left", barWidth + "px");
			});

			$("#createBBCodeList").on("click", function () {
				createBBCodeList();
			});

			$("#viewCharts").on("click", function () {
				showCharts();
			});
		}
	}

	function showCharts() {
		function getOptions() {
			return {
				font: "Roboto",
				fontSize: "1.1rem",
				grid: true,
				width: "1000px",
				textColour: css.text,
				textShadow: css.textShadow,
				gridColour: css.border,
				background: `linear-gradient(to bottom, ${css.gradient2}, ${css.gradient1})`,
			};
		}
		saveStack("showCharts");
		let title = `HANDJOB Charts for ${user.username}`;
		let encodes = cache.data.memberEncodes;
		let html = `<div class="HJM-chart"></div><input type="hidden" id="active-chart" value=""><input type="hidden" id="active-chart-offset" value="">
    <select id="load-chart" class="custom-select" style="width: 50%; margin: 0 auto; font-weight: bold;">
        <option value="resolution-percent" selected>Resolution of Encodes (percentage)</option>
        <option value="resolution">Resolution of Encodes (quantity)</option>
        <option value="encodesbymonth">Total Encodes by Month</option>
        <option value="encodesbyyear">Total Encodes by Year</option>
        <option value="genre-percent">Breakdown of Encodes by Genre (percentage)</option>
        <option value="genre">Breakdown of Encodes by Genre (quantity)</option>
        <option value="era-percent">Encodes by Decade of Release (percentage)</option>
        <option value="era">Encodes by Decade of Release (quantity)</option>
    </select>`;
		HJMModal.update({ mode: "fullscreen", title, body: html });
		let { scale, data, unit, axes, labels } = resChart({ percent: true });
		const chart = new Chart({
			scale,
			data,
			unit,
			axes,
			options: getOptions(),
			cb: updateChart,
		});

		document.querySelector("#load-chart").addEventListener("change", loadNewChart);

		function loadNewChart(ev) {
			let retData = {};
			let target = this.value;
			$("#active-chart").val(target);
			if (target == "encodesbyyear") retData = encodesByYearChart();
			else if (target == "encodesbymonth") retData = encodesByMonthChart();
			else if (target == "resolution-percent") retData = resChart({ percent: true });
			else if (target == "resolution") retData = resChart({ percent: false });
			else if (target == "genre-percent") retData = genreChart({ percent: true });
			else if (target == "genre") retData = genreChart({ percent: false });
			else if (target == "era-percent") retData = eraChart({ percent: true });
			else if (target == "era") retData = eraChart({ percent: false });

			chart.axes = retData.axes;
			chart.labels = retData.labels;
			chart.scale = retData.scale;
			chart.data = retData.data;
			chart.unit = retData.unit;
			chart.showControls(retData.controls);
		}

		function updateChart(offset = 0) {
			let retData = {};
			let target = $("#active-chart").val();
			if (target == "encodesbymonth") retData = encodesByMonthChart(offset);
			else return false;

			chart.labels = retData.labels;
			chart.scale = retData.scale;
			chart.data = retData.data;
			chart.unit = retData.unit;
		}

		function eraChart(mode) {
			let decades = {},
				max = 0,
				labels = [],
				data = [];
			for (let x of encodes) {
				let d = Math.floor(x.year / 10) * 10;
				if (!decades["c" + d] || decades["c" + d].length === 0) decades["c" + d] = [];
				decades["c" + d].push(x);
			}
			for (let key in decades) {
				let datum = mode.percent
					? Math.round((100 / encodes.length) * decades[key].length)
					: decades[key].length;
				if (datum) data.push({ value: datum, label: key.replace(/c/, "") + "s" });
			}
			data = data.sort((a, b) => b.value - a.value).slice(0, 10);
			max = Math.ceil(data[0].value / 10) * 10;
			let interval = max / 10;
			data = data.sort((a, b) => parseInt(a.label, 10) - parseInt(b.label, 10));
			let rainbow = new Rainbow();
			rainbow.setNumberRange(0, data.length);
			if (mode.percent) rainbow.setSpectrum("#a9a9a9", "#ffc0cb", "#e6e635");
			else rainbow.setSpectrum("#5f9ea0", "#4682b4", "#aa75b5");
			data.map((x, idx) => {
				data[idx].colour = "#" + rainbow.colourAt(idx);
				labels.push(x.label);
				x.id = idx + 1;
			});
			let unit = mode.percent ? "%" : " encodes";
			let scale = { start: 0, interval, max };
			let axes = mode.percent
				? { y: "Percent of encodes from decade", x: "Decade of release" }
				: { y: "Number of encodes from decade", x: "Decade of release" };
			return { scale, data, unit, axes, labels };
		}

		function genreChart(mode) {
			let colours = {
				Action: "mediumturquoise",
				Adventure: "forestgreen",
				Animation: "linear-gradient(90deg, #c9d7ea, #a6bcdd)",
				Asian: "goldenrod",
				Biography: "skyblue",
				Bollywood: "linear-gradient(180deg,#ff8000, #fff, #008000)",
				British: "linear-gradient(45deg,#00247d,#00247d 25%,#fff 45%, #fff 55%,#cf142b 70%, #cf142b)",
				Chinese: "red",
				Comedy: "brown",
				Concert: "burlywood",
				Crime: "indianred",
				Cult: "darkred",
				Documentary: `repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px)`,
				Drama: "orange",
				Faith: "lavender",
				Family: "beige",
				Fantasy: "mediumpurple",
				Hindi: "linear-gradient(0deg,#ff8000, #fff, #008000)",
				History: "rosybrown",
				Horror: "crimson",
				Japanese: `linear-gradient(to bottom, red, white)`,
				Lgbt: `repeating-linear-gradient(180deg,#f28560,#F28561 20px,#f2b560 20px,#f2b560 40px,#f2cd60 40px,#f2cd60 60px,#56d88c 60px,#56d88c 80px,#60c1f2 80px,#60c1f2 100px,#bd93d8 100px,#bd93d8 120px)`,
				"Mini-Series": "lightblue",
				Music: `repeating-linear-gradient( 45deg, #f39696, #f39696 15px, #af3d3d 15px, #AF3D3D 30px)`,
				Musical: "repeating-linear-gradient( 45deg, #dee422, #dee422 15px, #e49319 15px, #e49319 30px)",
				Mystery: "slategray",
				Performance: "tan",
				Propaganda: "firebrick",
				Romance: "salmon",
				Russian: "linear-gradient(90deg, #fff, #fff 31%, #00f 35%, #00f 64%, #f00 68%, #f00)",
				"Sci-Fi": "steelblue",
				Short: "khaki",
				Spanish: "linear-gradient(to bottom, #c60a1e, #ffc400)",
				"Stand-Up": "#9ef31d",
				Thriller: "#ddd",
				War: "linear-gradient(to bottom,darkslategrey,black)",
				Western: "saddlebrown",
			};
			let genres = [],
				max = 0,
				data = [],
				labels = [];
			for (let x of encodes) {
				for (let t of x.tags) {
					if (!genres[t] || genres[t].length === 0) genres[t] = [];
					genres[t].push(x);
				}
			}
			for (let key in genres) {
				let datum = mode.percent ? Math.round((100 / encodes.length) * genres[key].length) : genres[key].length;
				data.push({ value: datum, label: capFirst(key.replace(/\./g, "-")) });
			}
			data = data.sort((a, b) => b.value - a.value).slice(0, 10);
			max = Math.ceil(data[0].value / 10) * 10;
			let interval = max / 10;
			data = data.sort((a, b) => {
				if (a.label < b.label) {
					return -1;
				}
				if (a.label > b.label) {
					return 1;
				}
				return 0;
			});
			data.map((x, idx) => {
				labels.push(x.label);
				x.id = idx + 1;
				x.colour = colours[x.label];
				if (!x.colour) x.colour = "steelblue";
			});
			let unit = mode.percent ? "%" : " encodes";
			let scale = { start: 0, interval, max };
			let axes = mode.percent
				? { y: "Percentage of encodes with tag", x: "Film genre" }
				: { y: "Number of encodes with tag", x: "Film genre" };
			return { scale, data, unit, axes, labels };
		}

		function resChart(mode) {
			let resCount = encodeResCount(encodes);
			let max = 0;
			for (let key in resCount) {
				let datum = (resCount[key] = mode.percent
					? Math.round((100 / encodes.length) * resCount[key])
					: resCount[key]);
				if (max < datum) max = datum;
			}
			max = Math.ceil(max / 10) * 10;
			let interval = max / 10;
			let scale = { start: 0, interval, max };
			let axes = mode.percent
				? { y: "Percent of total encodes ( % )", x: "Resolution" }
				: { y: "Total number of encodes", x: "Resolution" };
			let unit = mode.percent ? "%" : " encodes";
			let labels = ["DVDRip", "480p", "576p", "720p", "1080p"];
			let data = [
				{ id: 1, label: "DVDRip", value: resCount.dvd, colour: "seagreen" },
				{ id: 2, label: "480p", value: resCount.p480, colour: "steelblue" },
				{ id: 3, label: "576p", value: resCount.p576, colour: "steelblue" },
				{ id: 4, label: "720p", value: resCount.p720, colour: "indianred" },
				{ id: 5, label: "1080p", value: resCount.p1080, colour: "indianred" },
			];
			return { scale, data, unit, axes, labels };
		}

		function encodesByMonthChart(offset = 0) {
			let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			let rawdata = {},
				data = [],
				labels = [],
				max = 0;
			let rainbow = new Rainbow();
			for (let x of encodes) {
				let d = new Date(x.time);
				let y = d.getFullYear();
				let m = d.getMonth();
				if (!rawdata[y]) rawdata[y] = {};
				if (!rawdata[y][m]) rawdata[y][m] = [];
				rawdata[y][m].push(x);
			}
			for (let i = 0; i < 10; i++) {
				let cur = new Date(),
					output = {};
				cur.setDate(5);
				cur.setMonth(cur.getMonth() - (i + offset));
				output.id = 10 - i;
				output.label = monthNames[cur.getMonth()] + " " + cur.getFullYear();
				labels.push(output.label);
				if (rawdata[cur.getFullYear()] && rawdata[cur.getFullYear()][cur.getMonth()])
					output.value = rawdata[cur.getFullYear()][cur.getMonth()].length;
				else output.value = 0;
				if (output.value > max) max = output.value;
				data.push(output);
			}
			rainbow.setNumberRange(0, data.length);
			let startCol = css.type == "dark" ? "#eee8aa" : "#008b8b";
			rainbow.setSpectrum("#ca7ad2", startCol);
			data.map((x, idx) => (x.colour = "#" + rainbow.colourAt(idx)));
			max = Math.ceil(max / 10) * 10;
			let interval = max / 10;
			let scale = { start: 0, interval, max };
			let axes = { y: "Number of encodes", x: "Month" };
			let unit = " encodes";
			return {
				scale,
				data: data.reverse(),
				unit,
				axes,
				labels: labels.reverse(),
				controls: true,
			};
		}

		function encodesByYearChart() {
			let years = {};
			let data = [];
			for (let x of encodes) {
				let y = new Date(x.time).getFullYear();
				if (!years[y] || years[y].length === 0) years[y] = [];
				years[y].push(x);
			}
			let max = 0,
				labels = [];
			for (let key in years) {
				data.push({ label: key, value: years[key].length });
				if (max < years[key].length) max = years[key].length;
			}
			data = data.sort(function (a, b) {
				return a.label - b.label;
			});
			data.map((x) => labels.push(x.label));
			let rainbow = new Rainbow();
			rainbow.setNumberRange(0, data.length);
			rainbow.setSpectrum("#cd5c5c", "#610909");
			data.map((x, idx) => {
				data[idx].colour = "#" + rainbow.colourAt(idx);
				data[idx].id = idx + 1;
			});
			max = Math.ceil(max / 10) * 10;
			if (max < 10) max = 10;
			let interval = max / 10;
			let scale = { start: 0, interval, max };
			let axes = { y: "Number of encodes", x: "Year uploaded" };
			let unit = " encodes";
			return { scale, data, unit, axes, labels };
		}
	}

	function createBBCodeList(json = false) {
		//https://passthepopcorn.me/torrents.php?id=36267&torrentid=673931
		saveStack("createBBCodeList");
		var encodes = [];
		let stored = cache.data.memberEncodes;
		for (let i = 0; i < stored.length; i++) {
			encodes.push(`https://passthepopcorn.me/torrents.php?id=${stored[i].group}&torrentid=${stored[i].id}`);
		}
		if (!json) showBBCodeList(encodes);
		else return encodes;
	}

	function showBBCodeList(encodes) {
		var rainbow = new Rainbow();
		rainbow.setNumberRange(0, encodes.length);
		let title = `HANDJOB BBCode Encode List`;
		let html = `<form id="bbcode-encodes">
    <div class="form-group"><label for="bbcode-txt">BBCode Output:</label> <textarea class="form-control" name="bbcode-txt" id="bbcode-txt">${encodes
		.reverse()
		.join("\n")}</textarea></div>

<div class="form-group"><label for="BBCode-label">Insert Label:</label> <input type="text" name="BBCode-label" id="BBCode-label" class="form-control" placeholder="Forum 'Insert Encoding History' label"></div>

<fieldset>
<legend>Number Style</legend>

  <div class="custom-checkbox" style="margin-top: 1rem;">
    <input type="checkbox" name="BBCode-options-num" id="BBCode-options-num" value="1" class="bbcode-checkbox">
    <label for="BBCode-options-num">Use Numbered List</label>
  </div>

<div class="form-group" style="margin-top: 1rem;">
    <label for="BBCode-options-break">Marker</label>
    <input type="text" name="BBCode-options-break" id="BBCode-options-break" class="bbcode-checkbox form-control" value="">
    (<span><em>Number can be included in marker by inserting "##"</em></span> )
</div>
<div class="HJM-row" style="margin-top: 1rem;">
  <div class="custom-checkbox custom-checkbox-inline">
    <input type="checkbox" name="BBCode-options-bold" id="BBCode-options-bold" value="1" class="bbcode-checkbox bb-blank">
    <label for="BBCode-options-bold">Bold</label>
  </div>

  <div class="custom-checkbox custom-checkbox-inline">
    <input type="checkbox" name="BBCode-options-italic" id="BBCode-options-italic" value="1" class="bbcode-checkbox bb-blank">
    <label for="BBCode-options-italic">Italic</label>
  </div>

  <div class="custom-checkbox custom-checkbox-inline">
    <input type="checkbox" name="BBCode-options-underline" id="BBCode-options-underline" value="1" class="bbcode-checkbox bb-blank">
    <label for="BBCode-options-underline">Underline</label>
  </div>

  <div class="custom-checkbox custom-checkbox-inline">
    <input type="checkbox" name="BBCode-options-reverse" id="BBCode-options-reverse" value="1" class="bbcode-checkbox">
    <label for="BBCode-options-reverse">Reverse Order</label>
  </div>

  <div class="custom-checkbox custom-checkbox-inline">
    <input type="checkbox" name="BBCode-options-pad" id="BBCode-options-pad" value="1" class="bbcode-checkbox">
    <label for="BBCode-options-pad">Pad Numbers</label>
  </div>
</div>
</fieldset>

<fieldset><legend>Colour Options</legend>
<div class="HJM-row" style="margin-top: 1rem;">
    <div class="custom-radio custom-radio-inline">
        <input type="radio" name="BBCode-options-colour" id="BBCode-options-grad" value="grad" class="bbcode-checkbox bb-blank bb-colours">
        <label for="BBCode-options-grad">Gradient Colours</label>
    </div>
    <div class="colour-input"><input type="color" class="bbcode-checkbox bb-blank colour-stop" id="colourStop1" name="colourStop1" value="#ff0000"><label for="colourStop1">Start</label></div>
    <div class="colour-input"><input type="color" class="bbcode-checkbox bb-blank colour-stop" id="colourStop2" name="colourStop2" value="#ffff00"><label for="colourStop2">Stop 1</label></div>
    <div class="colour-input"><input type="color" class="bbcode-checkbox bb-blank colour-stop" id="colourStop3" name="colourStop3" value="#00ff00"><label for="colourStop3">Stop 2</label></div>
    <div class="colour-input"><input type="color" class="bbcode-checkbox bb-blank colour-stop" id="colourStop4" name="colourStop4" value="#0000ff"><label for="colourStop4">End</label></div>
</div>
<div class="HJM-row" style="margin-top: 1rem;">
    <div class="custom-radio custom-radio-inline">
        <input type="radio" name="BBCode-options-colour" id="BBCode-options-random" value="rand" class="bbcode-checkbox bb-blank bb-colours">
        <label for="BBCode-options-random">Random Colours</label>
    </div>
    <div class="custom-checkbox custom-checkbox-inline">
        <input type="checkbox" name="BBCode-options-randstops" id="BBCode-options-randstops" value="" class="bbcode-checkbox bb-blank bb-colours">
        <label for="BBCode-options-randstops">Use Colour Stops?</label>
    </div>
</div>
<div class="custom-radio" style="margin-top: 1rem;">
    <input type="radio" name="BBCode-options-colour" id="BBCode-options-none" value="none" class="bbcode-checkbox bb-blank bb-colours" checked="checked">
    <label for="BBCode-options-none">No Colours</label>
</div>
</fieldset>
<div class="HJM-row" style="padding: 0 2rem; margin-top: 2rem;">
    <div style="width:50%; padding: 0 1rem;"><button type="button" id="bbcode-txt-button" class="block-button bsinfo pulse-enabled">Copy to Clipboard</button></div>
    <div style="width:50%; padding: 0 1rem;""><button type="button" id="bbcode-reset" class="block-button bsdanger">Reset to Default</button></div>
</div>
</form>`;
		HJMModal.update({ mode: "fullscreen", title, body: html });
		$(".bb-blank").attr("disabled", true);

		$("#bbcode-reset").on("click", () => {
			$("#bbcode-encodes").trigger("reset");
			$('#bbcode-encodes input[type="checkbox"]').prop("checked", false);
			updateColours();
			updateBBCode();
		});

		$("#BBCode-label").on("keyup", function () {
			cache.settings.colour["BBCode-label"] = $(this).val();
			cache.updateSettings();
		});

		var copyTextareaBtn = document.querySelector("#bbcode-txt-button");
		copyTextareaBtn.addEventListener("click", function (event) {
			var copyTextarea = document.querySelector("#bbcode-txt");
			copyTextarea.focus();
			copyTextarea.select();

			try {
				var successful = document.execCommand("copy");
				var msg = successful ? "successful" : "unsuccessful";
				$("#bbcode-txt-button").addClass("pulse");
				setTimeout(() => {
					$("#bbcode-txt-button").removeClass("pulse");
				}, 100);
			} catch (err) {
				console.log("Sorry, unable to copy");
			}
		});

		var updateColours = function (first = false) {
			if (!first) {
				var form = $("form#bbcode-encodes").serializeArray();
				var formObj = {};

				for (let i = 0; i < form.length; i++) {
					formObj[form[i].name] = form[i].value;
				}
				delete formObj["bbcode-txt"];
				cache.settings.colour = formObj;
				cache.updateSettings();
			}

			let lock = false;
			if (!$("#BBCode-options-break").val() && !$("#BBCode-options-num").is(":checked")) {
				$(".bb-blank").attr("disabled", true);
				lock = true;
			} else $(".bb-blank").attr("disabled", false);
			$("#BBCode-options-pad").attr("disabled", !$("#BBCode-options-num").is(":checked"));

			if ($("#BBCode-options-none").is(":checked") || $("#BBCode-options-random").is(":checked")) {
				$(".colour-stop").attr("disabled", true);
			} else if (!lock) $(".colour-stop").attr("disabled", false);

			if ($("#BBCode-options-random").is(":checked") && $("#BBCode-options-randstops").is(":checked"))
				$(".colour-stop").attr("disabled", false);

			if ($("#BBCode-options-random").is(":checked")) {
				$("#BBCode-options-randstops").attr("disabled", false);
			} else if ($("#BBCode-options-grad").is(":checked")) {
				$("#BBCode-options-randstops").attr("disabled", true);
			}

			$("#BBCode-options-randstops").attr("disabled", !$("#BBCode-options-random").is(":checked"));
		};

		var updateBBCode = function () {
			var num, rev, grad, bold, rand, stops, italic, underline, pad;
			var tempEnc = [];
			var marker = $("#BBCode-options-break").val();
			if ($("#BBCode-options-num").is(":checked")) num = true;
			if ($("#BBCode-options-reverse").is(":checked")) rev = true;
			if ($("#BBCode-options-pad").is(":checked")) pad = true;
			if ($("#BBCode-options-grad").is(":checked")) grad = true;
			if ($("#BBCode-options-bold").is(":checked")) bold = true;
			if ($("#BBCode-options-italic").is(":checked")) italic = true;
			if ($("#BBCode-options-underline").is(":checked")) underline = true;
			if ($("#BBCode-options-random").is(":checked")) rand = true;
			if ($("#BBCode-options-randstops").is(":checked")) stops = true;
			if (grad)
				rainbow.setSpectrum(
					$("#colourStop1").val(),
					$("#colourStop2").val(),
					$("#colourStop3").val(),
					$("#colourStop4").val()
				);
			else if (rand && stops)
				rainbow.setSpectrum(
					$("#colourStop1").val(),
					$("#colourStop2").val(),
					$("#colourStop3").val(),
					$("#colourStop4").val()
				);
			else if (rand)
				rainbow.setSpectrum("#9400D3", "#4B0082", "#0000FF", "#00FF00", "#FFFF00", "#FF7F00", "#FF0000");

			let randArray = [];
			for (let a = 0; a < encodes.length; a++) {
				randArray.push(a);
			}
			randArray = shuffle(randArray);

			for (let i = 0; i < encodes.length; i++) {
				let int = "";
				var digit = i + 1;
				if (pad) {
					var totLength = encodes.length.toString().length;
					while (digit.toString().length < totLength) {
						digit = "0" + digit;
					}
				}
				if (marker.search(/##/) >= 0 && num) int = marker.replace("##", digit);
				else {
					if (marker) int = marker;
					if (num) int = `${digit}${int}`;
				}
				if (bold && int) int = "[b]" + int + "[/b]";
				if (italic && int) int = "[i]" + int + "[/i]";
				if (underline && int) int = "[u]" + int + "[/u]";
				if (grad && !$("#BBCode-options-grad").is(":disabled"))
					int = `[color=#${rainbow.colourAt(i)}]${int}[/color]`;
				else if (rand && !$("#BBCode-options-grad").is(":disabled")) {
					int = `[color=#${rainbow.colourAt(randArray[i])}]${int}[/color]`;
				}
				if (int) int += " ";
				tempEnc.push(int + encodes[i]);
			}

			if (!rev) $("#bbcode-txt").val(tempEnc.join("\n"));
			else $("#bbcode-txt").val(tempEnc.reverse().join("\n"));
		};

		if (cache.settings.colour) {
			var frm = $("form#bbcode-encodes");
			for (var z in cache.settings.colour) {
				var ctrl = $("[name=" + z + "]", frm);
				switch (ctrl.prop("type")) {
					case "radio":
					case "checkbox":
						ctrl.each(function () {
							if ($(this).attr("value") == cache.settings.colour[z])
								$(this).attr("checked", cache.settings.colour[z]);
						});
						break;
					default:
						ctrl.val(cache.settings.colour[z]);
				}
			}
			updateColours(true);
			updateBBCode();
		}

		$(".bbcode-checkbox").on("change", function () {
			updateColours();
			updateBBCode();
		});
	}

	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	function handjobGuide() {
		saveStack("handjobGuide");
		cache.load("handjobGuide");
		let ccReturn = cache.checkCache("handjobGuide");

		if (ccReturn && cache.data.handjobGuide) {
			renderPage();
		} else {
			$(".menu-loader").fadeIn("slow");
			cache.update_handjobGuide().then(() => {
				$(".menu-loader").fadeOut("fast");
				renderPage();
			});
		}

		function renderPage() {
			if (cache.settings.theme != "dark")
				cache.data.handjobGuide = cache.data.handjobGuide
					.replace(/#d9eaff/gi, css.text2)
					.replace(/#d9ffea/gi, css.text3);

			var lb = $("#lightbox");
			let html = `<div id="handjob-guide-overlay"><span class='close-guide'>X</span><div id='hj-overlay-container'>Testing</div></div>`;
			HJMlightbox(html);
			$("#handjob-guide-overlay").show();
			$("#hj-overlay-container")
				.html(cache.data.handjobGuide)
				.fadeIn("slow", function () {
					$("#lightbox").addClass("fullscreenlb");
				});
			$("span.close-guide").on("click", function () {
				$("#lightbox").removeClass("fullscreenlb");
				$("#handjob-guide-overlay").fadeOut("slow");
				$(lb).removeClass("flex-centre");
				$(lb).html("").addClass("hidden").removeClass("expandlb");
				$("#lightbox__shroud").addClass("hidden");
				$("body").removeClass("lightbox__scroll-lock");
				$("html,body").scrollTop(scroll);
				UIlock = false;
				$("#UI-padlock-icon").hide();
			});
		}
	}

	function mainMediainfoScanner() {
		let lastScannedLog = "";
		saveStack("mainMediainfoScanner");
		cache.load("handjobGuide");
		var ccReturn = cache.checkCache("handjobGuide");

		if (ccReturn && cache.data.handjobGuide) {
			renderPage();
		} else {
			$(".menu-loader").fadeIn("slow");
			cache.update_handjobGuide().then(() => {
				$(".menu-loader").fadeOut("fast");
				renderPage();
			});
		}

		function renderPage() {
			let html = `<div class="back-button" title="Return to Menu">&laquo;</div>
        <div style="flex-flow: column" class="HJ-toolkit-member-toolbar-flex">
            <h1 class="mediainfo-header"><img src="${icons.mediainfo}">Scan Mediainfo Log</h1>
            <div class="HJMinputdiv">
                <form class="HJM-approval-post">
                    <div class="HJM-mediainfo-input-container">
                        <textarea class="noresize large-scanner HJM-mediainfo-input" style="height: 110px;" name="mediainfo" placeholder="Paste Mediainfo log here"></textarea>
                    </div>
                </form>
                <div class="mi-scanner-results-bar fullX">Your results will show here...</div>
            </div>
        </div>`;
			$(".HJMcontainer2").html(html);
			UIlock = true;
				$(".HJMcontainer").css("margin-left", -barWidth + "px");
			$(".HJMcontainer2").css("margin-left", "0px");

			$(".back-button").on("click", (e) => {
				e.preventDefault();
				UIlock = false;
				$("#UI-padlock-icon").hide();
				$(".HJMcontainer").css("margin-left", "0px");
				$(".HJMcontainer2").css("margin-left", barWidth + "px");
			});

			let callback = mainMediainfoResults;
			HJM_mediainfoListener(callback);
		}

		function mainMediainfoResults(log) {
			if (!log) {
				$(".mi-scanner-results-bar").css("cursor", "initial").text("Your results will show here...");
				lastScannedLog = "";
				mediainfoResultsStripe(undefined, false);
				return false;
			}
			if (lastScannedLog == log) return false;
			else lastScannedLog = log;
			saveStack("mainMediainfoResults");
			let mi = new MediainfoScanner(log);
			checkGuideDupes(mi.feedback);
			let results = mediainfoTallies(mi);
			let feedbackPage = mediainfoResultsBar({ results, mi });
			mediainfoResultsStripe(results, feedbackPage);
		}
	}

	function mediainfoTallies(mi) {
		let results = { errors: 0, warnings: 0, advisories: 0 };
		for (let key in mi.feedback) {
			if (key == "guides") continue;
			results.errors += mi.feedback[key].errors.length;
			results.warnings += mi.feedback[key].warnings.length;
			results.advisories += mi.feedback[key].advisories.length;
		}
		return results;
	}

	function mediainfoResultsBar({ results, mi }) {
		let fname;
		if (mi.data && mi.data.filename) fname = mi.data.filename;
		else if (!fname || mi.exceptions.length > 0) fname = "No valid mediainfo log found";
		let bar = document.querySelector(".mi-scanner-results-bar");
		let errorText = [];
		for (let key in results) {
			let line = results[key] > 0 ? `${results[key]} ${key}` : "";
			if (results[key] === 1 && key === "advisories") line = line.replace(/ies$/i, "y");
			else if (results[key] === 1) line = line.replace(/s$/i, "");
			if (line) errorText.push(line);
		}

		if (errorText.length === 3) errorText = errorText[0] + ", " + errorText[1] + " and " + errorText[2];
		else errorText = errorText.join(" and ");

		if (fname.search(/no(.*?)valid/i) >= 0) {
			errorText = fname;
			$(bar).unbind().css("cursor", "initial").text(errorText);
			return false;
		} else if (errorText) {
			errorText = `Your Mediainfo log scan shows ${errorText}.`;
			$(bar).css("cursor", "pointer").text(errorText);
			$(bar).on("click", () => mediainfoShowFeedback(mi));
			return true;
		} else {
			errorText = "Your Mediainfo log has passed the preliminary checks";
			$(bar).unbind().css("cursor", "initial").text(errorText);
			return true;
		}
	}

	function mediainfoResultsStripe(results, showStripe) {
		let el = document.querySelector(".HJM-mediainfo-input-container");
		if (showStripe === false) el.className = "HJM-mediainfo-input-container";
		else if (results.errors > 0) el.className = "HJM-mediainfo-input-container result error";
		else if (results.warnings > 0) el.className = "HJM-mediainfo-input-container result warning";
		else if (results.advisories > 0) el.className = "HJM-mediainfo-input-container result advisory";
		else el.className = "HJM-mediainfo-input-container result passed";
	}

	function mediainfoShowFeedback(mi) {
		let feedback = mi.feedback;
		let fname = mi.data.filename;
		let meta = mi.data.metatitle;
		let divider = "</div><div class='mi-feedback-message'>";
		let title = "Mediainfo Scan Results for ";
		if (!feedback) title = "";
		let html = `<div class="lightbox-miscan"><div id="handjob-guide-overlay"></div><h2 id="MIscan-title"><img src="${icons.mediainfo}">${title}${fname}</h2><div class="miscan-results-body">`;

		for (let key in feedback) {
			if (key == "guides") continue;
			if (
				feedback[key].errors.length > 0 ||
				feedback[key].warnings.length > 0 ||
				feedback[key].advisories.length > 0
			)
				html += `<div class="miscan-breaker">${key}</div>`;
			if (key == "metatitle" && meta) {
				if (
					feedback.metatitle.errors.length > 0 ||
					feedback.metatitle.warnings.length > 0 ||
					feedback.metatitle.advisories.length > 0
				)
					html += `<div id="miscan-metatitle-header">${meta}</div>`;
			}
			let miSections = ["errors", "warnings", "advisories"];
			for (let i = 0; i < miSections.length; i++) {
				if (feedback[key][miSections[i]].length > 0) {
					html += `<div class="mi-${
						miSections[i]
					}-section mi-feedback-div"><div class="mi-feedback-message">${feedback[key][miSections[i]]
						.map((x) => x.output)
						.join(divider)}</div></div>`;
				}
			}
		}

		html += "</div></div>";
		$("#lightbox").addClass("expandlb");
		HJMlightbox(html.trim());
		$(".mi-feedback-div").each(function () {
			$(this)
				.find("ul.error-list")
				.each(function () {
					$(this)
						.closest("div.mi-feedback-message")
						.addClass("mi-feedback-message-col")
						.removeClass("mi-feedback-message");
				});
			for (let i = 0; i < feedback.guides.length; i++) {
				var el = $(this)
					.find('div [data-guide="' + feedback.guides[i] + '"]')
					.not(":last")
					.remove();
			}
		});
		$("button.expand-guide").on("click", function () {
			let section = $(this).attr("data-guide");
			let subSec = $(this).attr("data-subsection") || "";
			let insert = loadHandjobGuideExcerpt(section, subSec);
			$("#handjob-guide-overlay")
				.html(insert)
				.fadeIn("slow", function () {
					$("#lightbox").addClass("fullscreenlb");
				});
			$("span.close-guide").on("click", function () {
				$("#lightbox").removeClass("fullscreenlb");
				$("#handjob-guide-overlay").fadeOut("slow");
			});
		});
	}

	function HJM_mediainfoListener(callback) {
		saveStack("HJM_mediainfoListener");
		let timer = null;
		$(".HJM-mediainfo-input")
			.on("keyup afterpaste", function (e) {
				if (timer) {
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(() => {
					timer = null;
					if (!$("#lightbox").is(":visible")) {
						$(this).val(cleanMI($(this).val()));
						callback($(this).val());
					}
				}, 1500);
			})
			.on("blur", function () {
				if (!$("#lightbox").is(":visible")) {
					$(this).val(cleanMI($(this).val()));
					callback($(this).val());
				}
			});
	}

	function cleanMI(log) {
		if (log) {
			try {
				let match = log.match(/(Complete name\s+:\s*)(?:.*[\\|\/])?(.*$)/im);
				return log.replace(match[0], match[1] + match[2]).trim();
			} catch (e) {
				return log.trim();
			}
		} else return;
	}

	function createApprovalPost() {
		saveStack("createApprovalPost");
		cache.load("handjobGuide");
		var ccReturn = cache.checkCache("handjobGuide");

		if (ccReturn && cache.data.handjobGuide) {
			renderPage();
		} else {
			$(".menu-loader").fadeIn("slow");
			cache.update_handjobGuide().then(() => {
				$(".menu-loader").fadeOut("fast");
				renderPage();
			});
		}

		function renderPage() {
			HJM_setToolbarHeight(270);
			var html = `<div class="back-button" title="Return to Menu">&laquo;</div>
        <div style="flex-flow: column" class="HJ-toolkit-member-toolbar-flex HJM-approval-panel">
            <h1>Create HANDJOB Approval Post</h1>
            <div class="HJMinputdiv">
                <form class="HJM-approval-post">
                    <input type="text" id="HJMAsource" name="source" placeholder="Enter source PL, torrent group PL or IMDB link" style="margin-bottom: 2px;">
                    <div class="HJM-mediainfo-input-container">
                        <textarea class="noresize HJM-mediainfo-input" rows="2" name="mediainfo" placeholder="Paste Mediainfo log here"></textarea>
                        <div class="stripe-link"></div>
                    </div>
                    <div class="HJM-request-row">
                        <div class="HJM-col-60" style="padding:0">
                            <textarea class="noresize" rows="2" name="screenshots" id="HJMAscreens" placeholder="Paste screenshots here"></textarea>
                            <textarea class="noresize" title="Only two-part sets currently supported" name="comparisons" rows="2" id="HJMAcomps" placeholder="Comparison screenshots (optional)"></textarea>
                        </div>
                        <div class="HJM-col-40" style="display:flex;align-items:flex-end;flex-flow:wrap;">
                            <div style="color: ${css.text}; font-style: italic; font-size:0.6rem;padding:0 10px;">* You don't need to use any BBCode tags when filling out this form</div>
                            <button type="button" id="approval-post-button">Post to Forum</button>
                        </div>
                    </div>
                </form>
                <div class="HJM-submit-checkmark">&check;</div>
                <div class="HJM-submit-loader"></div>
			</div>
        </div>`;
			$(".HJMcontainer2").html(html);
			UIlock = true;
			$(".HJMcontainer").css("margin-left", -barWidth + "px");
			$(".HJMcontainer2").css("margin-left", "0px");

			$(".back-button").on("click", (e) => {
				e.preventDefault();
				UIlock = false;
				$("#UI-padlock-icon").hide();
				$(".HJMcontainer").css("margin-left", "0px");
				$(".HJMcontainer2").css("margin-left", barWidth + "px");
			});
			let lastScannedLog = "";
			let callback = approvalMediainfoResults;
			HJM_mediainfoListener(callback);

			function approvalMediainfoResults(log) {
				if (!log) {
					lastScannedLog = "";
					mediainfoResultsStripe(undefined, false);
					return false;
				}
				if (lastScannedLog == log) return false;
				else lastScannedLog = log;
				saveStack("approvalMediainfoResults");
				let mi = new MediainfoScanner(log);
				checkGuideDupes(mi.feedback);
				let results = mediainfoTallies(mi);
				let feedbackPage = mediainfoResultsBar({ results, mi });
				mediainfoResultsStripe(results, feedbackPage);
				$(".HJM-mediainfo-input-container .stripe-link").on("click", () => mediainfoShowFeedback(mi));
			}

			$("#approval-post-button").on("click", function () {
				var approvalFail = function () {
					$(".HJM-submit-loader").fadeOut("fast", function () {
						$(".HJM-submit-checkmark")
							.addClass("fail")
							.html("X")
							.fadeIn("fast", function () {
								setTimeout(function () {
									$(el).prop("disabled", false);
									$(".HJM-submit-checkmark").fadeOut("fast", () => {
										$(".HJM-submit-checkmark").removeClass("fail").html("&check;");
									});
								}, 2000);
							});
					});
				};

				var failRequired = function (elem) {
					$(elem).addClass("fieldRequired");
					$(elem).on("focus", function () {
						$(elem).removeClass("fieldRequired");
					});
				};

				var el = $(this);
				var fail = false;
				const required = [
					document.querySelector(".HJM-mediainfo-input"),
					document.querySelector("#HJMAscreens"),
				];
				required.map((x) => {
					if (!x.value) {
						failRequired(x);
						approvalFail();
						fail = true;
					}
				});
				if (fail) return false;
				$(".HJM-submit-loader").fadeIn("fast");
				$(this).prop("disabled", true);
				var form = $(this).closest("form").serializeArray();
				var formObj = {};

				for (let i = 0; i < form.length; i++) {
					formObj[form[i].name] = form[i].value;
				}

				submitApprovalPost(formObj)
					.then((res) => {
						$(".HJM-submit-loader").fadeOut("fast", function () {
							$(".HJM-submit-checkmark").fadeIn("fast", function () {
								setTimeout(function () {
									$(el).closest("form").trigger("reset");
									$(el).prop("disabled", false);
									$(".HJM-submit-checkmark").fadeOut("fast");
								}, 2000);
							});
						});
					})
					.catch((e) => {
						approvalFail();
					});
			});
		}

		function submitApprovalPost(data) {
			return new Promise((resolve, reject) => {
				var screens = data.screenshots.replace(/(\n|,)/g, " ").split(/\s+/);
				screens = screens.filter((x) => x.trim());
				screens = screens.map((x) => {
					x = x.replace(/\[.*?\]/gi, "").replace(/\<.*?\>/gi, "");
					return "[img]" + x + "[/img]";
				});
				var comps = data.comparisons.length >= 1 ? data.comparisons.replace(/(\n|,)/g, " ").split(/\s+/) : "";
				if (comps) {
					comps = comps.filter((x) => x.trim());
					comps = "\n[comparison=Source, Encode]" + comps.join(" ") + "[/comparison]";
				}
				var bbcode = `Requesting approval for encode of ${data.source}\n
[mediainfo]${data.mediainfo}[/mediainfo]
[hide=Encode Screenshots]${screens.join("\n")}[/hide]
${comps}`;
				let options = { url: "/forums.php", method: "POST" };
				let formData = new FormData();
				formData.append("AntiCsrfToken", AntiCsrfToken);
				formData.append("action", "reply");
				formData.append("thread", "13617");
				formData.append("body", bbcode);
				formData.append("merge", "checked");
				options.data = formData;

				ajax(options).then((raw) => {
					let error = $("h2.page__title", raw).text().search(/error/i) >= 0 ? true : false;
					if (error) {
						let errorTitle = $("h2.page__title", raw).text();
						let errorText = $("h2.page__title", raw).next("div.panel").find("div.panel__body").text();
						alert(errorTitle + ": " + errorText);
						reject();
					} else resolve();
				});
			});
		}
	}

	function HJM_injectStyle() {
		return new Promise((resolve, reject) => {
			var html = `<style>

@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto'), local('Roboto-Regular'), url(https://fonts.gstatic.com/s/roboto/v19/KFOmCnqEu92Fr1Mu4mxP.ttf) format('truetype');
}

@font-face {
    font-family: 'Signika Negative';
    font-style: normal;
    font-weight: 400;
    src: local('Signika Negative'), url('https://fonts.googleapis.com/css?family=Signika+Negative&display=swap');
}

pre {
	white-space: pre-wrap;
}

/* ## Mediainfo scanner inputs ## */

.HJM-mediainfo-input-container {
    position: relative;
}

.HJM-mediainfo-input-container::after {
    content: "";
    position: absolute;
    top: 1px;
    bottom: 4px;
    width: 10px;
    right: 15px;
    opacity: 0;
    transition: opacity 100ms ease-in-out;
}

.HJM-mediainfo-input-container .stripe-link {
    position: absolute;
    top: 1px;
    bottom: 4px;
    width: 10px;
    right: 15px;
    background: transparent;
    cursor: pointer;
}

.HJM-mediainfo-input-container.warning::after {
    background: ${css.feedbackColours.warning};
}

.HJM-mediainfo-input-container.advisory::after {
    background: ${css.feedbackColours.advisory};
}

.HJM-mediainfo-input-container.error::after {
    background: ${css.feedbackColours.error};
}

.HJM-mediainfo-input-container.passed::after {
    background: ${css.feedbackColours.pass};
}

.HJM-mediainfo-input-container.result::after {
    opacity: 1;
    pointer-events: none;
}

.HJM-mediainfo-input-container textarea:focus {
    outline: none;
}

/* ## Full-screen bench icon ## */

.fullscreen-icon-outer {
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    background: ${css.border};
    padding: 5px;
    cursor: pointer;
}

.fullscreen-icon-outer, .fullscreen-icon-outer > div:before, .fullscreen-icon-outer > div:after {
    transition: all 100ms ease-in-out;
}

.fullscreen-icon-outer:hover, .fullscreen-icon-outer:hover > div:before, .fullscreen-icon-outer:hover > div:after {
    background: ${css.backgroundShade};
}

.fullscreen-icon-outer:hover {
    padding: 4px;
}

.fullscreen-icon-outer > div {
    box-sizing: border-box;
    border: 2px solid white;
    width: 100%;
    height: 100%;
    position: relative;
}

.fullscreen-icon-outer > div::before {
    content: "";
    position: absolute;
    top: 5px;
    left: -2px;
    bottom: 5px;
    right: -2px;
    background: ${css.border};
}

.fullscreen-icon-outer > div::after {
    content: "";
    position: absolute;
    top: -2px;
    left: 5px;
    bottom: -2px;
    right: 5px;
    background: ${css.border};
}

/* #### SELECT MULTIPLE SECTION #### */

.select-multiple .options div {
    padding: 0.5em 1em;
    transition: background 100ms ease-in-out;
    position: relative;
    text-align: left;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.select-multiple .options div::after {
    position: absolute;
    content: attr(data-order);
    right: 1em;
}

.select-multiple .options div.selected {
    background: forestgreen;
}

.select-multiple .options div.selected:hover {
    background: indianred;
    color: white;
}

.select-multiple .options div:not(:last-child) {
    border-bottom: 1px solid black;
}

.select-multiple .options div:hover {
    background: #5aa0da;
    cursor: pointer;
}

.select-multiple .options {
    pointer-events: none;
    border-radius: 0.2em;
    border: 1px solid #555;
    position: absolute;
    width: 100%;
    background: steelblue;
    color: white;
    display: flex;
    flex-flow: column;
    top: -1px;
    left: -1px;
    opacity: 0;
    transition: filter 100ms ease-in-out;
}

.select-multiple.focussed .options {
    opacity: 1;
    pointer-events: all;
}

.select-multiple {
    position: relative;
   list-style-type: none;
   margin: 0;
   padding: 0;
   border: 1px solid #555;
   display: inline-block;
   padding: 0.5em 3em 0.5em 1em;
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='gray' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E");
    background-size: 0.7em;
    background-repeat: no-repeat;
    background-position: right 0.5em center;
    border-radius: 0.2em;
    cursor: pointer;
    width: 50%;
    text-align: left;
}

.select-multiple li {
    display: none;
}

/* ##### HJM-MODAL SECTION ##### */

.custom-select {
    display: block;
    width: 100%;
    height: calc(2.25rem + 2px);
    padding: .375rem 1.75rem .375rem .75rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    vertical-align: middle;
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='gray' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E");
    background-size: 0.8rem;
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    transition: background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

.HJM-modal-container figure {
    margin: 0;
    text-align: center;
    position: relative;
    border: 1px solid ${css.border};
}

.HJM-modal-container .guide-image img {
    height: auto;
    border: 1px solid ${css.border};
    border-radius: 10px;
}

.HJM-modal-container .guide-subheading {
    margin: 3em 0;
    text-transform: uppercase;
}

.HJM-modal-container .guide-image {
    text-align: center;
}

.HJM-modal-container figcaption {
    width: 50%;
    position: absolute;
    bottom: 10%;
    right: 0;
    padding: 0.5em 1em;
    background: ${css.captionBackground};
    color: ${css.captionText};
    text-align: left;
}

.HJM-modal-container .colour-input {
    display: flex;
    flex-flow: row;
    align-items: center;
}

.HJM-modal-container .colour-input label {
    margin: 0 1rem 0 0.5rem;
}

.HJM-modal-container .custom-checkbox label, .HJM-modal-container .custom-radio label {
    position: relative;
    padding-left: 1.5rem;
    user-select: none;
    cursor: pointer;
    line-height: 1rem;
    transition: opacity 100ms ease-in-out;
}

.HJM-modal-container .custom-checkbox-inline, .HJM-modal-container .custom-radio-inline {
    display: inline-block;
}

.HJM-modal-container .custom-checkbox-inline:not(:last-child), .HJM-modal-container .custom-radio-inline:not(:last-child) {
    margin-right: 2rem;
}

.HJM-modal-container .custom-checkbox input, .HJM-modal-container .custom-radio input {
    opacity: 0;
    position: absolute;
}

.HJM-modal-container .custom-checkbox label::before, .HJM-modal-container .custom-checkbox label::after,
.HJM-modal-container .custom-radio label::before, .HJM-modal-container .custom-radio label::after {
    content: "";
    position: absolute;
}

.HJM-modal-container .custom-checkbox label::before, .HJM-modal-container .custom-radio label::before {
    background: #ddd;
    transition: all 200ms ease-in-out;
    left: 0;
    top: 0;
    width: 1rem;
    height: 1rem;
    box-shadow: 0px 0px 2px #555;
}

.HJM-modal-container .custom-radio label::before {
    border-radius: 50%;
}

.HJM-modal-container .custom-checkbox label::after {
    left: 0.2rem;
    top: 0.2rem;
    width: 0.7rem;
    height: 0.7rem;
    background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/></svg>");
    opacity: 0;
    transition: opacity 100ms ease-in-out;
}

.HJM-modal-container .custom-radio label::after {
    box-sizing: border-box;
    left: 0.25rem;
    top: 0.25rem;
    width: 0.5rem;
    height: 0.5rem;
    background: #eee;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 100ms ease-in-out;
}

.HJM-modal-container .custom-checkbox input:disabled ~ label::before, .HJM-modal-container .custom-radio input:disabled ~ label::before,
.HJM-modal-container .custom-checkbox input:disabled ~ label::after, .HJM-modal-container .custom-radio input:disabled ~ label::after,
.HJM-modal-container input[type=color]:disabled ~ label, .HJM-modal-container input[type=color]:disabled {
    opacity: 0.5 !important;
}

.HJM-modal-container input[type=color] ~ label, .HJM-modal-container input[type=color] {
    transition: opacity 100ms ease-in-out;
}

.HJM-modal-container .custom-checkbox input:disabled ~ label, .HJM-modal-container .custom-radio input:disabled ~ label {
    cursor: default;
    opacity: 0.5;
}

.HJM-modal-container .custom-checkbox input:checked ~ label::after, .HJM-modal-container .custom-radio input:checked ~ label::after {
    opacity: 1;
}

.HJM-modal-container .custom-checkbox input:checked ~ label::before, .HJM-modal-container .custom-radio input:checked ~ label::before {
    background: #3b88fd;
}

.HJM-modal-container label {
    display: inline-block;
    margin-bottom: 0.5rem;
}

.HJM-modal-container .form-group {
    margin-bottom: 1rem;
    text-align: left;
}

.HJM-modal-container .form-group input, .HJM-modal-container .form-group textarea {
    margin: 0;
    width: 100%;
    resize: none;
    font-size: 0.8rem;
}

.HJM-modal-container .form-group textarea {
    height: 100px;
}

.HJM-modal-container .form-control {
    display: block;
    width: 100%;
    padding: .175rem .75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

.HJM-modal-container .input-group {
    position: relative;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -ms-flex-align: stretch;
    align-items: stretch;
    width: 100%;
}

.HJM-modal-container .input-group > .input-group-prepend > .input-group-text {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.HJM-modal-container .input-group > .form-control:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.HJM-modal-container .input-group-text {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    padding: .375rem .75rem;
    margin-bottom: 0;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-radius: .25rem;
}

.HJM-modal-container .input-group-prepend {
    margin-right: -1px;
}

.HJM-modal-container .input-group-append, .input-group-prepend {
    display: -ms-flexbox;
    display: flex;
}

/* ##### END HJM-MODAL SECTION ##### */

.fullX {
    width: 100%;
}

#activeEncodes th {
     text-align: center;
}

.forum-post__footer {
    overflow: hidden;
    transition: max-height 300ms ease-in;
    max-height: 0px;
}

.finish-encode-select-bar {
    position: relative;
    width: 90%;
    font-size: 12px;
}

#HJM-finish-pl.error-message {
    text-align: center;
    color: red;
    border: 3px solid red;
}

.select-bar-container {
    position: relative;
}

.select-bar-container.fail::after {
    color: red;
    content: "X";
    font-size: 17px;
}

.select-bar-container.hide-check::after {
    display: none;
}

.select-bar-container::after {
    content: "\\2713";
    position: absolute;
    color: green;
    right: 56px;
    font-size: 18px;
}

#HJM-template-save-icon {
   position: absolute;
    width: 40px;
    height: 40px;
    right: 15px;
    top: 0;
    background: url(${icons.saveTemplate});
    background-size: contain;
    background-repeat: no-repeat;
}

.forum-post__footer.show-footer {
    max-height: 70px;
}


span.filename-typo {
  position: relative;
}

span.filename-typo::before {
        z-index:9999;
        content: " ";
        position: absolute;
        top: -0.3rem;
        right: 50%;
        transform: translateX(50%);
        border-width: 5px;
        border-style: solid;
        border-color: indianred transparent transparent transparent;
}

.forum-post__footer-container {
    border-top: thin solid ${css.border};
    display: flex;
}

.HJM-fade {
    display: block !important;
    opacity: 0;
    transition: opacity 300ms ease-in;
}

.seeing-red {
    filter: hue-rotate(140deg);
    border: 3px solid #2e58ef;
}

#handjob-template-icon {
    transition: all 200ms ease;
}

.HJM-fadeIn {
    opacity: 1 !important;
}

.forum-post__footer-header {
    text-align: left;
    font-size: 0.9em;
    font-weight: bold;
    padding: 5px;
}

#finish-check-complete {
    display: block;
    bottom: 20px;
    right: 15px;
    top: unset;
    height: 40px;
    width: 40px;
    background: url(${icons.complete});
    background-size: contain;
    background-repeat: no-repeat;
}

#finish-check-complete.filter-disabled {
    filter: grayscale(1);
    cursor: unset;
}

#hsf-iwet-break {
    position: relative;
    justify-content: center;
    background: ${css.backgroundBreak};
    width: calc(100% + 40px);
    margin-left: -20px;
    padding: 10px;
    margin-top: 10px;
    align-items: center;
}

.HJM-settings-checkbox {
    padding: 0.1em;
}

.HJM-settings-checkbox label {
    margin-left: 0.3em;
}

.HJM-settings-checkbox label, .HJM-settings-checkbox input {
    cursor: pointer;
}

#finish-check-status {
    width: 38px;
    height: 38px;
    top: calc(50% - 25px);
    right: 17px;
    line-height: 38px;
    font-size: 26px;
}

#hsf-iwet-break .hsf-checkbox {
    margin-right: 10px;
}

.forum-post__footer-body {
    flex: 2 0 auto;
    padding: 5px;
    font-size: 0.9em;
}

.ec-up, .ec-down, .back-button {
    font-family: ${css.font};
    width: 1.8rem;
    height: 1.8rem;
    text-align: center;
    line-height: 1.8rem;
    cursor: pointer;
    background: rgba(126, 184, 255, 0.08);
    border: 1px solid rgba(126, 184, 255, 0.18);
    border-radius: 10px;
    user-select: none;
    transition: background 100ms ease-in-out, border-color 100ms ease-in-out, color 100ms ease-in-out;
}

.back-button {
    width: 1.8rem;
    position: absolute;
    top: 14px;
    left: 14px;
    font-size: 1.25rem;
    z-index: 9;
    color: #7eb8ff;
}

.ec-up:hover, .ec-down:hover, .back-button:hover {
    background: rgba(126, 184, 255, 0.16);
    border-color: rgba(126, 184, 255, 0.45);
    color: #f7f7f8;
}

.pulse-enabled {
    -webkit-transition: background-color 100ms ease-in;
    -ms-transition: background-color 100ms ease-in;
    transition: background-color 100ms ease-in;
}

.reset-button {
    text-align: center;
    background-color: #004088;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 23px;
    line-height: 30px;
    color: #fff;
    position: absolute;
    right: 50px;
}

.flex-relative {
    align-items: center;
    position: relative;
}

@keyframes animate-stripes {
    0% {
        background-position: 0 0;
       }

   100% {
       background-position: 60px 0;
    }
}

.menu-progress {
    background-color: #333;
    height: 20px;
    padding: 5px;
    width: 100%;
    border-radius: 5px;
    box-shadow: 0 1px 5px #000 inset, 0 1px 5px #aaa;
    position: absolute;
    text-align: left;
    bottom: 10px;
    opacity: 0;
    transition: opacity 150ms ease-in-out;
}

.menu-progress.light {
    background-color: #ddd;
    box-shadow: 0 1px 5px #aaa inset, 0 1px 5px #ddd;
}

.menu-progress.show-progress {
    opacity: 1;
}

.services-text-inner {
    transition: opacity 150ms ease-in-out;
}

.twobytwogrid {
   margin-left: 1rem;
   display: grid;
   grid-template-columns: 1fr 2fr;
   grid-column-gap: 0px;
   grid-row-gap: 0px;
}

.twobytwogrid > div:nth-child(odd) {
    font-weight: bold;
}

.menu-progress.show-progress + .services-text-inner {
    opacity: 0;
}

.menu-progress span {
    width: 0%;
    display: inline-block;
    height: 100%;
    border-radius: 3px;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5) inset;
    transition: width 0.4s ease-in-out;
}

.menu-progress.blue span {
    background-color: steelblue;
}

.menu-progress.stripes span {
    background-size: 30px 30px;
    background-image:
    linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    animation: animate-stripes 3s linear infinite;
}

.active-encode-entry, .active-encode-entry a {
    color: ${css.textLight};
}

.pulse {
    background-color: #fff !important;
}

.services-text {
    opacity: 0;
    transition: opacity 100ms linear;
    text-align: center;
    width: 100%;
    padding-bottom: 8px;
    color: ${css.textLight};
    position: relative;
}

.HJ-toolkit-member-toolbar-services .services-text {
    position: absolute;
    left: 0;
    right: 0;
    top: -30px;
    width: auto;
    padding-bottom: 0;
    pointer-events: none;
}

.services-text.show-services-text {
    opacity: 1;
}

#hsf-check.fail {
    cursor: pointer;
}

.finish-block {
    height: 25px;
    align-items: center;
}

.HJM-finish-section {
    width: 100%;
    padding: 2px 2px 2px 10px;
}

.mini-header {
    font-size: 9px;
    text-transform: uppercase;
    font-weight: bold;
}

.HJM-switches-container {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    padding-bottom: 12px;
    gap: 10px;
}

#HJM-settings-container {
    gap: 22px;
    padding: 10px 22px 18px 54px;
}

#HJM-settings-container label {
    font-size: 13px;
    color: #dedee2;
}

#HJM-settings-container select {
    min-height: 38px;
    margin-top: 7px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(126, 184, 255, 0.22);
    background: rgba(8, 10, 15, 0.88);
    color: #f7f7f8;
    font-size: 13px;
}

#HJM-settings-container .HJM-col {
    border-radius: 14px;
    border: 1px solid rgba(126, 184, 255, 0.16);
    background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018));
    padding: 18px 20px;
}

.HJM-settings-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.HJM-settings-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #7eb8ff;
}

#HJM-error-message-bar {
    cursor: pointer;
    width: 0px;
    overflow: hidden;
    transition: width 500ms ease-in-out, opacity 150ms ease-in-out;
    height: 0;
    background: transparent;
    position: fixed;
    bottom: 10px;
    left: 30px;
    border-radius: 0 25px 25px 0;
    z-index: 1;
    border: 0;
    color: ${css.text};
    font-size: 23px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    opacity: 0;
    pointer-events: none;
}

#HJM-error-message-bar.show-error-message {
    width: calc(100% - 50px);
    height: 50px;
    background: ${css.background};
    border: 2px solid #0c71ba;
    opacity: 1;
    pointer-events: auto;
}

#HJM-error-message {
    padding-left: 50px;
    white-space: nowrap;
}

.mi-scanner-results-bar {
    height: 20px;
    background: #047fd6;
    border-radius: 4px;
    padding: 0 10px;
    line-height: 20px;
    color: #fff;
}

legend {
    border: 0;
    padding: 0 5px;
    margin-left: 10%;
    font-weight: bold;
    font-style: italic;
    #004088;
}

fieldset {
    border: 1px solid #555;
    margin: 0;
    padding: 4px 1rem;
    margin-top: 10px;
}

div.filename-error {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
    font-family: monospace, monospace;
    line-height: 1.4rem;
}

.lightbox.expandlb {
    height: 100%;
}

.css-slide {
    overflow-y: hidden;
    max-height: 100px; /* approximate max height */
    transition-property: all;
    transition-duration: .5s;
    transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.css-list-slide {
    overflow-y: hidden;
    max-height: 30px;
    transition-property: all;
    transition-duration: .5s;
    transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.css-list-slide-closed {
    max-height: 0 !important;
}


.css-slide-closed {
    max-height: 0 !important;
}

.mediainfo-header {
    display: flex;
    justify-content: center;
    align-items: center;
}

.mediainfo-header img {
    ${css.type == "light" ? "filter: brightness(0.5);" : ""}
    width: 20px;
    margin-right: 10px;
}

#activeEncodes {
    font-size: 10px;
    background: ${css.backgroundContainer};
}

.lightbox.fullscreenlb {
    height: 100%;
    width: 100%;
    top: 0;
}

.thin-row .HJM-profile-label {
    padding-bottom: 0;
    margin-left: 1rem;
}

.checkbox-centre {
    align-items: center;
}

.lightbox-msg label {
    padding: 2px 20px 2px 6px;
}

#BBCode-options-break {
    width: 50px;
    padding: 1px 5px;
}

.inline-icon {
    position: absolute;
    display: inline-block;
    right: -31px;
    top: -50%;
    cursor: pointer;
}

.inline-icon img {
    width: 25px;
}

.profile-input label {
    padding-top: 6px;
    padding-bottom: 6px;
    font-weight: bold;
}



.HSF-input-form {
    background: ${css.backgroundShade};
    color: ${css.text};
    width: auto;
    margin: 0 20px 20px 20px;
    padding: 20px;
    border-radius: 20px;
}

.HSF-input-form label {
    padding: 0px 15px 0px 0px;
}

.HJM-profile-label {
    font-weight: bold;
    padding-right: 6px;
}

.profile-input select {
    margin-left: 20px;
}

.HJM-submit-loader {
    position: absolute;
    right: 10px;
    top: calc(50% - 25px);
    margin: 0 auto;
    border: 6px solid ${css.textLight};
    border-top: 6px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 2s linear infinite;
    display: none;
}

.iwet-loader, .iwet-check {
    right: 20px !important;
}

#hsf-check, #hsf-loader, #finish-loader {
    right: 0;
    top: calc(50% - 6px);
    width: 35px;
    height: 35px;
    font-size: 20px;
    line-height: 35px;
}

#insertHistory-loader {
    right: unset;
    top: 38px;
    margin-left: -2px;
    width: 20px;
    height: 20px;
    border: 3px solid #333;
    border-top: 3px solid #3498db;
    pointer-events: none;
}

.menu-loader {
    top: 0;
    right: 10px;
    border: 4px solid ${css.textLight};
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    position: absolute;
    bottom: unset;
    left: unset;
}

.HJM-request-comment {
    padding: 4px 2px;
    display: block !important;
    border-top: 1px solid ${css.border};
    padding-top: 10px;
    margin-top: 10px;
}

p#request-comment {
    text-align: left;
}

#bench-active-encodes thead th, #encode-bench-list-header {
    background: ${css.backgroundShade};

}

#debugLink {
    position: absolute;
    top: 0;
    right: 0;
    width: 50px;
    height: 50px;
    background: steelblue;
    z-index: 99999;
    opacity: 0.7;
    border-radius: 0 0 0 10px;
}

#debugLink img {
    max-width: 100%;
    max-height: 100%;
}

.HJM-submit-checkmark {
    position: absolute;
    right: 10px;
    top: calc(50% - 25px);
    width: 50px;
    height: 50px;
    color: white;
    background: green;
    border-radius: 50%;
    text-align: center;
    line-height: 50px;
    font-size: 30px;
    display: none;
}

.mi-feedback-div > div:not(:first-child) {
    border-top: 1px solid #333;
}

#HJM-mediacheck-sm {
    width: 25px;
    height: 25px;
    font-size: 15px;
    line-height: 25px;
    right: 85px;
    cursor: pointer;
    margin-top: -5px;
}

.HJM-submit-checkmark.fail {
    background: red;
}

@keyframes spin {
    0%{transform:rotate(0deg);}
    100%{transform:rotate(360deg);}
}

@keyframes spin-anti {
    0%{transform:rotate(0deg);}
    100%{transform:rotate(-360deg);}
}

.HJM-request-alert-link {
    color: #491217;
    cursor: pointer;
}

.HJM-request-alert-link:hover {
    color: inherit;
    text-decoration: underline;
}

.HJM-request-IWET textarea {
    margin: 0 10px;
    width: 75%;
}

#approval-post-button {
    width: 96%
}

#hsf-post-button {
    width: unset;
    padding: 4px 20px;
    text-align: center;
    margin: 25px auto 0px auto;
}

.HJM-request-IWET button, .HJM-approval-post button, .bbcode-copy-button, .HSF-input-form button {
    margin: 10px;
    color: #fff;
    background-color: #28a745;
    border-color: #28a745;
    width: 60%;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    border: 1px solid transparent;
    padding: 2px;
    font-size: 1.2em;
    line-height: 1.5;
    border-radius: .25rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

.bbcode-copy-button {
    margin: 20px auto !important;
}

.HJM-approval-post button:disabled, .HJM-approval-post button:disabled:hover, .HJM-request-IWET button:disabled, .HJM-request-IWET button:disabled:hover {
    background-color: #999;
    border-color: ${css.border};
}

.HJM-request-alert.success {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
}

.HJM-request-IWET button:hover, .HJM-approval-post button:hover, .bbcode-copy-button:hover, .HSF-input-form button:hover {
    color: #fff;
    background-color: #218838;
    border-color: #1e7e34;
}

.HJM-request-IWET select {
    margin: 10px;
}

.HJM-request-IWET {
    width: 50%;
    height: auto;
    position: relative;
}

.HJM-request-info {
    color: ${css.text};
    margin-top: 10px;
    width: 50%;
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    border: 2px solid ${css.border};
    border-radius: 10px;
    padding: 4px;
    box-shadow: 2px 2px 5px #ccc;
    background: linear-gradient(to bottom right, ${css.gradient1}, ${css.gradient2}) !important;
}

#HJM-profile-percentage {
    position: absolute;
    left: -32px;
    bottom: 14px;
    font-size: 8px;
    width: 20px;
    text-align: center;
}

.HJM-request-alert {
    display: none;
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
    position: relative;
    padding: .75rem 1.25rem;
    margin: 1rem 0;
    border: 1px solid transparent;
    border-radius: .25rem;
    font-weight: bold;
}

.HJM-request-alert a {
    color: #000;
}

.HJM-request-alert a:hover {
    color: #721c24;
    text-decoration: underline;
}

#UI-padlock-icon {
    display: none !important;
    width: 28px;
    height: 28px;
    position: absolute;
    bottom: 12px;
    left: 12px;
    opacity: 0.75;
    transition: all 300ms ease-in;
    border-radius: 999px;
    border: 1px solid rgba(214, 222, 237, 0.18);
    background: rgba(255, 255, 255, 0.06);
    color: ${css.textLight};
    align-items: center;
    justify-content: center;
    font-size: 13px;
    line-height: 28px;
    text-align: center;
}

.HJM-approval-panel {
    justify-content: flex-start;
    gap: 14px;
    padding: 14px 28px 22px 54px;
    min-height: 0;
}

.HJM-approval-panel h1 {
    margin-top: 6px;
    margin-bottom: 6px;
}

.HJM-approval-panel .HJMinputdiv {
    padding: 0;
}

.HJM-approval-panel .HJM-approval-post {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 10px 18px;
    align-items: end;
}

.HJM-approval-panel #HJMAsource,
.HJM-approval-panel .HJM-mediainfo-input-container {
    grid-column: 1 / -1;
}

.HJM-approval-panel .HJM-request-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 18px;
    align-items: end;
}

.HJM-approval-panel .HJM-col-60,
.HJM-approval-panel .HJM-col-40 {
    width: auto;
}

.HJM-approval-panel .HJM-col-40 {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-end;
}

.HJM-approval-panel #approval-post-button {
    width: 100%;
    margin: 10px 0 0;
}

.HJM-approval-panel textarea:not(.large-scanner) {
    max-height: none;
}

.HJM-request-container {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    padding: 6px 20px 6px 6px;
}

.HJM-request-row, .HJM-row {
    width: 100%;
    display: flex;
}

.HJM-request-row {
    flex-flow: wrap;
}

.bench-actions {
    vertical-align: middle;
    text-align: center;
}

.HJM-col {
    width: 50%;
    padding: 2px;
    display: flex;
    flex-flow: column;
    justify-content: flex-end;
}

.HJM-col-60 {
    width: 60%;
    padding: 2px;
}

.HJM-col-25 {
    width: 25%;
}

.HJM-col-50 {
    width: 50%;
}

.HJM-nowrap {
    flex-wrap: nowrap;
    white-space: nowrap;
}

.HJM-col-60 {
    width: 60%;
}

.HJM-col-75 {
    width: 75%;
}

.HJM-col-40 {
    width: 40%;
}


.HJM-col-40 {
    width: 40%;
    padding: 2px;
}

.hj-message-bar {
	cursor: pointer;
}

.HJM-request-form {
    display: none;
    border: 1px solid ${css.border};
    width: 100%;
    height: auto;
    background: ${css.background};
    color: #fff;
    margin-top: 5px;
}

.HJM-request-form h1 {
    font-size: 1.2em;
    justify-content: center;
    background: #048cea;
    padding: 4px 0px;
    margin: 0;
    color: ${css.text};
    display: flex;
    cursor: n-resize;
}

.HJM-request-form h1 img {
    height: 1.2em;
    padding: 0 5px;
}

.encode-this {
    display: inline-block;
    padding: 1px 4px;
    background: #057cd0;
    cursor: pointer;
    border-radius: 30px;
    color: #fff;
    margin-left: 10px;
}

.HJ-toolkit-member-toolbar-links {
    flex: 1 1 auto;
    min-width: 0;
    margin: 22px 0 22px 26px;
    padding: 18px 22px;
    font-size: 14px;
    line-height: 1.48;
    border-radius: 14px;
    border: 1px solid rgba(126, 184, 255, 0.16);
    background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018));
    box-shadow: inset 3px 0 0 rgba(126, 184, 255, 0.72);
}

.HJ-toolkit-member-toolbar-links ul {
    margin: 0;
    padding: 0;
}
.HJ-toolkit-member-toolbar-settings {
    font-size: 14px;
    font-weight: bold;
    color: #f7f7f8;
    text-shadow: none;
    text-transform: capitalize;
    width: 380px;
    display: flex;
    flex-flow: column;
    align-items: center;
    margin: 22px 26px 22px 0;
    padding: 18px 20px;
    border-radius: 14px;
    border: 1px solid rgba(126, 184, 255, 0.16);
    background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018));
}

input.HJMinput.switch:empty {
    left: -9999px;
    position: absolute;
}

input.HJMinput.switch:empty ~ label {
    position: relative;
    float: left;
    line-height: 24px;
    text-indent: 56px;
    margin: 2px 0;
    cursor: pointer;
    user-select: none;
}

input.HJMinput.switch:empty ~ label:before, input.HJMinput.switch:empty ~ label:after {
    position: absolute;
    display: block;
    top: 0;
    bottom: 0;
    left: 0;
    content: " ";
    width: 48px;
    background-color: rgba(61, 64, 74, 0.82);
    border: 1px solid rgba(126, 184, 255, 0.18);
    border-radius: 999px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    -webkit-transition: all 100ms ease-in;
    transition: all 100ms ease-in;
}

#encode-bench div {
    padding: 0;
    margin: 0;
}

#encode-bench {
    margin-top: 2px;
    height: 65px;
    position: relative;
    width: 95%;
    display: grid;
    grid-template-columns: repeat(2, auto [col-start]);
    grid-auto-flow:row;
    align-items:center;
}

#encode-bench-list-header {
    text-align: center;
    padding:0;
    margin:0;
    font-weight: bold;
}

#encode-bench-header {
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    background: ${css.tooltipBackground};
    padding: 10px;
    border-radius: 10px 10px 0px 0px;
}

#bench-edit {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 9px;
    border: 1px solid rgba(158, 169, 190, 0.24);
    background: rgba(255, 255, 255, 0.06);
    color: ${css.textLight};
    display: flex;
    align-items: center;
    justify-content: center;
}

#bench-edit:before {
    content: "\\270E";
    font-size: 17px;
}

#bench-refresh {
    position: absolute;
    bottom: 40px;
    right: 5px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 9px;
    border: 1px solid rgba(158, 169, 190, 0.24);
    background: rgba(255, 255, 255, 0.06);
    color: ${css.textLight};
    display: flex;
    align-items: center;
    justify-content: center;
}

#bench-refresh:before {
    content: "\\21BB";
    font-size: 18px;
}

.block-button {
    width: 100%;
    display: inline-block;
    font-weight: 650;
    color: #f7f7f8;
    text-align: center;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-color: transparent;
    border: 1px solid rgba(126, 184, 255, 0.24);
    padding: .44rem .85rem;
    font-size: 0.86rem;
    line-height: 1.5;
    border-radius: 8px;
    transition: color .15s ease-in-out,background .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out,transform .15s ease-in-out;
    cursor: pointer;
}

.block-button:hover {
    transform: translateY(-1px);
}

.illustrated-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.illustrated-button img {
    margin-left: 0.5rem;
    max-height: 1rem;
    filter: saturate(6) invert(1) grayscale(1);
}

.bsdanger {
    color: #dedee2;
    background: rgba(61, 64, 74, 0.72);
    border-color: rgba(126, 184, 255, 0.18);
}

.bsdanger:hover {
    color: #fff;
    background: rgba(80, 85, 98, 0.82);
    border-color: rgba(126, 184, 255, 0.3);
}

.bsdanger:active {
    color: #fff;
    background: rgba(47, 156, 255, 0.18);
    border-color: rgba(126, 184, 255, 0.45);
}

.bsinfo {
    color: #fff;
    background: linear-gradient(135deg, #7eb8ff, #1c6fd1);
    border-color: rgba(126, 184, 255, 0.62);
    box-shadow: 0 0 18px rgba(47, 156, 255, 0.18);
}

.bsinfo:hover {
    color: #fff;
    background: linear-gradient(135deg, #9ac8ff, #2f8bed);
    border-color: rgba(126, 184, 255, 0.78);
}

.bsinfo:active {
    color: #fff;
    background: linear-gradient(135deg, #5aa3ff, #165ead);
    border-color: rgba(126, 184, 255, 0.7);
}

.bswarning {
	color: #f7f7f8;
    background: rgba(126, 184, 255, 0.12);
    border-color: rgba(126, 184, 255, 0.28);
}

.bswarning:hover {
	color: #fff;
    background: rgba(126, 184, 255, 0.18);
    border-color: rgba(126, 184, 255, 0.44);
}

.bswarning:active {
	color: #fff;
    background: rgba(47, 156, 255, 0.22);
    border-color: rgba(126, 184, 255, 0.52);
}

.bssuccess {
    color: #fff;
    background: linear-gradient(135deg, #7eb8ff, #1c6fd1);
    border-color: rgba(126, 184, 255, 0.62);
}

#HJM-fullscreen-bench {
    width: ${barWidth}px;
}

.bssuccess:hover {
    color: #fff;
    background: linear-gradient(135deg, #9ac8ff, #2f8bed);
    border-color: rgba(126, 184, 255, 0.78);
}

.bssuccess:active {
    color: #fff;
    background: linear-gradient(135deg, #5aa3ff, #165ead);
    border-color: rgba(126, 184, 255, 0.7);
}

#bench-refresh.spin {
    animation: spin 2s linear infinite;
}

.spin-anticlockwise {
    animation: spin-anti 2s linear infinite;
}

#hsf-iwet-error {
    margin: 10px auto;
    display: none;
    flex-flow: column;
    max-width: ${barWidth}px;
}

input.HJMinput.switch:empty ~ label:after {
    width: 20px;
    top: 3px;
    bottom: 3px;
    margin-left: 4px;
    background-color: #dedee2;
    border: 0;
    border-radius: 999px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
}

input.HJMinput.switch:checked ~ label:before {
    background: linear-gradient(135deg, #7eb8ff, #1c6fd1);
    border-color: rgba(126, 184, 255, 0.7);
    box-shadow: 0 0 18px rgba(47, 156, 255, 0.22);
}

input.HJMinput.switch:checked ~ label:after {
    margin-left: 24px;
}

 #handjob-history-icon {
    background-color: #ddd;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

#handjob-history-icon:before {
    content: "\\2630";
    color: #111;
    font-size: 18px;
    font-weight: 700;
}

.HJ-toolkit-member-toolbar-flex {
    justify-content: space-between;
    align-items: stretch;
    position: absolute;
    bottom: 0;
    display: flex;
    width: 100%;
    padding: 0;
    height: 100%;
    gap: 22px;
}

.unselectable {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.HJ-toolkit-member-toolbar {
    font-family: ${css.font};
    overflow: hidden;
    display: none;
    background:
        linear-gradient(180deg, rgba(23,24,29,.98) 0%, rgba(15,16,20,.99) 54%, rgba(10,11,14,.99) 100%),
        linear-gradient(90deg, rgba(47,156,255,.12), transparent 58%);
    color: #dedee2;
    text-shadow: none;
    width: ${barWidth}px;
    max-width: calc(100vw - 88px);
    position: fixed;
    right: 44px;
    top: 150px;
    border: 1px solid rgba(126, 184, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 16px 44px rgba(0,0,0,.34), 0 0 22px rgba(47,156,255,.16), inset 0 1px 0 rgba(255,255,255,.05);
    font-size: 14px;
    text-decoration: none;
    transition: height 300ms ease-in;
    z-index: 999;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    backdrop-filter: blur(14px);
}

.HJ-toolkit-member-toolbar main {
    position: relative;
}

section.HJ-toolkit-slide-wrapper {
    width: 100%;
    height: ${barHeight}px;
}

.HJ-toolkit-member-toolbar a {
    color: #dedee2;
    text-shadow: none;
    text-decoration: none;
    -webkit-transition: color 150ms ease-in;
    -moz-transition: color 150ms ease-in;
    -o-transition: color 150ms ease-in;
    -ms-transition: color 150ms ease-in;
    transition: color 150ms ease-in;
}

.HJ-toolkit-member-toolbar a:hover {
    color: #7eb8ff;
}

.HJ-toolkit-member-toolbar ul {
    list-style-type: none;
}

.HJ-toolkit-member-toolbar ul li {
    padding: 2px 0;
}

.HJ-toolkit-member-toolbar ul li.li-break {
    padding-top: 10px;
}

.HJ-toolkit-badge {
    display: none;
    position: fixed;
    height: 30px;
    width: 30px;
    top: 118px;
    right: 42px;
    margin: 0;
    z-index: 1000;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: #7eb8ff;
    align-items: center;
    justify-content: center;
}

.HJM-toolbar-in-menu .HJ-toolkit-menu-item {
    margin-left: auto;
    float: right;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    padding: 0 18px;
}

.HJM-toolbar-in-menu .HJ-toolkit-badge {
    position: static;
    display: inline-flex !important;
    margin: 0;
    height: 100%;
    min-height: 34px;
    width: auto;
    padding: 0;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-weight: 700;
    letter-spacing: 0;
    color: inherit;
    text-shadow: none;
    white-space: nowrap;
}

.HJ-toolkit-badge .HJ-toolkit-member-toolbar-announcements-alert {
    display: none;
}

.HJ-toolkit-badge:before {
    content: none;
}

.HJ-toolkit-badge:hover {
    color: #7eb8ff;
    text-shadow: 0 0 8px rgba(126, 184, 255, 0.85);
    -webkit-filter: drop-shadow(0px 0px 6px rgba(126, 184, 255, 0.75));
    filter: drop-shadow(0px 0px 6px rgba(126, 184, 255, 0.75));
}

.HJ-hover {
    -webkit-backface-visibility: hidden;
    -webkit-transform: translateZ(0) scale(1.0, 1.0);
    -webkit-transition: filter 200ms;
    transition: filter 200ms;
    cursor: pointer;
}

.HJ-hover:not(.HJ-toolkit-badge):hover {
    -webkit-filter: drop-shadow(0px 0px 7px ${css.textLight});
    filter: drop-shadow(0px 0px 10px ${css.textLight});
}

.BS-alert {
    position: relative;
    padding: 7px 15px;
    margin: 4px 10px;
    border: 1px solid transparent;
    border-radius: .25rem;
}

.BS-alert.expand-msg {
    cursor: pointer;
    transition: transform 100ms ease-in;
}

.BS-alert.expand-msg:hover {
    transform: scale(1.01);
}

.BS-alert a {
    font-weight: bold;
    color: #000;
    text-decoration: none;
}

.BS-alert a:hover {
    color: #555;
}

.BS-alert-danger, .HJM-modal-inner.danger .HJM-modal-body {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
}

.HJM-modal-body a {
    color: crimson;
    text-style: underline;
}

.BS-alert-primary, .HJM-modal-inner.primary .HJM-modal-body {
    color: #004085;
    background-color: #cce5ff;
    border-color: #b8daff;
}

.lightbox-msg-standard {
    color: ${css.text};
    background: ${css.background};
    border-color: ${css.border};
    border-style: solid;
    border-width: 2px;
    padding:0 !important;
}

.BS-alert-success, .HJM-modal-inner.success .HJM-modal-body {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
}

.BS-alert-info, .HJM-modal-inner.info .HJM-modal-body {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
}

.BS-alert-warning, .HJM-modal-inner.warning .HJM-modal-body {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeeba;
}

.lightbox-msg span.close-alert {
    font-size: 22px;
    top: 10px;
    right: 5px;
}

.delete-alert {
    position: absolute;
    right: 5px;
    height: 100%;
    top: 0;
    padding: 4px;
    opacity: 0.55;
    transition: opacity 100ms ease-in-out;
    font-size: 18px;
    line-height: 1.2;
    color: ${css.textLight};
}

.delete-alert:hover {
    opacity: 0.85;
}

span.close-guide {
    cursor: pointer;
    position: fixed;
    top: 50px;
    right: 50px;
    width: 50px;
    height: 50px;
    opacity: 0.5;
    font-size: 25px;
    font-weight: bold;
    background: #555;
    color: #ccc;
    transition: all 100ms ease-in;
    text-align: center;
    line-height: 50px;
}

.screenshot-comparison__container {
    z-index: 9999;
}

span.close-guide:hover {
    color: #fff;
    text-decoration: none;
    opacity: 0.75;
}

span.close-alert:hover {
    color: #000;
    text-decoration: none;
    opacity: .75;
}

textarea.textarea-small {max-height: 20px;}

span.close-alert {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    content: "x";
    font-weight: bold;
    padding: 7px 15px;
    font-size: 14px;
    line-height: 14px;
    text-shadow: 0 1px 0 #fff;
    opacity: .5;
}

.lightbox-msg {
    max-height: 100%;
    max-width: 700px;
    min-width: 500px;
    text-align: justify;
    position: absolute;
    font-size: 14px;
    border-radius: 10px;
    padding: 20px;
    top: 50%;
    transform: translateY(-50%);
    overflow: auto;
    font-family: arial, sans-serif;
}

.lightbox-msg a {
    text-decoration: none;
    font-weight: bold;
    color: #555;
}

.lightbox-msg a:hover {
    color: inherit;
    text-decoration: underline;
}

.lightbox-hsf {
    font-size: 14px;
    background: ${css.background};
    line-height: normal !important;
    max-width: none !important;
    color: ${css.text};
    border-color: ${css.border};
    border-radius: 4px 4px 4px 4px;
    border-style: solid;
    border-width: 2px !important;
}

.flex-centre {
    display: flex;
    justify-content: center;
    align-items: center;
}

.lightbox-msg h2 {
    text-align: center;
}

span.is-message {
    position: absolute;
    height: 20px;
    top: calc(50% - 10px);
    right: 50px;
    opacity: 0.15;
}

span.is-message img {
    height: 100%;
    width: auto;
}

.fieldRequired {
    border: 1px solid red;
}

.lightbox-header {
    display: flex;
    justify-content: center;
}

.lightbox-header h2 {
    padding: 0px 20px;
    border-width: 0px 1px 0px 1px;
    border-style: solid;
    border-color: #000;
    font-family: Impact, serif;
    font-size: 25px;
}

.lightbox-msg-primary {
    color: #004085;
    border-color: #b8daff;
    background-color: #cce5ff;
}

.lightbox-menu {
    background: linear-gradient(to bottom, #1091ec, #0a6baf);
    color: #000;
}

.lightbox-menu h2 {
    color: #004085;
}

.lightbox-msg-warning {
    border: 2px solid rgba(255,243,205,0.7);
    background: rgba(255,243,205,0.86);
    color: #856404;
}

.HJ-toolkit-member-toolbar-announcements {
    width: 100%;
    display: none;
    height: auto;
    text-shadow: initial;
}

[data-notifications] {
    position: relative;
}

[data-notifications]:after {
    filter: unset;
    content: attr(data-notifications);
    position: absolute;
    background: red;
    border-radius: 50%;
    display: inline-block;
    padding: 0.3em;
    color: #f2f2f2;
    left: 40px;
    width: 20px;
    height: 20px;
    text-align: center;
    font-style: normal;
    font-weight: bold;
}

.HJ-toolkit-member-toolbar-services {
    position: relative;
    bottom: unset;
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: auto;
    padding: 10px 0 0;
    border-top: 1px solid rgba(126, 184, 255, 0.13);
}

.handjob-services-icon {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 10px;
    border: 1px solid rgba(126, 184, 255, 0.22);
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.025));
    color: #7eb8ff;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    -webkit-transition: transform 150ms, filter 150ms, background 150ms, border-color 150ms;
    transition: transform 150ms, filter 150ms, background 150ms, border-color 150ms;
}

.handjob-services-icon:hover {
    transform: translateY(-1px);
    background: linear-gradient(135deg, rgba(126,184,255,.18), rgba(28,111,209,.08));
    border-color: rgba(126, 184, 255, 0.5);
    -webkit-filter: drop-shadow(0px 0px 6px rgba(126, 184, 255, 0.42));
    filter: drop-shadow(0px 0px 6px rgba(126, 184, 255, 0.42));
}

.HJMcontainer2 {
    margin-left: ${barWidth}px;
}

.HJslidecontainer {
    width: ${barWidth}px;
    height: ${barHeight}px;
    position: absolute;
    bottom: 0;
    transition: margin-left 300ms ease-in;
}

.HJslidecontainer h1 {
    text-align: center;
    color: #f7f7f8;
    text-shadow: none;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0;
    margin-top: 12px;
    margin-bottom: 10px;
}

a.HJMnavigation {
    position: absolute;
    margin: 0px 10px 0px 10px;
    font-size: 24px;
    line-height: 24px;
    text-decoration: none;
    display: inline-block;
    padding: 8px 16px;
    top: 10px;
    z-index: 9999;
}

a.HJMnavigation:hover {
    background-color: #999;
    color: white;
}

.flex-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: row;
    position: relative;
    padding-left: 40px;
    padding-right: 10px;
}

.HJMnavigation.previous {
    background-color: #555;
    color: white;
}

.HJMnavigation.next {
    background-color: #4CAF50;
    color: white;
}

.HJMnavigation.round {
    border-radius: 20px;
}

#HJM-template-container, #HJM-finish-container {
    width: 100%;
    padding: 0px 70px;
}

.HJMinputdiv {
    width: 100%;
    padding: 0 20px 0 50px;
}

#HJM-profile-container {
}

#HJM-template-container {
    position: relative;
}

.HJMinputdiv input[type=text], .HJMinputdiv textarea {
    width: 100%;
}

.HJMinputdiv textarea.txtthin {
    width: 75%;
}

.handjob-rank {
    position: absolute;
    bottom: 0;
    right: 0;
    padding-right: 5px;
    padding-bottom: 5px;
    width: 100%;
    font-weight: bold;
    text-align: right;
}

.handjob-approver {
    filter: hue-rotate(100deg) brightness(2);
}

.forum-post__body {
    position: relative;
}

.forum-post__bodyguard {
    transition: padding-bottom 300ms linear;
}

.forum-post__bodyguard.expand-bodyguard {
    padding-bottom: 15px;
}

textarea.noresize {
    resize: none;
}

.HJM-approval-post textarea:not(.large-scanner) {
    max-height: 40px;
}

.help-tip {
    position: absolute;
    top: -10px;
    text-align: center;
    background-color: #004088;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 13px;
    line-height: 20px;
    cursor: default;
    right: 27px;
}

.help-tip:before {
    content:'?';
    font-weight: bold;
    color:#fff;
}

.HJM_feedback-link, .mi-feedback-message span {
    padding: 0 0.3rem;
}

.help-tip:hover p {
    display:block;
    transform-origin: 100% 0%;
    -webkit-animation: fadeIn 0.3s ease-in-out;
    animation: fadeIn 0.3s ease-in-out;
}

.help-tip p {    /* The tooltip */
    pointer-events: none;
    display: none;
    background-color: ${css.tooltipBackground};
    padding: 4px 10px;
    width: 250px;
    position: absolute;
    border-radius: 3px;
    box-shadow: 2px 2px 7px rgba(0, 0, 0, 0.63);
    right: -7px;
    color: ${css.text};
    font-size: 13px;
    line-height: 1.4;
    border: 1px solid #00408b;
    margin-top: 4px;
}

.help-tip.inverted p {
    margin-top: 4px;
    bottom: 20px;
    width: 400px;
}

.help-tip p:before { /* The pointer of the tooltip */
    position: absolute;
    content: '';
    width:0;
    height: 0;
    border:6px solid transparent;
    border-bottom-color: ${css.tooltipBackground};
    right: 10px;
    top: -12px;
}

.help-tip.inverted p:before {
    border-top-color: ${css.tooltipBackground};
    border-bottom-color: transparent;
    bottom: -12px;
    top: unset;
}

ul.error-list li {
    line-height: 1.5em;
}

ul.error-list li button.expand-guide {
    line-height: initial;
}

#handjob-guide-overlay {
    text-align: left;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: ${css.background};
    z-index: 9999;
    overflow: auto;
    font-size: 14px;
    padding: 0px 20px;
    display: none;
    color: ${css.text};
}

#handjob-guide-overlay blockquote:not(.hj-guide-section-block) {
     background: ${css.backgroundShade};
}

#handjob-guide-overlay a {
    color: ${css.link};
}

#handjob-guide-overlay a:hover {
    color: ${css.hover};
}

#handjob-guide-overlay img.bbcode__image {
    max-width: 100%;
}

#hj-overlay-container {
    background: ${css.backgroundContainer};
    max-width: 1080px;
    margin: 0 auto;
    border-width: 0px 1px 1px 1px;
    border-style: solid;
    border-color: ${css.border};
    padding: 0 40px;
    min-height: 100%;
}

.help-tip p:after{ /* Prevents the tooltip from being hidden */
    width:100%;
    height:40px;
    content:'';
    position: absolute;
    top:-40px;
    left:0;
}

span.mi-feedback {
    display: block;
}

.lightbox-miscan {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 20px;
    background: ${css.background};
    border-width: 2px 2px 0px 2px;
    border-style: solid;
    border-radius: 4px;
    overflow: hidden;
    border-color: ${css.border};
}

.lightbox-miscan:after {
    content: "";
    background: url(${logos.handjob});
    opacity: 0.15;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    -webkit-transform: rotate(20deg);
    -moz-transform: rotate(20deg);
    -ms-transform: rotate(20deg);
    -o-transform: rotate(20deg);
    transform: rotate(20deg);
    overflow: hidden;
}

.miscan-results-body {
    text-align: left;
    font-size: 1rem;
    z-index: 9998;
    position: absolute;
    width: 100%;
}

#MIscan-title {
    color: ${css.textLight};
    text-shadow: ${css.textShadow};
    display: inline-flex;
    align-items: center;
    width: 100%;
    justify-content: center;
}

#MIscan-title img {
    height: 40px;
    width: auto;
    margin-right: 20px;
}

.highlight-text {
    font-weight: bold;
    color: orange;
}

.miscan-breaker {
    color: #fff;
    background-color: #1091ec;
    border-color: ${css.border};
    padding: 5px 20px;
    margin-left: -20px;
    width: calc(100% + 40px);
    /* border-style: solid; */
    border-width: 2px 0px;
    font-family: raleway, arial black, sans-serif;
    text-indent: 5%;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 24px;
    text-shadow: -3px 3px 1px rgba(0, 0, 0, 0.46);
}

.mi-errors-section {
    border-color: ${css.feedbackColours.error};
}

span.red {
    color: #ed143d;
}

a[href*="torrents.php?id="].show-context-menu {
    cursor: context-menu;
}

#miscan-metatitle-header {
    min-height: 37px;
    text-align: center;
    font-weight: bold;
    /* padding-top: 5px; */
    color: #8ebc8c;
    font-style: italic;
    border-left: 10px solid #0b91f0;
    line-height: 37px;
    text-shadow: ${css.textShadow};
}

button.expand-guide {
    margin: 5px 0px 5px 20px;
    padding: 4px 20px;
    color: ${css.text};
    text-shadow: ${css.textShadow};
    background-color: #17a2b800;
    border-color: #17a2b8;
    border-width: 0px 5px;
    border-style: solid;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 1rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    transform: skew(-30deg);
}

button.expand-guide div {
   transform: skew(30deg);
}

.hj-guide-section-block {
    background-color: ${css.guideBlocks};
    border: 0;
    padding: 0;
}

button.expand-guide:hover {
    color: #fff;
    background-color: #138496;
    border-color: #117a8b;
    cursor: pointer;
}

.mi-warnings-section {
    border-color: ${css.feedbackColours.warning};
}

.mi-advisories-section {
    border-color: ${css.feedbackColours.advisory};
}

.mi-feedback-div {
    color: ${css.text};
    text-shadow: ${css.textShadow};
    border-width: 0px 0px 0px 10px;
    border-style: solid;
    padding-left: 10px;
    padding-right: 40px;
}

.mi-feedback-div div.mi-feedback-message {
    padding: 4px 0px;
    min-height: 37px;
    align-items: center;
}

.mi-feedback-div div.mi-feedback-message-col {
    padding: 8px 0px;
    min-height: 37px;
    display: flex;
    flex-flow: column;
    align-items: flex-start;
}

.mi-feedback-div ul {
    margin: 0 1em;
}

.hj-guide-header {
    width: 100%;
    text-align: center;
    height: 170px;
    padding-top: 30px;
}

.hj-guide-header img {
    height: 100%;
    width: auto;
}

</style>`;
			try {
				$("head").append(html);
			} catch (e) {
				reject(e);
			}
			$("body").append("<input type='hidden' id='HJM_loading' value='active'>");
			resolve();
		});
	}

	String.prototype.hashCode = function () {
		var hash = 0,
			i,
			chr;
		if (this.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			chr = this.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	// ########## RAINBOW SCRIPT #############

	function Rainbow() {
		var gradients = null;
		var minNum = 0;
		var maxNum = 100;
		var colours = ["ff0000", "ffff00", "00ff00", "0000ff"];
		setColours(colours);

		function setColours(spectrum) {
			if (spectrum.length < 2) {
				throw new Error("Rainbow must have two or more colours.");
			} else {
				var increment = (maxNum - minNum) / (spectrum.length - 1);
				var firstGradient = new ColourGradient();
				firstGradient.setGradient(spectrum[0], spectrum[1]);
				firstGradient.setNumberRange(minNum, minNum + increment);
				gradients = [firstGradient];

				for (var i = 1; i < spectrum.length - 1; i++) {
					var colourGradient = new ColourGradient();
					colourGradient.setGradient(spectrum[i], spectrum[i + 1]);
					colourGradient.setNumberRange(minNum + increment * i, minNum + increment * (i + 1));
					gradients[i] = colourGradient;
				}

				colours = spectrum;
			}
		}

		this.setSpectrum = function () {
			setColours(arguments);
			return this;
		};

		this.setSpectrumByArray = function (array) {
			setColours(array);
			return this;
		};

		this.colourAt = function (number) {
			if (isNaN(number)) {
				throw new TypeError(number + " is not a number");
			} else if (gradients.length === 1) {
				return gradients[0].colourAt(number);
			} else {
				var segment = (maxNum - minNum) / gradients.length;
				var index = Math.min(Math.floor((Math.max(number, minNum) - minNum) / segment), gradients.length - 1);
				return gradients[index].colourAt(number);
			}
		};

		this.colorAt = this.colourAt;

		this.setNumberRange = function (minNumber, maxNumber) {
			if (maxNumber > minNumber) {
				minNum = minNumber;
				maxNum = maxNumber;
				setColours(colours);
			} else {
				throw new RangeError("maxNumber (" + maxNumber + ") is not greater than minNumber (" + minNumber + ")");
			}
			return this;
		};
	}

	function ColourGradient() {
		var startColour = "ff0000";
		var endColour = "0000ff";
		var minNum = 0;
		var maxNum = 100;

		this.setGradient = function (colourStart, colourEnd) {
			startColour = getHexColour(colourStart);
			endColour = getHexColour(colourEnd);
		};

		this.setNumberRange = function (minNumber, maxNumber) {
			if (maxNumber > minNumber) {
				minNum = minNumber;
				maxNum = maxNumber;
			} else {
				throw new RangeError("maxNumber (" + maxNumber + ") is not greater than minNumber (" + minNumber + ")");
			}
		};

		this.colourAt = function (number) {
			return (
				calcHex(number, startColour.substring(0, 2), endColour.substring(0, 2)) +
				calcHex(number, startColour.substring(2, 4), endColour.substring(2, 4)) +
				calcHex(number, startColour.substring(4, 6), endColour.substring(4, 6))
			);
		};

		function calcHex(number, channelStart_Base16, channelEnd_Base16) {
			var num = number;
			if (num < minNum) {
				num = minNum;
			}
			if (num > maxNum) {
				num = maxNum;
			}
			var numRange = maxNum - minNum;
			var cStart_Base10 = parseInt(channelStart_Base16, 16);
			var cEnd_Base10 = parseInt(channelEnd_Base16, 16);
			var cPerUnit = (cEnd_Base10 - cStart_Base10) / numRange;
			var c_Base10 = Math.round(cPerUnit * (num - minNum) + cStart_Base10);
			return formatHex(c_Base10.toString(16));
		}

		function formatHex(hex) {
			if (hex.length === 1) {
				return "0" + hex;
			} else {
				return hex;
			}
		}

		function isHexColour(string) {
			var regex = /^#?[0-9a-fA-F]{6}$/i;
			return regex.test(string);
		}

		function getHexColour(string) {
			if (isHexColour(string)) {
				return string.substring(string.length - 6, string.length);
			} else {
				throw new Error(string + " is not a valid colour.");
			}
		}
	}

	function commaSeparateNumber(val) {
		while (/(\d+)(\d{3})/.test(val.toString())) {
			val = val.toString().replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
		}
		return val;
	}

	function checkGuideDupes(feedback) {
		for (let key in feedback) {
			if (key == "guides") continue;
			for (let key2 in feedback[key]) {
				for (let i = 0; i < feedback[key][key2].length; i++) {
					var a = "";
					try {
						a = feedback[key][key2][i].output.match(/data-guide="([a-z]+)"/)[1];
					} catch (e) {
						a = "";
					}
					if (a && !feedback.guides.includes(a)) feedback.guides.push(a);
				}
			}
		}
	}

	function versionCompare(a, b) {
		const [one, two] = [a, b].map((x) => x.split("."));
		while (one.length > 0 || two.length > 0) {
			const compA = parseInt(one.shift(), 10);
			const compB = parseInt(two.shift(), 10);
			if ((!compA && compB) || compA < compB) return 2;
			else if ((!compB && compA) || compB < compA) return 0;
		}
		return 1;
	}

	function loadHandjobGuideExcerpt(section, subSection = false) {
		saveStack("loadHandjobGuideExcerpt");
		let raw = cache.data.handjobGuide,
			ex = "";
		let header = `<div class='hj-guide-header'><img src='${logos.handjob}'></div>`;

		var cleanBlock = function (block) {
			$(block).find('a[href*="javascript"]').remove(); // max-width: 100%;
			block = $(block).find("blockquote.hidden");
			$(block).removeClass("hidden").addClass("hj-guide-section-block");
			$(block).find("img").removeAttr("onclick");
			$(block).find('div img[src="https://ptpimg.me/c3qzae.png"]').replaceWith("<br>");
			return block;
		};

		if (section.search(/faq/i) >= 0) {
			let link = $('a[name="' + section + '"]', raw);
			let block = $(link).closest("span");
			let secTitle = $(block).text();
			secTitle = "<h2>" + secTitle + "</h2>";
			block = $(block).nextAll("blockquote");
			//block = cleanBlock(block);
			ex = secTitle + block.html();
		} else {
			let link = $('a[name="' + section + '"]', raw);
			let block = $(link).closest("li");
			let secTitle = $(block).find("a").first().text();
			secTitle = "<h2>" + secTitle + "</h2>";
			block = cleanBlock(block);
			if (subSection) {
				let cut = block[0].outerHTML;
				var splitter,
					alt = false;
				if (section.search(/eac/i) >= 0) {
					splitter = `<div style="text-align:right"><span style="color:#1091ec"><strong>${subSection}</strong></span></div>`;
					alt = true;
				} else
					splitter = `<div style="text-align:center"><hr><strong><span style="color:#339933"><span class="bbcode-size-3">${subSection}`;
				cut = cut.split(splitter)[1];
				if (alt)
					cut = splitter + cut.split(`<div style="text-align:right"><span style="color:#1091ec"><strong>`)[0];
				else
					cut =
						splitter +
						cut.split(
							`<div style="text-align:center"><hr><strong><span style="color:#339933"><span class="bbcode-size-3">`
						)[0];
				ex = secTitle + cut;
			} else {
				ex = secTitle + block[0].outerHTML;
			}
		}
		if (cache.settings.theme != "dark") ex = ex.replace(/#d9eaff/gi, css.text2).replace(/#d9ffea/gi, css.text3);
		return "<span class='close-guide'>X</span><div id='hj-overlay-container'> " + header + ex + "</div>";
	}

	function decapFirst(string) {
		return string.charAt(0).toLowerCase() + string.slice(1);
	}

	function capFirst(string) {
		let arr = string.split("-");
		arr = arr.map((x) => x.charAt(0).toUpperCase() + x.slice(1));
		return arr.join("-");
	}

	function insertUploadTemplate(insert) {
		let releaseDesc = document.getElementById("release_desc");
		if (!releaseDesc) return false;
		var caretPos = releaseDesc.selectionStart;
		var caretEnd = releaseDesc.selectionEnd;
		var textAreaTxt = releaseDesc.value;
		$("#release_desc").val(textAreaTxt.substring(0, caretPos) + insert + textAreaTxt.substring(caretEnd));
		$("#release_desc").focus();
		releaseDesc.selectionStart = caretPos + insert.length;
		releaseDesc.selectionEnd = caretPos + insert.length;
	}

	function truncate(x, n) {
		// Replace incoming special characters for length check
		let y = x.replace(/&[^\s;]*;/g, "a");
		return y.length > n ? x.substr(0, n - 1).trim() + "&hellip;" : x;
	}

	function parseHTMLtoDOM(raw) {
		const parser = new DOMParser();
		return parser.parseFromString(raw, "text/html");
	}

	function decodeDataFromJWT(token) {
		if (!token) return null;
		const decoded = JSON.parse(atob(token.split(".")[1]));
		if (decoded && decoded.data && decoded.data.username) return decoded.data;
		else return null;
	}

	$("HTML").on("paste", function (e) {
		e = $.extend({}, e, { type: "afterpaste" });
		window.setTimeout(function () {
			$(e.target).trigger(e);
		}, 0);
	});

	(function () {
		if (!$.isFunction($jq.prototype.getSelection)) {
			(function (m) {
				function u(e, d) {
					var b = typeof e[d];
					return "function" === b || !!("object" == b && e[d]) || "unknown" == b;
				}
				function v(e, d, b) {
					0 > d && (d += e.value.length);
					typeof b == j && (b = d);
					0 > b && (b += e.value.length);
					return { start: d, end: b };
				}
				function n() {
					return "object" == typeof document.body && document.body
						? document.body
						: document.getElementsByTagName("body")[0];
				}
				var j = "undefined",
					g,
					f,
					p,
					k,
					q,
					r,
					s,
					t,
					l;
				m(document).ready(function () {
					function e(b, a) {
						return function () {
							var c = this.jquery ? this[0] : this,
								h = c.nodeName.toLowerCase();
							if (1 == c.nodeType && ("textarea" == h || ("input" == h && "text" == c.type)))
								if (
									((c = [c].concat(Array.prototype.slice.call(arguments))),
									(c = b.apply(this, c)),
									!a)
								)
									return c;
							if (a) return this;
						};
					}
					var d = document.createElement("textarea");
					n().appendChild(d);
					if (typeof d.selectionStart != j && typeof d.selectionEnd != j)
						(g = function (b) {
							var a = b.selectionStart,
								c = b.selectionEnd;
							return {
								start: a,
								end: c,
								length: c - a,
								text: b.value.slice(a, c),
							};
						}),
							(f = function (b, a, c) {
								a = v(b, a, c);
								b.selectionStart = a.start;
								b.selectionEnd = a.end;
							}),
							(l = function (b, a) {
								a ? (b.selectionEnd = b.selectionStart) : (b.selectionStart = b.selectionEnd);
							});
					else if (
						u(d, "createTextRange") &&
						"object" == typeof document.selection &&
						document.selection &&
						u(document.selection, "createRange")
					)
						(g = function (b) {
							var a = 0,
								c = 0,
								h,
								e,
								d;
							if ((d = document.selection.createRange()) && d.parentElement() == b)
								(e = b.value.length),
									(h = b.value.replace(/\r\n/g, "\n")),
									(c = b.createTextRange()),
									c.moveToBookmark(d.getBookmark()),
									(d = b.createTextRange()),
									d.collapse(!1),
									-1 < c.compareEndPoints("StartToEnd", d)
										? (a = c = e)
										: ((a = -c.moveStart("character", -e)),
										  (a += h.slice(0, a).split("\n").length - 1),
										  -1 < c.compareEndPoints("EndToEnd", d)
												? (c = e)
												: ((c = -c.moveEnd("character", -e)),
												  (c += h.slice(0, c).split("\n").length - 1)));
							return {
								start: a,
								end: c,
								length: c - a,
								text: b.value.slice(a, c),
							};
						}),
							(f = function (b, a, c) {
								a = v(b, a, c);
								c = b.createTextRange();
								var d = a.start - (b.value.slice(0, a.start).split("\r\n").length - 1);
								c.collapse(!0);
								a.start == a.end
									? c.move("character", d)
									: (c.moveEnd(
											"character",
											a.end - (b.value.slice(0, a.end).split("\r\n").length - 1)
									  ),
									  c.moveStart("character", d));
								c.select();
							}),
							(l = function (b, a) {
								var c = document.selection.createRange();
								c.collapse(a);
								c.select();
							});
					else {
						n().removeChild(d);
						window.console &&
							window.console.log &&
							window.console.log(
								"RangyInputs not supported in your browser. Reason: No means of finding text input caret position"
							);
						return;
					}
					n().removeChild(d);
					k = function (b, a, c, d) {
						var e;
						a != c && ((e = b.value), (b.value = e.slice(0, a) + e.slice(c)));
						d && f(b, a, a);
					};
					p = function (b) {
						var a = g(b);
						k(b, a.start, a.end, !0);
					};
					t = function (b) {
						var a = g(b),
							c;
						a.start != a.end && ((c = b.value), (b.value = c.slice(0, a.start) + c.slice(a.end)));
						f(b, a.start, a.start);
						return a.text;
					};
					q = function (b, a, c, d) {
						var e = b.value;
						b.value = e.slice(0, c) + a + e.slice(c);
						d && ((a = c + a.length), f(b, a, a));
					};
					r = function (b, a) {
						var c = g(b),
							d = b.value;
						b.value = d.slice(0, c.start) + a + d.slice(c.end);
						c = c.start + a.length;
						f(b, c, c);
					};
					s = function (b, a, c) {
						typeof c == j && (c = a);
						var d = g(b),
							e = b.value;
						b.value = e.slice(0, d.start) + a + d.text + c + e.slice(d.end);
						a = d.start + a.length;
						f(b, a, a + d.length);
					};
					m.fn.extend({
						getSelection: e(g, !1),
						setSelection: e(f, !0),
						collapseSelection: e(l, !0),
						deleteSelectedText: e(p, !0),
						deleteText: e(k, !0),
						extractSelectedText: e(t, !1),
						insertText: e(q, !0),
						replaceSelectedText: e(r, !0),
						surroundSelectedText: e(s, !0),
					});
					m.fn.rangyInputs = {
						getSelection: g,
						setSelection: f,
						collapseSelection: l,
						deleteSelectedText: p,
						deleteText: k,
						extractSelectedText: t,
						insertText: q,
						replaceSelectedText: r,
						surroundSelectedText: s,
					};
				});
			})($jq);
		}

		if (!$.isFunction($jq.prototype.qtip)) {
			!(function (a, b, c) {
				!(function (a) {
					"use strict";
					"function" == typeof define && define.amd ? define(["jquery"], a) : $jq && !$jq.fn.qtip && a($jq);
				})(function (d) {
					"use strict";
					function e(a, b, c, e) {
						(this.id = c),
							(this.target = a),
							(this.tooltip = F),
							(this.elements = { target: a }),
							(this._id = S + "-" + c),
							(this.timers = { img: {} }),
							(this.options = b),
							(this.plugins = {}),
							(this.cache = {
								event: {},
								target: d(),
								disabled: E,
								attr: e,
								onTooltip: E,
								lastClass: "",
							}),
							(this.rendered =
								this.destroyed =
								this.disabled =
								this.waiting =
								this.hiddenDuringWait =
								this.positioning =
								this.triggering =
									E);
					}
					function f(a) {
						return a === F || "object" !== d.type(a);
					}
					function g(a) {
						return !(
							d.isFunction(a) ||
							(a && a.attr) ||
							a.length ||
							("object" === d.type(a) && (a.jquery || a.then))
						);
					}
					function h(a) {
						var b, c, e, h;
						return f(a)
							? E
							: (f(a.metadata) && (a.metadata = { type: a.metadata }),
							  "content" in a &&
									((b = a.content),
									f(b) || b.jquery || b.done
										? (b = a.content = { text: (c = g(b) ? E : b) })
										: (c = b.text),
									"ajax" in b &&
										((e = b.ajax),
										(h = e && e.once !== E),
										delete b.ajax,
										(b.text = function (a, b) {
											var f = c || d(this).attr(b.options.content.attr) || "Loading...",
												g = d
													.ajax(d.extend({}, e, { context: b }))
													.then(e.success, F, e.error)
													.then(
														function (a) {
															return a && h && b.set("content.text", a), a;
														},
														function (a, c, d) {
															b.destroyed ||
																0 === a.status ||
																b.set("content.text", c + ": " + d);
														}
													);
											return h ? f : (b.set("content.text", f), g);
										})),
									"title" in b &&
										(d.isPlainObject(b.title) &&
											((b.button = b.title.button), (b.title = b.title.text)),
										g(b.title || E) && (b.title = E))),
							  "position" in a && f(a.position) && (a.position = { my: a.position, at: a.position }),
							  "show" in a &&
									f(a.show) &&
									(a.show = a.show.jquery
										? { target: a.show }
										: a.show === D
										? { ready: D }
										: { event: a.show }),
							  "hide" in a &&
									f(a.hide) &&
									(a.hide = a.hide.jquery ? { target: a.hide } : { event: a.hide }),
							  "style" in a && f(a.style) && (a.style = { classes: a.style }),
							  d.each(R, function () {
									this.sanitize && this.sanitize(a);
							  }),
							  a);
					}
					function i(a, b) {
						for (var c, d = 0, e = a, f = b.split("."); (e = e[f[d++]]); ) d < f.length && (c = e);
						return [c || a, f.pop()];
					}
					function j(a, b) {
						var c, d, e;
						for (c in this.checks)
							for (d in this.checks[c])
								(e = new RegExp(d, "i").exec(a)) &&
									(b.push(e),
									("builtin" === c || this.plugins[c]) &&
										this.checks[c][d].apply(this.plugins[c] || this, b));
					}
					function k(a) {
						return V.concat("").join(a ? "-" + a + " " : " ");
					}
					function l(a, b) {
						return b > 0 ? setTimeout(d.proxy(a, this), b) : void a.call(this);
					}
					function m(a) {
						this.tooltip.hasClass(ab) ||
							(clearTimeout(this.timers.show),
							clearTimeout(this.timers.hide),
							(this.timers.show = l.call(
								this,
								function () {
									this.toggle(D, a);
								},
								this.options.show.delay
							)));
					}
					function n(a) {
						if (!this.tooltip.hasClass(ab) && !this.destroyed) {
							var b = d(a.relatedTarget),
								c = b.closest(W)[0] === this.tooltip[0],
								e = b[0] === this.options.show.target[0];
							if (
								(clearTimeout(this.timers.show),
								clearTimeout(this.timers.hide),
								(this !== b[0] && "mouse" === this.options.position.target && c) ||
									(this.options.hide.fixed && /mouse(out|leave|move)/.test(a.type) && (c || e)))
							)
								try {
									a.preventDefault(), a.stopImmediatePropagation();
								} catch (f) {}
							else
								this.timers.hide = l.call(
									this,
									function () {
										this.toggle(E, a);
									},
									this.options.hide.delay,
									this
								);
						}
					}
					function o(a) {
						!this.tooltip.hasClass(ab) &&
							this.options.hide.inactive &&
							(clearTimeout(this.timers.inactive),
							(this.timers.inactive = l.call(
								this,
								function () {
									this.hide(a);
								},
								this.options.hide.inactive
							)));
					}
					function p(a) {
						this.rendered && this.tooltip[0].offsetWidth > 0 && this.reposition(a);
					}
					function q(a, c, e) {
						d(b.body).delegate(a, (c.split ? c : c.join("." + S + " ")) + "." + S, function () {
							var a = y.api[d.attr(this, U)];
							a && !a.disabled && e.apply(a, arguments);
						});
					}
					function r(a, c, f) {
						var g,
							i,
							j,
							k,
							l,
							m = d(b.body),
							n = a[0] === b ? m : a,
							o = a.metadata ? a.metadata(f.metadata) : F,
							p = "html5" === f.metadata.type && o ? o[f.metadata.name] : F,
							q = a.data(f.metadata.name || "qtipopts");
						try {
							q = "string" == typeof q ? d.parseJSON(q) : q;
						} catch (r) {}
						if (
							((k = d.extend(D, {}, y.defaults, f, "object" == typeof q ? h(q) : F, h(p || o))),
							(i = k.position),
							(k.id = c),
							"boolean" == typeof k.content.text)
						) {
							if (((j = a.attr(k.content.attr)), k.content.attr === E || !j)) return E;
							k.content.text = j;
						}
						if (
							(i.container.length || (i.container = m),
							i.target === E && (i.target = n),
							k.show.target === E && (k.show.target = n),
							k.show.solo === D && (k.show.solo = i.container.closest("body")),
							k.hide.target === E && (k.hide.target = n),
							k.position.viewport === D && (k.position.viewport = i.container),
							(i.container = i.container.eq(0)),
							(i.at = new A(i.at, D)),
							(i.my = new A(i.my)),
							a.data(S))
						)
							if (k.overwrite) a.qtip("destroy", !0);
							else if (k.overwrite === E) return E;
						return (
							a.attr(T, c),
							k.suppress && (l = a.attr("title")) && a.removeAttr("title").attr(cb, l).attr("title", ""),
							(g = new e(a, k, c, !!j)),
							a.data(S, g),
							g
						);
					}
					function s(a) {
						return a.charAt(0).toUpperCase() + a.slice(1);
					}
					function t(a, b) {
						var d,
							e,
							f = b.charAt(0).toUpperCase() + b.slice(1),
							g = (b + " " + rb.join(f + " ") + f).split(" "),
							h = 0;
						if (qb[b]) return a.css(qb[b]);
						for (; (d = g[h++]); ) if ((e = a.css(d)) !== c) return (qb[b] = d), e;
					}
					function u(a, b) {
						return Math.ceil(parseFloat(t(a, b)));
					}
					function v(a, b) {
						(this._ns = "tip"),
							(this.options = b),
							(this.offset = b.offset),
							(this.size = [b.width, b.height]),
							this.init((this.qtip = a));
					}
					function w(a, b) {
						(this.options = b), (this._ns = "-modal"), this.init((this.qtip = a));
					}
					function x(a) {
						(this._ns = "ie6"), this.init((this.qtip = a));
					}
					var y,
						z,
						A,
						B,
						C,
						D = !0,
						E = !1,
						F = null,
						G = "x",
						H = "y",
						I = "width",
						J = "height",
						K = "top",
						L = "left",
						M = "bottom",
						N = "right",
						O = "center",
						P = "flipinvert",
						Q = "shift",
						R = {},
						S = "qtip",
						T = "data-hasqtip",
						U = "data-qtip-id",
						V = ["ui-widget", "ui-tooltip"],
						W = "." + S,
						X = "click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "),
						Y = S + "-fixed",
						Z = S + "-default",
						$ = S + "-focus",
						_ = S + "-hover",
						ab = S + "-disabled",
						bb = "_replacedByqTip",
						cb = "oldtitle",
						db = {
							ie: (function () {
								for (
									var a = 4, c = b.createElement("div");
									(c.innerHTML = "<!--[if gt IE " + a + "]><i></i><![endif]-->") &&
									c.getElementsByTagName("i")[0];
									a += 1
								);
								return a > 4 ? a : 0 / 0;
							})(),
							iOS:
								parseFloat(
									(
										"" +
										(/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(
											navigator.userAgent
										) || [0, ""])[1]
									)
										.replace("undefined", "3_2")
										.replace("_", ".")
										.replace("_", "")
								) || E,
						};
					(z = e.prototype),
						(z._when = function (a) {
							return d.when.apply(d, a);
						}),
						(z.render = function (a) {
							if (this.rendered || this.destroyed) return this;
							var b,
								c = this,
								e = this.options,
								f = this.cache,
								g = this.elements,
								h = e.content.text,
								i = e.content.title,
								j = e.content.button,
								k = e.position,
								l = ("." + this._id + " ", []);
							return (
								d.attr(this.target[0], "aria-describedby", this._id),
								(f.posClass = this._createPosClass((this.position = { my: k.my, at: k.at }).my)),
								(this.tooltip =
									g.tooltip =
									b =
										d("<div/>", {
											id: this._id,
											class: [S, Z, e.style.classes, f.posClass].join(" "),
											width: e.style.width || "",
											height: e.style.height || "",
											tracking: "mouse" === k.target && k.adjust.mouse,
											role: "alert",
											"aria-live": "polite",
											"aria-atomic": E,
											"aria-describedby": this._id + "-content",
											"aria-hidden": D,
										})
											.toggleClass(ab, this.disabled)
											.attr(U, this.id)
											.data(S, this)
											.appendTo(k.container)
											.append(
												(g.content = d("<div />", {
													class: S + "-content",
													id: this._id + "-content",
													"aria-atomic": D,
												}))
											)),
								(this.rendered = -1),
								(this.positioning = D),
								i && (this._createTitle(), d.isFunction(i) || l.push(this._updateTitle(i, E))),
								j && this._createButton(),
								d.isFunction(h) || l.push(this._updateContent(h, E)),
								(this.rendered = D),
								this._setWidget(),
								d.each(R, function (a) {
									var b;
									"render" === this.initialize && (b = this(c)) && (c.plugins[a] = b);
								}),
								this._unassignEvents(),
								this._assignEvents(),
								this._when(l).then(function () {
									c._trigger("render"),
										(c.positioning = E),
										c.hiddenDuringWait || (!e.show.ready && !a) || c.toggle(D, f.event, E),
										(c.hiddenDuringWait = E);
								}),
								(y.api[this.id] = this),
								this
							);
						}),
						(z.destroy = function (a) {
							function b() {
								if (!this.destroyed) {
									this.destroyed = D;
									var a,
										b = this.target,
										c = b.attr(cb);
									this.rendered && this.tooltip.stop(1, 0).find("*").remove().end().remove(),
										d.each(this.plugins, function () {
											this.destroy && this.destroy();
										});
									for (a in this.timers) clearTimeout(this.timers[a]);
									b.removeData(S).removeAttr(U).removeAttr(T).removeAttr("aria-describedby"),
										this.options.suppress && c && b.attr("title", c).removeAttr(cb),
										this._unassignEvents(),
										(this.options =
											this.elements =
											this.cache =
											this.timers =
											this.plugins =
											this.mouse =
												F),
										delete y.api[this.id];
								}
							}
							return this.destroyed
								? this.target
								: ((a === D && "hide" !== this.triggering) || !this.rendered
										? b.call(this)
										: (this.tooltip.one("tooltiphidden", d.proxy(b, this)),
										  !this.triggering && this.hide()),
								  this.target);
						}),
						(B = z.checks =
							{
								builtin: {
									"^id$": function (a, b, c, e) {
										var f = c === D ? y.nextid : c,
											g = S + "-" + f;
										f !== E && f.length > 0 && !d("#" + g).length
											? ((this._id = g),
											  this.rendered &&
													((this.tooltip[0].id = this._id),
													(this.elements.content[0].id = this._id + "-content"),
													(this.elements.title[0].id = this._id + "-title")))
											: (a[b] = e);
									},
									"^prerender": function (a, b, c) {
										c && !this.rendered && this.render(this.options.show.ready);
									},
									"^content.text$": function (a, b, c) {
										this._updateContent(c);
									},
									"^content.attr$": function (a, b, c, d) {
										this.options.content.text === this.target.attr(d) &&
											this._updateContent(this.target.attr(c));
									},
									"^content.title$": function (a, b, c) {
										return c
											? (c && !this.elements.title && this._createTitle(),
											  void this._updateTitle(c))
											: this._removeTitle();
									},
									"^content.button$": function (a, b, c) {
										this._updateButton(c);
									},
									"^content.title.(text|button)$": function (a, b, c) {
										this.set("content." + b, c);
									},
									"^position.(my|at)$": function (a, b, c) {
										"string" == typeof c && (this.position[b] = a[b] = new A(c, "at" === b));
									},
									"^position.container$": function (a, b, c) {
										this.rendered && this.tooltip.appendTo(c);
									},
									"^show.ready$": function (a, b, c) {
										c && ((!this.rendered && this.render(D)) || this.toggle(D));
									},
									"^style.classes$": function (a, b, c, d) {
										this.rendered && this.tooltip.removeClass(d).addClass(c);
									},
									"^style.(width|height)": function (a, b, c) {
										this.rendered && this.tooltip.css(b, c);
									},
									"^style.widget|content.title": function () {
										this.rendered && this._setWidget();
									},
									"^style.def": function (a, b, c) {
										this.rendered && this.tooltip.toggleClass(Z, !!c);
									},
									"^events.(render|show|move|hide|focus|blur)$": function (a, b, c) {
										this.rendered &&
											this.tooltip[(d.isFunction(c) ? "" : "un") + "bind"]("tooltip" + b, c);
									},
									"^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)":
										function () {
											if (this.rendered) {
												var a = this.options.position;
												this.tooltip.attr("tracking", "mouse" === a.target && a.adjust.mouse),
													this._unassignEvents(),
													this._assignEvents();
											}
										},
								},
							}),
						(z.get = function (a) {
							if (this.destroyed) return this;
							var b = i(this.options, a.toLowerCase()),
								c = b[0][b[1]];
							return c.precedance ? c.string() : c;
						});
					var eb = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i,
						fb = /^prerender|show\.ready/i;
					(z.set = function (a, b) {
						if (this.destroyed) return this;
						{
							var c,
								e = this.rendered,
								f = E,
								g = this.options;
							this.checks;
						}
						return (
							"string" == typeof a ? ((c = a), (a = {}), (a[c] = b)) : (a = d.extend({}, a)),
							d.each(a, function (b, c) {
								if (e && fb.test(b)) return void delete a[b];
								var h,
									j = i(g, b.toLowerCase());
								(h = j[0][j[1]]),
									(j[0][j[1]] = c && c.nodeType ? d(c) : c),
									(f = eb.test(b) || f),
									(a[b] = [j[0], j[1], c, h]);
							}),
							h(g),
							(this.positioning = D),
							d.each(a, d.proxy(j, this)),
							(this.positioning = E),
							this.rendered &&
								this.tooltip[0].offsetWidth > 0 &&
								f &&
								this.reposition("mouse" === g.position.target ? F : this.cache.event),
							this
						);
					}),
						(z._update = function (a, b) {
							var c = this,
								e = this.cache;
							return this.rendered && a
								? (d.isFunction(a) && (a = a.call(this.elements.target, e.event, this) || ""),
								  d.isFunction(a.then)
										? ((e.waiting = D),
										  a.then(
												function (a) {
													return (e.waiting = E), c._update(a, b);
												},
												F,
												function (a) {
													return c._update(a, b);
												}
										  ))
										: a === E || (!a && "" !== a)
										? E
										: (a.jquery && a.length > 0
												? b.empty().append(a.css({ display: "block", visibility: "visible" }))
												: b.html(a),
										  this._waitForContent(b).then(function (a) {
												c.rendered &&
													c.tooltip[0].offsetWidth > 0 &&
													c.reposition(e.event, !a.length);
										  })))
								: E;
						}),
						(z._waitForContent = function (a) {
							var b = this.cache;
							return (
								(b.waiting = D),
								(d.fn.imagesLoaded ? a.imagesLoaded() : d.Deferred().resolve([]))
									.done(function () {
										b.waiting = E;
									})
									.promise()
							);
						}),
						(z._updateContent = function (a, b) {
							this._update(a, this.elements.content, b);
						}),
						(z._updateTitle = function (a, b) {
							this._update(a, this.elements.title, b) === E && this._removeTitle(E);
						}),
						(z._createTitle = function () {
							var a = this.elements,
								b = this._id + "-title";
							a.titlebar && this._removeTitle(),
								(a.titlebar = d("<div />", {
									class: S + "-titlebar " + (this.options.style.widget ? k("header") : ""),
								})
									.append(
										(a.title = d("<div />", {
											id: b,
											class: S + "-title",
											"aria-atomic": D,
										}))
									)
									.insertBefore(a.content)
									.delegate(".qtip-close", "mousedown keydown mouseup keyup mouseout", function (a) {
										d(this).toggleClass(
											"ui-state-active ui-state-focus",
											"down" === a.type.substr(-4)
										);
									})
									.delegate(".qtip-close", "mouseover mouseout", function (a) {
										d(this).toggleClass("ui-state-hover", "mouseover" === a.type);
									})),
								this.options.content.button && this._createButton();
						}),
						(z._removeTitle = function (a) {
							var b = this.elements;
							b.title &&
								(b.titlebar.remove(),
								(b.titlebar = b.title = b.button = F),
								a !== E && this.reposition());
						}),
						(z._createPosClass = function (a) {
							return S + "-pos-" + (a || this.options.position.my).abbrev();
						}),
						(z.reposition = function (c, e) {
							if (!this.rendered || this.positioning || this.destroyed) return this;
							this.positioning = D;
							var f,
								g,
								h,
								i,
								j = this.cache,
								k = this.tooltip,
								l = this.options.position,
								m = l.target,
								n = l.my,
								o = l.at,
								p = l.viewport,
								q = l.container,
								r = l.adjust,
								s = r.method.split(" "),
								t = k.outerWidth(E),
								u = k.outerHeight(E),
								v = 0,
								w = 0,
								x = k.css("position"),
								y = { left: 0, top: 0 },
								z = k[0].offsetWidth > 0,
								A = c && "scroll" === c.type,
								B = d(a),
								C = q[0].ownerDocument,
								F = this.mouse;
							if (d.isArray(m) && 2 === m.length) (o = { x: L, y: K }), (y = { left: m[0], top: m[1] });
							else if ("mouse" === m)
								(o = { x: L, y: K }),
									(!r.mouse || this.options.hide.distance) && j.origin && j.origin.pageX
										? (c = j.origin)
										: !c || (c && ("resize" === c.type || "scroll" === c.type))
										? (c = j.event)
										: F && F.pageX && (c = F),
									"static" !== x && (y = q.offset()),
									C.body.offsetWidth !== (a.innerWidth || C.documentElement.clientWidth) &&
										(g = d(b.body).offset()),
									(y = {
										left: c.pageX - y.left + ((g && g.left) || 0),
										top: c.pageY - y.top + ((g && g.top) || 0),
									}),
									r.mouse &&
										A &&
										F &&
										((y.left -= (F.scrollX || 0) - B.scrollLeft()),
										(y.top -= (F.scrollY || 0) - B.scrollTop()));
							else {
								if (
									("event" === m
										? c && c.target && "scroll" !== c.type && "resize" !== c.type
											? (j.target = d(c.target))
											: c.target || (j.target = this.elements.target)
										: "event" !== m && (j.target = d(m.jquery ? m : this.elements.target)),
									(m = j.target),
									(m = d(m).eq(0)),
									0 === m.length)
								)
									return this;
								m[0] === b || m[0] === a
									? ((v = db.iOS ? a.innerWidth : m.width()),
									  (w = db.iOS ? a.innerHeight : m.height()),
									  m[0] === a &&
											(y = {
												top: (p || m).scrollTop(),
												left: (p || m).scrollLeft(),
											}))
									: R.imagemap && m.is("area")
									? (f = R.imagemap(this, m, o, R.viewport ? s : E))
									: R.svg && m && m[0].ownerSVGElement
									? (f = R.svg(this, m, o, R.viewport ? s : E))
									: ((v = m.outerWidth(E)), (w = m.outerHeight(E)), (y = m.offset())),
									f && ((v = f.width), (w = f.height), (g = f.offset), (y = f.position)),
									(y = this.reposition.offset(m, y, q)),
									((db.iOS > 3.1 && db.iOS < 4.1) ||
										(db.iOS >= 4.3 && db.iOS < 4.33) ||
										(!db.iOS && "fixed" === x)) &&
										((y.left -= B.scrollLeft()), (y.top -= B.scrollTop())),
									(!f || (f && f.adjustable !== E)) &&
										((y.left += o.x === N ? v : o.x === O ? v / 2 : 0),
										(y.top += o.y === M ? w : o.y === O ? w / 2 : 0));
							}
							return (
								(y.left += r.x + (n.x === N ? -t : n.x === O ? -t / 2 : 0)),
								(y.top += r.y + (n.y === M ? -u : n.y === O ? -u / 2 : 0)),
								R.viewport
									? ((h = y.adjusted = R.viewport(this, y, l, v, w, t, u)),
									  g && h.left && (y.left += g.left),
									  g && h.top && (y.top += g.top),
									  h.my && (this.position.my = h.my))
									: (y.adjusted = { left: 0, top: 0 }),
								j.posClass !== (i = this._createPosClass(this.position.my)) &&
									k.removeClass(j.posClass).addClass((j.posClass = i)),
								this._trigger("move", [y, p.elem || p], c)
									? (delete y.adjusted,
									  e === E ||
									  !z ||
									  isNaN(y.left) ||
									  isNaN(y.top) ||
									  "mouse" === m ||
									  !d.isFunction(l.effect)
											? k.css(y)
											: d.isFunction(l.effect) &&
											  (l.effect.call(k, this, d.extend({}, y)),
											  k.queue(function (a) {
													d(this).css({ opacity: "", height: "" }),
														db.ie && this.style.removeAttribute("filter"),
														a();
											  })),
									  (this.positioning = E),
									  this)
									: this
							);
						}),
						(z.reposition.offset = function (a, c, e) {
							function f(a, b) {
								(c.left += b * a.scrollLeft()), (c.top += b * a.scrollTop());
							}
							if (!e[0]) return c;
							var g,
								h,
								i,
								j,
								k = d(a[0].ownerDocument),
								l = !!db.ie && "CSS1Compat" !== b.compatMode,
								m = e[0];
							do
								"static" !== (h = d.css(m, "position")) &&
									("fixed" === h
										? ((i = m.getBoundingClientRect()), f(k, -1))
										: ((i = d(m).position()),
										  (i.left += parseFloat(d.css(m, "borderLeftWidth")) || 0),
										  (i.top += parseFloat(d.css(m, "borderTopWidth")) || 0)),
									(c.left -= i.left + (parseFloat(d.css(m, "marginLeft")) || 0)),
									(c.top -= i.top + (parseFloat(d.css(m, "marginTop")) || 0)),
									g || "hidden" === (j = d.css(m, "overflow")) || "visible" === j || (g = d(m)));
							while ((m = m.offsetParent));
							return g && (g[0] !== k[0] || l) && f(g, 1), c;
						});
					var gb = (A = z.reposition.Corner =
						function (a, b) {
							(a = ("" + a)
								.replace(/([A-Z])/, " $1")
								.replace(/middle/gi, O)
								.toLowerCase()),
								(this.x = (a.match(/left|right/i) ||
									a.match(/center/) || ["inherit"])[0].toLowerCase()),
								(this.y = (a.match(/top|bottom|center/i) || ["inherit"])[0].toLowerCase()),
								(this.forceY = !!b);
							var c = a.charAt(0);
							this.precedance = "t" === c || "b" === c ? H : G;
						}).prototype;
					(gb.invert = function (a, b) {
						this[a] = this[a] === L ? N : this[a] === N ? L : b || this[a];
					}),
						(gb.string = function (a) {
							var b = this.x,
								c = this.y,
								d =
									b !== c
										? "center" === b || ("center" !== c && (this.precedance === H || this.forceY))
											? [c, b]
											: [b, c]
										: [b];
							return a !== !1 ? d.join(" ") : d;
						}),
						(gb.abbrev = function () {
							var a = this.string(!1);
							return a[0].charAt(0) + ((a[1] && a[1].charAt(0)) || "");
						}),
						(gb.clone = function () {
							return new A(this.string(), this.forceY);
						}),
						(z.toggle = function (a, c) {
							var e = this.cache,
								f = this.options,
								g = this.tooltip;
							if (c) {
								if (
									/over|enter/.test(c.type) &&
									e.event &&
									/out|leave/.test(e.event.type) &&
									f.show.target.add(c.target).length === f.show.target.length &&
									g.has(c.relatedTarget).length
								)
									return this;
								e.event = d.event.fix(c);
							}
							if ((this.waiting && !a && (this.hiddenDuringWait = D), !this.rendered))
								return a ? this.render(1) : this;
							if (this.destroyed || this.disabled) return this;
							var h,
								i,
								j,
								k = a ? "show" : "hide",
								l = this.options[k],
								m = (this.options[a ? "hide" : "show"], this.options.position),
								n = this.options.content,
								o = this.tooltip.css("width"),
								p = this.tooltip.is(":visible"),
								q = a || 1 === l.target.length,
								r = !c || l.target.length < 2 || e.target[0] === c.target;
							return (
								(typeof a).search("boolean|number") && (a = !p),
								(h = !g.is(":animated") && p === a && r),
								(i = h ? F : !!this._trigger(k, [90])),
								this.destroyed
									? this
									: (i !== E && a && this.focus(c),
									  !i || h
											? this
											: (d.attr(g[0], "aria-hidden", !a),
											  a
													? (this.mouse && (e.origin = d.event.fix(this.mouse)),
													  d.isFunction(n.text) && this._updateContent(n.text, E),
													  d.isFunction(n.title) && this._updateTitle(n.title, E),
													  !C &&
															"mouse" === m.target &&
															m.adjust.mouse &&
															(d(b).bind("mousemove." + S, this._storeMouse), (C = D)),
													  o || g.css("width", g.outerWidth(E)),
													  this.reposition(c, arguments[2]),
													  o || g.css("width", ""),
													  l.solo &&
															("string" == typeof l.solo ? d(l.solo) : d(W, l.solo))
																.not(g)
																.not(l.target)
																.qtip("hide", d.Event("tooltipsolo")))
													: (clearTimeout(this.timers.show),
													  delete e.origin,
													  C &&
															!d(W + '[tracking="true"]:visible', l.solo).not(g).length &&
															(d(b).unbind("mousemove." + S), (C = E)),
													  this.blur(c)),
											  (j = d.proxy(function () {
													a
														? (db.ie && g[0].style.removeAttribute("filter"),
														  g.css("overflow", ""),
														  "string" == typeof l.autofocus &&
																d(this.options.show.autofocus, g).focus(),
														  this.options.show.target.trigger(
																"qtip-" + this.id + "-inactive"
														  ))
														: g.css({
																display: "",
																visibility: "",
																opacity: "",
																left: "",
																top: "",
														  }),
														this._trigger(a ? "visible" : "hidden");
											  }, this)),
											  l.effect === E || q === E
													? (g[k](), j())
													: d.isFunction(l.effect)
													? (g.stop(1, 1),
													  l.effect.call(g, this),
													  g.queue("fx", function (a) {
															j(), a();
													  }))
													: g.fadeTo(90, a ? 1 : 0, j),
											  a && l.target.trigger("qtip-" + this.id + "-inactive"),
											  this))
							);
						}),
						(z.show = function (a) {
							return this.toggle(D, a);
						}),
						(z.hide = function (a) {
							return this.toggle(E, a);
						}),
						(z.focus = function (a) {
							if (!this.rendered || this.destroyed) return this;
							var b = d(W),
								c = this.tooltip,
								e = parseInt(c[0].style.zIndex, 10),
								f = y.zindex + b.length;
							return (
								c.hasClass($) ||
									(this._trigger("focus", [f], a) &&
										(e !== f &&
											(b.each(function () {
												this.style.zIndex > e && (this.style.zIndex = this.style.zIndex - 1);
											}),
											b.filter("." + $).qtip("blur", a)),
										(c.addClass($)[0].style.zIndex = f))),
								this
							);
						}),
						(z.blur = function (a) {
							return !this.rendered || this.destroyed
								? this
								: (this.tooltip.removeClass($),
								  this._trigger("blur", [this.tooltip.css("zIndex")], a),
								  this);
						}),
						(z.disable = function (a) {
							return this.destroyed
								? this
								: ("toggle" === a
										? (a = !(this.rendered ? this.tooltip.hasClass(ab) : this.disabled))
										: "boolean" != typeof a && (a = D),
								  this.rendered && this.tooltip.toggleClass(ab, a).attr("aria-disabled", a),
								  (this.disabled = !!a),
								  this);
						}),
						(z.enable = function () {
							return this.disable(E);
						}),
						(z._createButton = function () {
							var a = this,
								b = this.elements,
								c = b.tooltip,
								e = this.options.content.button,
								f = "string" == typeof e,
								g = f ? e : "Close tooltip";
							b.button && b.button.remove(),
								(b.button = e.jquery
									? e
									: d("<a />", {
											class: "qtip-close " + (this.options.style.widget ? "" : S + "-icon"),
											title: g,
											"aria-label": g,
									  }).prepend(
											d("<span />", {
												class: "ui-icon ui-icon-close",
												html: "&times;",
											})
									  )),
								b.button
									.appendTo(b.titlebar || c)
									.attr("role", "button")
									.click(function (b) {
										return c.hasClass(ab) || a.hide(b), E;
									});
						}),
						(z._updateButton = function (a) {
							if (!this.rendered) return E;
							var b = this.elements.button;
							a ? this._createButton() : b.remove();
						}),
						(z._setWidget = function () {
							var a = this.options.style.widget,
								b = this.elements,
								c = b.tooltip,
								d = c.hasClass(ab);
							c.removeClass(ab),
								(ab = a ? "ui-state-disabled" : "qtip-disabled"),
								c.toggleClass(ab, d),
								c.toggleClass("ui-helper-reset " + k(), a).toggleClass(Z, this.options.style.def && !a),
								b.content && b.content.toggleClass(k("content"), a),
								b.titlebar && b.titlebar.toggleClass(k("header"), a),
								b.button && b.button.toggleClass(S + "-icon", !a);
						}),
						(z._storeMouse = function (a) {
							return ((this.mouse = d.event.fix(a)).type = "mousemove"), this;
						}),
						(z._bind = function (a, b, c, e, f) {
							if (a && c && b.length) {
								var g = "." + this._id + (e ? "-" + e : "");
								return d(a).bind((b.split ? b : b.join(g + " ")) + g, d.proxy(c, f || this)), this;
							}
						}),
						(z._unbind = function (a, b) {
							return a && d(a).unbind("." + this._id + (b ? "-" + b : "")), this;
						}),
						(z._trigger = function (a, b, c) {
							var e = d.Event("tooltip" + a);
							return (
								(e.originalEvent = (c && d.extend({}, c)) || this.cache.event || F),
								(this.triggering = a),
								this.tooltip.trigger(e, [this].concat(b || [])),
								(this.triggering = E),
								!e.isDefaultPrevented()
							);
						}),
						(z._bindEvents = function (a, b, c, e, f, g) {
							var h = c.filter(e).add(e.filter(c)),
								i = [];
							h.length &&
								(d.each(b, function (b, c) {
									var e = d.inArray(c, a);
									e > -1 && i.push(a.splice(e, 1)[0]);
								}),
								i.length &&
									(this._bind(h, i, function (a) {
										var b = this.rendered ? this.tooltip[0].offsetWidth > 0 : !1;
										(b ? g : f).call(this, a);
									}),
									(c = c.not(h)),
									(e = e.not(h)))),
								this._bind(c, a, f),
								this._bind(e, b, g);
						}),
						(z._assignInitialEvents = function (a) {
							function b(a) {
								return this.disabled || this.destroyed
									? E
									: ((this.cache.event = a && d.event.fix(a)),
									  (this.cache.target = a && d(a.target)),
									  clearTimeout(this.timers.show),
									  void (this.timers.show = l.call(
											this,
											function () {
												this.render("object" == typeof a || c.show.ready);
											},
											c.show.delay
									  )));
							}
							var c = this.options,
								e = c.show.target,
								f = c.hide.target,
								g = c.show.event ? d.trim("" + c.show.event).split(" ") : [],
								h = c.hide.event ? d.trim("" + c.hide.event).split(" ") : [];
							this._bind(
								this.elements.target,
								["remove", "removeqtip"],
								function () {
									this.destroy(!0);
								},
								"destroy"
							),
								/mouse(over|enter)/i.test(c.show.event) &&
									!/mouse(out|leave)/i.test(c.hide.event) &&
									h.push("mouseleave"),
								this._bind(e, "mousemove", function (a) {
									this._storeMouse(a), (this.cache.onTarget = D);
								}),
								this._bindEvents(g, h, e, f, b, function () {
									return this.timers ? void clearTimeout(this.timers.show) : E;
								}),
								(c.show.ready || c.prerender) && b.call(this, a);
						}),
						(z._assignEvents = function () {
							var c = this,
								e = this.options,
								f = e.position,
								g = this.tooltip,
								h = e.show.target,
								i = e.hide.target,
								j = f.container,
								k = f.viewport,
								l = d(b),
								q = (d(b.body), d(a)),
								r = e.show.event ? d.trim("" + e.show.event).split(" ") : [],
								s = e.hide.event ? d.trim("" + e.hide.event).split(" ") : [];
							d.each(e.events, function (a, b) {
								c._bind(
									g,
									"toggle" === a ? ["tooltipshow", "tooltiphide"] : ["tooltip" + a],
									b,
									null,
									g
								);
							}),
								/mouse(out|leave)/i.test(e.hide.event) &&
									"window" === e.hide.leave &&
									this._bind(l, ["mouseout", "blur"], function (a) {
										/select|option/.test(a.target.nodeName) || a.relatedTarget || this.hide(a);
									}),
								e.hide.fixed
									? (i = i.add(g.addClass(Y)))
									: /mouse(over|enter)/i.test(e.show.event) &&
									  this._bind(i, "mouseleave", function () {
											clearTimeout(this.timers.show);
									  }),
								("" + e.hide.event).indexOf("unfocus") > -1 &&
									this._bind(j.closest("html"), ["mousedown", "touchstart"], function (a) {
										var b = d(a.target),
											c =
												this.rendered &&
												!this.tooltip.hasClass(ab) &&
												this.tooltip[0].offsetWidth > 0,
											e = b.parents(W).filter(this.tooltip[0]).length > 0;
										b[0] === this.target[0] ||
											b[0] === this.tooltip[0] ||
											e ||
											this.target.has(b[0]).length ||
											!c ||
											this.hide(a);
									}),
								"number" == typeof e.hide.inactive &&
									(this._bind(h, "qtip-" + this.id + "-inactive", o, "inactive"),
									this._bind(i.add(g), y.inactiveEvents, o)),
								this._bindEvents(r, s, h, i, m, n),
								this._bind(h.add(g), "mousemove", function (a) {
									if ("number" == typeof e.hide.distance) {
										var b = this.cache.origin || {},
											c = this.options.hide.distance,
											d = Math.abs;
										(d(a.pageX - b.pageX) >= c || d(a.pageY - b.pageY) >= c) && this.hide(a);
									}
									this._storeMouse(a);
								}),
								"mouse" === f.target &&
									f.adjust.mouse &&
									(e.hide.event &&
										this._bind(h, ["mouseenter", "mouseleave"], function (a) {
											return this.cache
												? void (this.cache.onTarget = "mouseenter" === a.type)
												: E;
										}),
									this._bind(l, "mousemove", function (a) {
										this.rendered &&
											this.cache.onTarget &&
											!this.tooltip.hasClass(ab) &&
											this.tooltip[0].offsetWidth > 0 &&
											this.reposition(a);
									})),
								(f.adjust.resize || k.length) &&
									this._bind(d.event.special.resize ? k : q, "resize", p),
								f.adjust.scroll && this._bind(q.add(f.container), "scroll", p);
						}),
						(z._unassignEvents = function () {
							var c = this.options,
								e = c.show.target,
								f = c.hide.target,
								g = d.grep(
									[
										this.elements.target[0],
										this.rendered && this.tooltip[0],
										c.position.container[0],
										c.position.viewport[0],
										c.position.container.closest("html")[0],
										a,
										b,
									],
									function (a) {
										return "object" == typeof a;
									}
								);
							e && e.toArray && (g = g.concat(e.toArray())),
								f && f.toArray && (g = g.concat(f.toArray())),
								this._unbind(g)._unbind(g, "destroy")._unbind(g, "inactive");
						}),
						d(function () {
							q(W, ["mouseenter", "mouseleave"], function (a) {
								var b = "mouseenter" === a.type,
									c = d(a.currentTarget),
									e = d(a.relatedTarget || a.target),
									f = this.options;
								b
									? (this.focus(a),
									  c.hasClass(Y) && !c.hasClass(ab) && clearTimeout(this.timers.hide))
									: "mouse" === f.position.target &&
									  f.position.adjust.mouse &&
									  f.hide.event &&
									  f.show.target &&
									  !e.closest(f.show.target[0]).length &&
									  this.hide(a),
									c.toggleClass(_, b);
							}),
								q("[" + U + "]", X, o);
						}),
						(y = d.fn.qtip =
							function (a, b, e) {
								var f = ("" + a).toLowerCase(),
									g = F,
									i = d.makeArray(arguments).slice(1),
									j = i[i.length - 1],
									k = this[0] ? d.data(this[0], S) : F;
								return (!arguments.length && k) || "api" === f
									? k
									: "string" == typeof a
									? (this.each(function () {
											var a = d.data(this, S);
											if (!a) return D;
											if (
												(j && j.timeStamp && (a.cache.event = j),
												!b || ("option" !== f && "options" !== f))
											)
												a[f] && a[f].apply(a, i);
											else {
												if (e === c && !d.isPlainObject(b)) return (g = a.get(b)), E;
												a.set(b, e);
											}
									  }),
									  g !== F ? g : this)
									: "object" != typeof a && arguments.length
									? void 0
									: ((k = h(d.extend(D, {}, a))),
									  this.each(function (a) {
											var b, c;
											return (
												(c = d.isArray(k.id) ? k.id[a] : k.id),
												(c = !c || c === E || c.length < 1 || y.api[c] ? y.nextid++ : c),
												(b = r(d(this), c, k)),
												b === E
													? D
													: ((y.api[c] = b),
													  d.each(R, function () {
															"initialize" === this.initialize && this(b);
													  }),
													  void b._assignInitialEvents(j))
											);
									  }));
							}),
						(d.qtip = e),
						(y.api = {}),
						d.each(
							{
								attr: function (a, b) {
									if (this.length) {
										var c = this[0],
											e = "title",
											f = d.data(c, "qtip");
										if (a === e && f && "object" == typeof f && f.options.suppress)
											return arguments.length < 2
												? d.attr(c, cb)
												: (f &&
														f.options.content.attr === e &&
														f.cache.attr &&
														f.set("content.text", b),
												  this.attr(cb, b));
									}
									return d.fn["attr" + bb].apply(this, arguments);
								},
								clone: function (a) {
									var b = (d([]), d.fn["clone" + bb].apply(this, arguments));
									return (
										a ||
											b
												.filter("[" + cb + "]")
												.attr("title", function () {
													return d.attr(this, cb);
												})
												.removeAttr(cb),
										b
									);
								},
							},
							function (a, b) {
								if (!b || d.fn[a + bb]) return D;
								var c = (d.fn[a + bb] = d.fn[a]);
								d.fn[a] = function () {
									return b.apply(this, arguments) || c.apply(this, arguments);
								};
							}
						),
						d.ui ||
							((d["cleanData" + bb] = d.cleanData),
							(d.cleanData = function (a) {
								for (var b, c = 0; (b = d(a[c])).length; c++)
									if (b.attr(T))
										try {
											b.triggerHandler("removeqtip");
										} catch (e) {}
								d["cleanData" + bb].apply(this, arguments);
							})),
						(y.version = "2.2.0-63-"),
						(y.nextid = 0),
						(y.inactiveEvents = X),
						(y.zindex = 15e3),
						(y.defaults = {
							prerender: E,
							id: E,
							overwrite: D,
							suppress: D,
							content: { text: D, attr: "title", title: E, button: E },
							position: {
								my: "top left",
								at: "bottom right",
								target: E,
								container: E,
								viewport: E,
								adjust: {
									x: 0,
									y: 0,
									mouse: D,
									scroll: D,
									resize: D,
									method: "flipinvert flipinvert",
								},
								effect: function (a, b) {
									d(this).animate(b, { duration: 200, queue: E });
								},
							},
							show: {
								target: E,
								event: "mouseenter",
								effect: D,
								delay: 90,
								solo: E,
								ready: E,
								autofocus: E,
							},
							hide: {
								target: E,
								event: "mouseleave",
								effect: D,
								delay: 0,
								fixed: E,
								inactive: E,
								leave: "window",
								distance: E,
							},
							style: { classes: "", widget: E, width: E, height: E, def: D },
							events: {
								render: F,
								move: F,
								show: F,
								hide: F,
								toggle: F,
								visible: F,
								hidden: F,
								focus: F,
								blur: F,
							},
						});
					var hb,
						ib = "margin",
						jb = "border",
						kb = "color",
						lb = "background-color",
						mb = "transparent",
						nb = " !important",
						ob = !!b.createElement("canvas").getContext,
						pb = /rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i,
						qb = {},
						rb = ["Webkit", "O", "Moz", "ms"];
					if (ob)
						var sb = a.devicePixelRatio || 1,
							tb = (function () {
								var a = b.createElement("canvas").getContext("2d");
								return (
									a.backingStorePixelRatio ||
									a.webkitBackingStorePixelRatio ||
									a.mozBackingStorePixelRatio ||
									a.msBackingStorePixelRatio ||
									a.oBackingStorePixelRatio ||
									1
								);
							})(),
							ub = sb / tb;
					else
						var vb = function (a, b, c) {
							return (
								"<qtipvml:" +
								a +
								' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" ' +
								(b || "") +
								' style="behavior: url(#default#VML); ' +
								(c || "") +
								'" />'
							);
						};
					d.extend(v.prototype, {
						init: function (a) {
							var b, c;
							(c =
								this.element =
								a.elements.tip =
									d("<div />", {
										class: S + "-tip",
									}).prependTo(a.tooltip)),
								ob
									? ((b = d("<canvas />").appendTo(this.element)[0].getContext("2d")),
									  (b.lineJoin = "miter"),
									  (b.miterLimit = 1e5),
									  b.save())
									: ((b = vb("shape", 'coordorigin="0,0"', "position:absolute;")),
									  this.element.html(b + b),
									  a._bind(
											d("*", c).add(c),
											["click", "mousedown"],
											function (a) {
												a.stopPropagation();
											},
											this._ns
									  )),
								a._bind(a.tooltip, "tooltipmove", this.reposition, this._ns, this),
								this.create();
						},
						_swapDimensions: function () {
							(this.size[0] = this.options.height), (this.size[1] = this.options.width);
						},
						_resetDimensions: function () {
							(this.size[0] = this.options.width), (this.size[1] = this.options.height);
						},
						_useTitle: function (a) {
							var b = this.qtip.elements.titlebar;
							return (
								b &&
								(a.y === K ||
									(a.y === O &&
										this.element.position().top + this.size[1] / 2 + this.options.offset <
											b.outerHeight(D)))
							);
						},
						_parseCorner: function (a) {
							var b = this.qtip.options.position.my;
							return (
								a === E || b === E
									? (a = E)
									: a === D
									? (a = new A(b.string()))
									: a.string || ((a = new A(a)), (a.fixed = D)),
								a
							);
						},
						_parseWidth: function (a, b, c) {
							var d = this.qtip.elements,
								e = jb + s(b) + "Width";
							return (
								(c
									? u(c, e)
									: u(d.content, e) ||
									  u((this._useTitle(a) && d.titlebar) || d.content, e) ||
									  u(d.tooltip, e)) || 0
							);
						},
						_parseRadius: function (a) {
							var b = this.qtip.elements,
								c = jb + s(a.y) + s(a.x) + "Radius";
							return db.ie < 9
								? 0
								: u((this._useTitle(a) && b.titlebar) || b.content, c) || u(b.tooltip, c) || 0;
						},
						_invalidColour: function (a, b, c) {
							var d = a.css(b);
							return !d || (c && d === a.css(c)) || pb.test(d) ? E : d;
						},
						_parseColours: function (a) {
							var b = this.qtip.elements,
								c = this.element.css("cssText", ""),
								e = jb + s(a[a.precedance]) + s(kb),
								f = (this._useTitle(a) && b.titlebar) || b.content,
								g = this._invalidColour,
								h = [];
							return (
								(h[0] = g(c, lb) || g(f, lb) || g(b.content, lb) || g(b.tooltip, lb) || c.css(lb)),
								(h[1] =
									g(c, e, kb) ||
									g(f, e, kb) ||
									g(b.content, e, kb) ||
									g(b.tooltip, e, kb) ||
									b.tooltip.css(e)),
								d("*", c)
									.add(c)
									.css("cssText", lb + ":" + mb + nb + ";" + jb + ":0" + nb + ";"),
								h
							);
						},
						_calculateSize: function (a) {
							var b,
								c,
								d,
								e = a.precedance === H,
								f = this.options.width,
								g = this.options.height,
								h = "c" === a.abbrev(),
								i = (e ? f : g) * (h ? 0.5 : 1),
								j = Math.pow,
								k = Math.round,
								l = Math.sqrt(j(i, 2) + j(g, 2)),
								m = [(this.border / i) * l, (this.border / g) * l];
							return (
								(m[2] = Math.sqrt(j(m[0], 2) - j(this.border, 2))),
								(m[3] = Math.sqrt(j(m[1], 2) - j(this.border, 2))),
								(b = l + m[2] + m[3] + (h ? 0 : m[0])),
								(c = b / l),
								(d = [k(c * f), k(c * g)]),
								e ? d : d.reverse()
							);
						},
						_calculateTip: function (a, b, c) {
							(c = c || 1), (b = b || this.size);
							var d = b[0] * c,
								e = b[1] * c,
								f = Math.ceil(d / 2),
								g = Math.ceil(e / 2),
								h = {
									br: [0, 0, d, e, d, 0],
									bl: [0, 0, d, 0, 0, e],
									tr: [0, e, d, 0, d, e],
									tl: [0, 0, 0, e, d, e],
									tc: [0, e, f, 0, d, e],
									bc: [0, 0, d, 0, f, e],
									rc: [0, 0, d, g, 0, e],
									lc: [d, 0, d, e, 0, g],
								};
							return (h.lt = h.br), (h.rt = h.bl), (h.lb = h.tr), (h.rb = h.tl), h[a.abbrev()];
						},
						_drawCoords: function (a, b) {
							a.beginPath(),
								a.moveTo(b[0], b[1]),
								a.lineTo(b[2], b[3]),
								a.lineTo(b[4], b[5]),
								a.closePath();
						},
						create: function () {
							var a = (this.corner = (ob || db.ie) && this._parseCorner(this.options.corner));
							return (
								(this.enabled = !!this.corner && "c" !== this.corner.abbrev()) &&
									((this.qtip.cache.corner = a.clone()), this.update()),
								this.element.toggle(this.enabled),
								this.corner
							);
						},
						update: function (b, c) {
							if (!this.enabled) return this;
							var e,
								f,
								g,
								h,
								i,
								j,
								k,
								l,
								m = this.qtip.elements,
								n = this.element,
								o = n.children(),
								p = this.options,
								q = this.size,
								r = p.mimic,
								s = Math.round;
							b || (b = this.qtip.cache.corner || this.corner),
								r === E
									? (r = b)
									: ((r = new A(r)),
									  (r.precedance = b.precedance),
									  "inherit" === r.x
											? (r.x = b.x)
											: "inherit" === r.y
											? (r.y = b.y)
											: r.x === r.y && (r[b.precedance] = b[b.precedance])),
								(f = r.precedance),
								b.precedance === G ? this._swapDimensions() : this._resetDimensions(),
								(e = this.color = this._parseColours(b)),
								e[1] !== mb
									? ((l = this.border = this._parseWidth(b, b[b.precedance])),
									  p.border && 1 > l && !pb.test(e[1]) && (e[0] = e[1]),
									  (this.border = l = p.border !== D ? p.border : l))
									: (this.border = l = 0),
								(k = this.size = this._calculateSize(b)),
								n.css({ width: k[0], height: k[1], lineHeight: k[1] + "px" }),
								(j =
									b.precedance === H
										? [
												s(r.x === L ? l : r.x === N ? k[0] - q[0] - l : (k[0] - q[0]) / 2),
												s(r.y === K ? k[1] - q[1] : 0),
										  ]
										: [
												s(r.x === L ? k[0] - q[0] : 0),
												s(r.y === K ? l : r.y === M ? k[1] - q[1] - l : (k[1] - q[1]) / 2),
										  ]),
								ob
									? ((g = o[0].getContext("2d")),
									  g.restore(),
									  g.save(),
									  g.clearRect(0, 0, 6e3, 6e3),
									  (h = this._calculateTip(r, q, ub)),
									  (i = this._calculateTip(r, this.size, ub)),
									  o.attr(I, k[0] * ub).attr(J, k[1] * ub),
									  o.css(I, k[0]).css(J, k[1]),
									  this._drawCoords(g, i),
									  (g.fillStyle = e[1]),
									  g.fill(),
									  g.translate(j[0] * ub, j[1] * ub),
									  this._drawCoords(g, h),
									  (g.fillStyle = e[0]),
									  g.fill())
									: ((h = this._calculateTip(r)),
									  (h =
											"m" +
											h[0] +
											"," +
											h[1] +
											" l" +
											h[2] +
											"," +
											h[3] +
											" " +
											h[4] +
											"," +
											h[5] +
											" xe"),
									  (j[2] = l && /^(r|b)/i.test(b.string()) ? (8 === db.ie ? 2 : 1) : 0),
									  o
											.css({
												coordsize: k[0] + l + " " + (k[1] + l),
												antialias: "" + (r.string().indexOf(O) > -1),
												left: j[0] - j[2] * Number(f === G),
												top: j[1] - j[2] * Number(f === H),
												width: k[0] + l,
												height: k[1] + l,
											})
											.each(function (a) {
												var b = d(this);
												b[b.prop ? "prop" : "attr"]({
													coordsize: k[0] + l + " " + (k[1] + l),
													path: h,
													fillcolor: e[0],
													filled: !!a,
													stroked: !a,
												}).toggle(!(!l && !a)),
													!a &&
														b.html(
															vb(
																"stroke",
																'weight="' +
																	2 * l +
																	'px" color="' +
																	e[1] +
																	'" miterlimit="1000" joinstyle="miter"'
															)
														);
											})),
								a.opera &&
									setTimeout(function () {
										m.tip.css({
											display: "inline-block",
											visibility: "visible",
										});
									}, 1),
								c !== E && this.calculate(b, k);
						},
						calculate: function (a, b) {
							if (!this.enabled) return E;
							var c,
								e,
								f = this,
								g = this.qtip.elements,
								h = this.element,
								i = this.options.offset,
								j = (g.tooltip.hasClass("ui-widget"), {});
							return (
								(a = a || this.corner),
								(c = a.precedance),
								(b = b || this._calculateSize(a)),
								(e = [a.x, a.y]),
								c === G && e.reverse(),
								d.each(e, function (d, e) {
									var h, k, l;
									e === O
										? ((h = c === H ? L : K),
										  (j[h] = "50%"),
										  (j[ib + "-" + h] = -Math.round(b[c === H ? 0 : 1] / 2) + i))
										: ((h = f._parseWidth(a, e, g.tooltip)),
										  (k = f._parseWidth(a, e, g.content)),
										  (l = f._parseRadius(a)),
										  (j[e] = Math.max(-f.border, d ? k : i + (l > h ? l : -h))));
								}),
								(j[a[c]] -= b[c === G ? 0 : 1]),
								h.css({ margin: "", top: "", bottom: "", left: "", right: "" }).css(j),
								j
							);
						},
						reposition: function (a, b, d) {
							function e(a, b, c, d, e) {
								a === Q && j.precedance === b && k[d] && j[c] !== O
									? (j.precedance = j.precedance === G ? H : G)
									: a !== Q && k[d] && (j[b] = j[b] === O ? (k[d] > 0 ? d : e) : j[b] === d ? e : d);
							}
							function f(a, b, e) {
								j[a] === O
									? (p[ib + "-" + b] = o[a] = g[ib + "-" + b] - k[b])
									: ((h = g[e] !== c ? [k[b], -g[b]] : [-k[b], g[b]]),
									  (o[a] = Math.max(h[0], h[1])) > h[0] && ((d[b] -= k[b]), (o[b] = E)),
									  (p[g[e] !== c ? e : b] = o[a]));
							}
							if (this.enabled) {
								var g,
									h,
									i = b.cache,
									j = this.corner.clone(),
									k = d.adjusted,
									l = b.options.position.adjust.method.split(" "),
									m = l[0],
									n = l[1] || l[0],
									o = { left: E, top: E, x: 0, y: 0 },
									p = {};
								this.corner.fixed !== D &&
									(e(m, G, H, L, N),
									e(n, H, G, K, M),
									(j.string() !== i.corner.string() ||
										i.cornerTop !== k.top ||
										i.cornerLeft !== k.left) &&
										this.update(j, E)),
									(g = this.calculate(j)),
									g.right !== c && (g.left = -g.right),
									g.bottom !== c && (g.top = -g.bottom),
									(g.user = this.offset),
									(o.left = m === Q && !!k.left) && f(G, L, N),
									(o.top = n === Q && !!k.top) && f(H, K, M),
									this.element
										.css(p)
										.toggle(!((o.x && o.y) || (j.x === O && o.y) || (j.y === O && o.x))),
									(d.left -= g.left.charAt
										? g.user
										: m !== Q || o.top || (!o.left && !o.top)
										? g.left + this.border
										: 0),
									(d.top -= g.top.charAt
										? g.user
										: n !== Q || o.left || (!o.left && !o.top)
										? g.top + this.border
										: 0),
									(i.cornerLeft = k.left),
									(i.cornerTop = k.top),
									(i.corner = j.clone());
							}
						},
						destroy: function () {
							this.qtip._unbind(this.qtip.tooltip, this._ns),
								this.qtip.elements.tip && this.qtip.elements.tip.find("*").remove().end().remove();
						},
					}),
						(hb = R.tip =
							function (a) {
								return new v(a, a.options.style.tip);
							}),
						(hb.initialize = "render"),
						(hb.sanitize = function (a) {
							if (a.style && "tip" in a.style) {
								var b = a.style.tip;
								"object" != typeof b && (b = a.style.tip = { corner: b }),
									/string|boolean/i.test(typeof b.corner) || (b.corner = D);
							}
						}),
						(B.tip = {
							"^position.my|style.tip.(corner|mimic|border)$": function () {
								this.create(), this.qtip.reposition();
							},
							"^style.tip.(height|width)$": function (a) {
								(this.size = [a.width, a.height]), this.update(), this.qtip.reposition();
							},
							"^content.title|style.(classes|widget)$": function () {
								this.update();
							},
						}),
						d.extend(D, y.defaults, {
							style: {
								tip: {
									corner: D,
									mimic: E,
									width: 6,
									height: 6,
									border: D,
									offset: 0,
								},
							},
						}),
						(R.viewport = function (c, d, e, f, g, h, i) {
							function j(a, b, c, e, f, g, h, i, j) {
								var k = d[f],
									s = u[a],
									t = v[a],
									w = c === Q,
									x = s === f ? j : s === g ? -j : -j / 2,
									y = t === f ? i : t === g ? -i : -i / 2,
									z = q[f] + r[f] - (n ? 0 : m[f]),
									A = z - k,
									B = k + j - (h === I ? o : p) - z,
									C = x - (u.precedance === a || s === u[b] ? y : 0) - (t === O ? i / 2 : 0);
								return (
									w
										? ((C = (s === f ? 1 : -1) * x),
										  (d[f] += A > 0 ? A : B > 0 ? -B : 0),
										  (d[f] = Math.max(
												-m[f] + r[f],
												k - C,
												Math.min(
													Math.max(-m[f] + r[f] + (h === I ? o : p), k + C),
													d[f],
													"center" === s ? k - x : 1e9
												)
										  )))
										: ((e *= c === P ? 2 : 0),
										  A > 0 && (s !== f || B > 0)
												? ((d[f] -= C + e), l.invert(a, f))
												: B > 0 &&
												  (s !== g || A > 0) &&
												  ((d[f] -= (s === O ? -C : C) + e), l.invert(a, g)),
										  d[f] < q && -d[f] > B && ((d[f] = k), (l = u.clone()))),
									d[f] - k
								);
							}
							var k,
								l,
								m,
								n,
								o,
								p,
								q,
								r,
								s = e.target,
								t = c.elements.tooltip,
								u = e.my,
								v = e.at,
								w = e.adjust,
								x = w.method.split(" "),
								y = x[0],
								z = x[1] || x[0],
								A = e.viewport,
								B = e.container,
								C = (c.cache, { left: 0, top: 0 });
							return A.jquery && s[0] !== a && s[0] !== b.body && "none" !== w.method
								? ((m = B.offset() || C),
								  (n = "static" === B.css("position")),
								  (k = "fixed" === t.css("position")),
								  (o = A[0] === a ? A.width() : A.outerWidth(E)),
								  (p = A[0] === a ? A.height() : A.outerHeight(E)),
								  (q = {
										left: k ? 0 : A.scrollLeft(),
										top: k ? 0 : A.scrollTop(),
								  }),
								  (r = A.offset() || C),
								  ("shift" !== y || "shift" !== z) && (l = u.clone()),
								  (C = {
										left: "none" !== y ? j(G, H, y, w.x, L, N, I, f, h) : 0,
										top: "none" !== z ? j(H, G, z, w.y, K, M, J, g, i) : 0,
										my: l,
								  }))
								: C;
						}),
						(R.polys = {
							polygon: function (a, b) {
								var c,
									d,
									e,
									f = {
										width: 0,
										height: 0,
										position: { top: 1e10, right: 0, bottom: 0, left: 1e10 },
										adjustable: E,
									},
									g = 0,
									h = [],
									i = 1,
									j = 1,
									k = 0,
									l = 0;
								for (g = a.length; g--; )
									(c = [parseInt(a[--g], 10), parseInt(a[g + 1], 10)]),
										c[0] > f.position.right && (f.position.right = c[0]),
										c[0] < f.position.left && (f.position.left = c[0]),
										c[1] > f.position.bottom && (f.position.bottom = c[1]),
										c[1] < f.position.top && (f.position.top = c[1]),
										h.push(c);
								if (
									((d = f.width = Math.abs(f.position.right - f.position.left)),
									(e = f.height = Math.abs(f.position.bottom - f.position.top)),
									"c" === b.abbrev())
								)
									f.position = {
										left: f.position.left + f.width / 2,
										top: f.position.top + f.height / 2,
									};
								else {
									for (; d > 0 && e > 0 && i > 0 && j > 0; )
										for (
											d = Math.floor(d / 2),
												e = Math.floor(e / 2),
												b.x === L
													? (i = d)
													: b.x === N
													? (i = f.width - d)
													: (i += Math.floor(d / 2)),
												b.y === K
													? (j = e)
													: b.y === M
													? (j = f.height - e)
													: (j += Math.floor(e / 2)),
												g = h.length;
											g-- && !(h.length < 2);

										)
											(k = h[g][0] - f.position.left),
												(l = h[g][1] - f.position.top),
												((b.x === L && k >= i) ||
													(b.x === N && i >= k) ||
													(b.x === O && (i > k || k > f.width - i)) ||
													(b.y === K && l >= j) ||
													(b.y === M && j >= l) ||
													(b.y === O && (j > l || l > f.height - j))) &&
													h.splice(g, 1);
									f.position = { left: h[0][0], top: h[0][1] };
								}
								return f;
							},
							rect: function (a, b, c, d) {
								return {
									width: Math.abs(c - a),
									height: Math.abs(d - b),
									position: { left: Math.min(a, c), top: Math.min(b, d) },
								};
							},
							_angles: {
								tc: 1.5,
								tr: 7 / 4,
								tl: 5 / 4,
								bc: 0.5,
								br: 0.25,
								bl: 0.75,
								rc: 2,
								lc: 1,
								c: 0,
							},
							ellipse: function (a, b, c, d, e) {
								var f = R.polys._angles[e.abbrev()],
									g = 0 === f ? 0 : c * Math.cos(f * Math.PI),
									h = d * Math.sin(f * Math.PI);
								return {
									width: 2 * c - Math.abs(g),
									height: 2 * d - Math.abs(h),
									position: { left: a + g, top: b + h },
									adjustable: E,
								};
							},
							circle: function (a, b, c, d) {
								return R.polys.ellipse(a, b, c, c, d);
							},
						}),
						(R.imagemap = function (a, b, c) {
							b.jquery || (b = d(b));
							var e,
								f,
								g,
								h,
								i,
								j = (b.attr("shape") || "rect").toLowerCase().replace("poly", "polygon"),
								k = d('img[usemap="#' + b.parent("map").attr("name") + '"]'),
								l = d.trim(b.attr("coords")),
								m = l.replace(/,$/, "").split(",");
							if (!k.length) return E;
							if ("polygon" === j) h = R.polys.polygon(m, c);
							else {
								if (!R.polys[j]) return E;
								for (g = -1, i = m.length, f = []; ++g < i; ) f.push(parseInt(m[g], 10));
								h = R.polys[j].apply(this, f.concat(c));
							}
							return (
								(e = k.offset()),
								(e.left += Math.ceil((k.outerWidth(E) - k.width()) / 2)),
								(e.top += Math.ceil((k.outerHeight(E) - k.height()) / 2)),
								(h.position.left += e.left),
								(h.position.top += e.top),
								h
							);
						}),
						(R.svg = function (a, c, e) {
							for (
								var f,
									g,
									h,
									i,
									j,
									k,
									l,
									m,
									n,
									o = (d(b), c[0]),
									p = d(o.ownerSVGElement),
									q = o.ownerDocument,
									r = (parseInt(c.css("stroke-width"), 10) || 0) / 2;
								!o.getBBox;

							)
								o = o.parentNode;
							if (!o.getBBox || !o.parentNode) return E;
							switch (o.nodeName) {
								case "ellipse":
								case "circle":
									m = R.polys.ellipse(
										o.cx.baseVal.value,
										o.cy.baseVal.value,
										(o.rx || o.r).baseVal.value + r,
										(o.ry || o.r).baseVal.value + r,
										e
									);
									break;
								case "line":
								case "polygon":
								case "polyline":
									for (
										l = o.points || [
											{ x: o.x1.baseVal.value, y: o.y1.baseVal.value },
											{ x: o.x2.baseVal.value, y: o.y2.baseVal.value },
										],
											m = [],
											k = -1,
											i = l.numberOfItems || l.length;
										++k < i;

									)
										(j = l.getItem ? l.getItem(k) : l[k]), m.push.apply(m, [j.x, j.y]);
									m = R.polys.polygon(m, e);
									break;
								default:
									(m = o.getBBox()),
										(m = {
											width: m.width,
											height: m.height,
											position: { left: m.x, top: m.y },
										});
							}
							return (
								(n = m.position),
								(p = p[0]),
								p.createSVGPoint &&
									((g = o.getScreenCTM()),
									(l = p.createSVGPoint()),
									(l.x = n.left),
									(l.y = n.top),
									(h = l.matrixTransform(g)),
									(n.left = h.x),
									(n.top = h.y)),
								q !== b &&
									"mouse" !== a.position.target &&
									((f = d((q.defaultView || q.parentWindow).frameElement).offset()),
									f && ((n.left += f.left), (n.top += f.top))),
								(q = d(q)),
								(n.left += q.scrollLeft()),
								(n.top += q.scrollTop()),
								m
							);
						});
					var wb,
						xb,
						yb = "qtip-modal",
						zb = "." + yb;
					(xb = function () {
						function a(a) {
							if (d.expr[":"].focusable) return d.expr[":"].focusable;
							var b,
								c,
								e,
								f = !isNaN(d.attr(a, "tabindex")),
								g = a.nodeName && a.nodeName.toLowerCase();
							return "area" === g
								? ((b = a.parentNode),
								  (c = b.name),
								  a.href && c && "map" === b.nodeName.toLowerCase()
										? ((e = d("img[usemap=#" + c + "]")[0]), !!e && e.is(":visible"))
										: !1)
								: /input|select|textarea|button|object/.test(g)
								? !a.disabled
								: "a" === g
								? a.href || f
								: f;
						}
						function c(a) {
							k.length < 1 && a.length ? a.not("body").blur() : k.first().focus();
						}
						function e(a) {
							if (i.is(":visible")) {
								var b,
									e = d(a.target),
									h = f.tooltip,
									j = e.closest(W);
								(b =
									j.length < 1
										? E
										: parseInt(j[0].style.zIndex, 10) > parseInt(h[0].style.zIndex, 10)),
									b || e.closest(W)[0] === h[0] || c(e),
									(g = a.target === k[k.length - 1]);
							}
						}
						var f,
							g,
							h,
							i,
							j = this,
							k = {};
						d.extend(j, {
							init: function () {
								return (
									(i = j.elem =
										d("<div />", {
											id: "qtip-overlay",
											html: "<div></div>",
											mousedown: function () {
												return E;
											},
										}).hide()),
									d(b.body).bind("focusin" + zb, e),
									d(b).bind("keydown" + zb, function (a) {
										f && f.options.show.modal.escape && 27 === a.keyCode && f.hide(a);
									}),
									i.bind("click" + zb, function (a) {
										f && f.options.show.modal.blur && f.hide(a);
									}),
									j
								);
							},
							update: function (b) {
								(f = b),
									(k =
										b.options.show.modal.stealfocus !== E
											? b.tooltip.find("*").filter(function () {
													return a(this);
											  })
											: []);
							},
							toggle: function (a, e, g) {
								var k = (d(b.body), a.tooltip),
									l = a.options.show.modal,
									m = l.effect,
									n = e ? "show" : "hide",
									o = i.is(":visible"),
									p = d(zb).filter(":visible:not(:animated)").not(k);
								return (
									j.update(a),
									e && l.stealfocus !== E && c(d(":focus")),
									i.toggleClass("blurs", l.blur),
									e && i.appendTo(b.body),
									(i.is(":animated") && o === e && h !== E) || (!e && p.length)
										? j
										: (i.stop(D, E),
										  d.isFunction(m)
												? m.call(i, e)
												: m === E
												? i[n]()
												: i.fadeTo(parseInt(g, 10) || 90, e ? 1 : 0, function () {
														e || i.hide();
												  }),
										  e ||
												i.queue(function (a) {
													i.css({ left: "", top: "" }), d(zb).length || i.detach(), a();
												}),
										  (h = e),
										  f.destroyed && (f = F),
										  j)
								);
							},
						}),
							j.init();
					}),
						(xb = new xb()),
						d.extend(w.prototype, {
							init: function (a) {
								var b = a.tooltip;
								return this.options.on
									? ((a.elements.overlay = xb.elem),
									  b.addClass(yb).css("z-index", y.modal_zindex + d(zb).length),
									  a._bind(
											b,
											["tooltipshow", "tooltiphide"],
											function (a, c, e) {
												var f = a.originalEvent;
												if (a.target === b[0])
													if (
														f &&
														"tooltiphide" === a.type &&
														/mouse(leave|enter)/.test(f.type) &&
														d(f.relatedTarget).closest(xb.elem[0]).length
													)
														try {
															a.preventDefault();
														} catch (g) {}
													else
														(!f || (f && "tooltipsolo" !== f.type)) &&
															this.toggle(a, "tooltipshow" === a.type, e);
											},
											this._ns,
											this
									  ),
									  a._bind(
											b,
											"tooltipfocus",
											function (a, c) {
												if (!a.isDefaultPrevented() && a.target === b[0]) {
													var e = d(zb),
														f = y.modal_zindex + e.length,
														g = parseInt(b[0].style.zIndex, 10);
													(xb.elem[0].style.zIndex = f - 1),
														e.each(function () {
															this.style.zIndex > g && (this.style.zIndex -= 1);
														}),
														e.filter("." + $).qtip("blur", a.originalEvent),
														(b.addClass($)[0].style.zIndex = f),
														xb.update(c);
													try {
														a.preventDefault();
													} catch (h) {}
												}
											},
											this._ns,
											this
									  ),
									  void a._bind(
											b,
											"tooltiphide",
											function (a) {
												a.target === b[0] &&
													d(zb).filter(":visible").not(b).last().qtip("focus", a);
											},
											this._ns,
											this
									  ))
									: this;
							},
							toggle: function (a, b, c) {
								return a && a.isDefaultPrevented() ? this : void xb.toggle(this.qtip, !!b, c);
							},
							destroy: function () {
								this.qtip.tooltip.removeClass(yb),
									this.qtip._unbind(this.qtip.tooltip, this._ns),
									xb.toggle(this.qtip, E),
									delete this.qtip.elements.overlay;
							},
						}),
						(wb = R.modal =
							function (a) {
								return new w(a, a.options.show.modal);
							}),
						(wb.sanitize = function (a) {
							a.show &&
								("object" != typeof a.show.modal
									? (a.show.modal = { on: !!a.show.modal })
									: "undefined" == typeof a.show.modal.on && (a.show.modal.on = D));
						}),
						(y.modal_zindex = y.zindex - 200),
						(wb.initialize = "render"),
						(B.modal = {
							"^show.modal.(on|blur)$": function () {
								this.destroy(),
									this.init(),
									this.qtip.elems.overlay.toggle(this.qtip.tooltip[0].offsetWidth > 0);
							},
						}),
						d.extend(D, y.defaults, {
							show: {
								modal: { on: E, effect: D, blur: D, stealfocus: D, escape: D },
							},
						});
					var Ab,
						Bb =
							'<iframe class="qtip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';"  style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>';
					d.extend(x.prototype, {
						_scroll: function () {
							var b = this.qtip.elements.overlay;
							b && (b[0].style.top = d(a).scrollTop() + "px");
						},
						init: function (c) {
							var e = c.tooltip;
							d("select, object").length < 1 &&
								((this.bgiframe = c.elements.bgiframe = d(Bb).appendTo(e)),
								c._bind(e, "tooltipmove", this.adjustBGIFrame, this._ns, this)),
								(this.redrawContainer = d("<div/>", {
									id: S + "-rcontainer",
								}).appendTo(b.body)),
								c.elements.overlay &&
									c.elements.overlay.addClass("qtipmodal-ie6fix") &&
									(c._bind(a, ["scroll", "resize"], this._scroll, this._ns, this),
									c._bind(e, ["tooltipshow"], this._scroll, this._ns, this)),
								this.redraw();
						},
						adjustBGIFrame: function () {
							var a,
								b,
								c = this.qtip.tooltip,
								d = { height: c.outerHeight(E), width: c.outerWidth(E) },
								e = this.qtip.plugins.tip,
								f = this.qtip.elements.tip;
							(b = parseInt(c.css("borderLeftWidth"), 10) || 0),
								(b = { left: -b, top: -b }),
								e && f && ((a = "x" === e.corner.precedance ? [I, L] : [J, K]), (b[a[1]] -= f[a[0]]())),
								this.bgiframe.css(b).css(d);
						},
						redraw: function () {
							if (this.qtip.rendered < 1 || this.drawing) return this;
							var a,
								b,
								c,
								d,
								e = this.qtip.tooltip,
								f = this.qtip.options.style,
								g = this.qtip.options.position.container;
							return (
								(this.qtip.drawing = 1),
								f.height && e.css(J, f.height),
								f.width
									? e.css(I, f.width)
									: (e.css(I, "").appendTo(this.redrawContainer),
									  (b = e.width()),
									  1 > b % 2 && (b += 1),
									  (c = e.css("maxWidth") || ""),
									  (d = e.css("minWidth") || ""),
									  (a = (c + d).indexOf("%") > -1 ? g.width() / 100 : 0),
									  (c = (c.indexOf("%") > -1 ? a : 1) * parseInt(c, 10) || b),
									  (d = (d.indexOf("%") > -1 ? a : 1) * parseInt(d, 10) || 0),
									  (b = c + d ? Math.min(Math.max(b, d), c) : b),
									  e.css(I, Math.round(b)).appendTo(g)),
								(this.drawing = 0),
								this
							);
						},
						destroy: function () {
							this.bgiframe && this.bgiframe.remove(),
								this.qtip._unbind([a, this.qtip.tooltip], this._ns);
						},
					}),
						(Ab = R.ie6 =
							function (a) {
								return 6 === db.ie ? new x(a) : E;
							}),
						(Ab.initialize = "render"),
						(B.ie6 = {
							"^content|style$": function () {
								this.redraw();
							},
						});
				});
			})(window, document);
			(function ($) {
				$.fn.hoverIntent = function (handlerIn, handlerOut, selector) {
					var cfg = { interval: 100, sensitivity: 6, timeout: 0 };
					if (typeof handlerIn === "object") {
						cfg = $.extend(cfg, handlerIn);
					} else {
						if ($.isFunction(handlerOut)) {
							cfg = $.extend(cfg, {
								over: handlerIn,
								out: handlerOut,
								selector: selector,
							});
						} else {
							cfg = $.extend(cfg, {
								over: handlerIn,
								out: handlerIn,
								selector: handlerOut,
							});
						}
					}
					var cX, cY, pX, pY;
					var track = function (ev) {
						cX = ev.pageX;
						cY = ev.pageY;
					};
					var compare = function (ev, ob) {
						ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
						if (Math.sqrt((pX - cX) * (pX - cX) + (pY - cY) * (pY - cY)) < cfg.sensitivity) {
							$(ob).off("mousemove.hoverIntent", track);
							ob.hoverIntent_s = true;
							return cfg.over.apply(ob, [ev]);
						} else {
							pX = cX;
							pY = cY;
							ob.hoverIntent_t = setTimeout(function () {
								compare(ev, ob);
							}, cfg.interval);
						}
					};
					var delay = function (ev, ob) {
						ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
						ob.hoverIntent_s = false;
						return cfg.out.apply(ob, [ev]);
					};
					var handleHover = function (e) {
						var ev = $.extend({}, e);
						var ob = this;
						if (ob.hoverIntent_t) {
							ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
						}
						if (e.type === "mouseenter") {
							pX = ev.pageX;
							pY = ev.pageY;
							$(ob).on("mousemove.hoverIntent", track);
							if (!ob.hoverIntent_s) {
								ob.hoverIntent_t = setTimeout(function () {
									compare(ev, ob);
								}, cfg.interval);
							}
						} else {
							$(ob).off("mousemove.hoverIntent", track);
							if (ob.hoverIntent_s) {
								ob.hoverIntent_t = setTimeout(function () {
									delay(ev, ob);
								}, cfg.timeout);
							}
						}
					};
					return this.on(
						{
							"mouseenter.hoverIntent": handleHover,
							"mouseleave.hoverIntent": handleHover,
						},
						cfg.selector
					);
				};
			})($jq);
		}
	})();
})();
