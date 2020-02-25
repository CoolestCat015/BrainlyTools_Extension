import cookie from "js-cookie";
// @ts-ignore
import extensionConfig from "../../configs/_/extension.json";
import ArrayLast from "../helpers/ArrayLast";
import storage from "../helpers/extStorage";
import InjectToDOM from "../helpers/InjectToDOM";
import Action from "./Req/Brainly/Action";
import ServerReq from "@ServerReq";
import locale from "@/locales"

class _System {
  constructor(main) {
    this.logStyle =
      `font-size: 11px;color: #4fb3f6;font-family:century gothic;`;
    this.main = main;
    let that = this;
    this.constants = {
      Brainly: {
        regexp_BrainlyMarkets: /:\/\/(?:www\.)?((?:eodev|znanija)\.com|nosdevoirs\.fr|brainly(?:(?:\.(?:com(?:\.br|[^.])|co\.(?:id)|lat|in|ph|ro|pl))))/i,
        brainlyMarkets: [
          "brainly.com",
          "eodev.com",
          "brainly.pl",
          "brainly.com.br",
          "brainly.co.id",
          "znanija.com",
          "brainly.lat",
          "brainly.in",
          "brainly.ph",
          "nosdevoirs.fr",
          "brainly.ro",
        ],
        style_guide: {
          icons: "https://styleguide.brainly.com/images/icons-dbb19c2ba8.js" +
            "?treat=.ext_js",
        },
        githubHighlight: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/github.min.css",
      },
      config: {
        reasonSign: "߷",
        idExtractRegex: /((?:.*?[-/])(?=\d))|(?:[?/].*)|(?:[a-z]{1,})/gi,
        MAX_FILE_SIZE_OF_EVIDENCE_IN_MB: 22,
        get MAX_FILE_SIZE_OF_EVIDENCE() {
          return this.MAX_FILE_SIZE_OF_EVIDENCE_IN_MB * 1024 * 1024;
        },
        RAINBOW_COLORS: "#F15A5A,#F0C419,#4EBA6F,#2D95BF,#955BA5",
        availableLanguages: [{
            key: "en_US",
            title: "English"
          },
          {
            key: "id",
            title: `Bahasa Indonesia <span class="is-pulled-right">Zuhh</span>`
          },
          {
            key: "fr",
            title: `Français <span class="is-pulled-right">MichaelS, Its1tom</span>`
          },
          {
            key: "tr",
            title: "Türkçe"
          }
        ],
        pinIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" class="sg-icon sg-icon--gray sg-icon--x{size}"><path d="M18.266 4.3l-9.192 9.192 5.237 5.237c.357-1.2.484-2.486.28-3.68l5.657-5.657c.86.01 1.8-.2 2.638-.473L18.266 4.3z" fill="#c0392b"></path><path d="M9.074 13.483L3.417 19.14 2.7 21.26l7.07-7.07-.707-.707z" fill="#bdc3c7"></path><path d="M9.78 14.2L2.7 21.26l2.12-.707 5.657-5.657-.707-.707z" fill="#7f8c8d"></path><path d="M15.062 1.086c-.282.85-.484 1.778-.473 2.638L8.932 9.38c-1.195-.205-2.483-.08-3.68.278l4.53 4.53 9.192-9.192-3.91-3.91z" fill="#e74c3c"></path></svg>`,
      }

    }
    this.data = {
      Brainly: {
        get apiURL() {
          return (that.data.meta.location.origin || document.location
            .origin) + "/api/28"
        },
        get nullAvatar() {
          return `/img/avatars/100-ON.png`;
        },
        tokenLong: cookie.get("Zadanepl_cookie[Token][Long]"),
        Routing: {
          prefix: undefined,
          routes: undefined
        }
      },
      meta: {},
      locale,
      config: {
        extension: extensionConfig
      }
    }
    this.routeMasks = {
      profile: null,
      task: null
    };
    this.friends = [];

    console.log(`%cSystem library initialized`, this.logStyle);
  }
  /**
   * A colorizing proxy of console.log method
   * @param  {...any} args
   */
  Log(...args) {
    let isContainsObject = args.filter(arg => typeof arg !== "string" ||
      typeof arg !== "number");

    if (!isContainsObject)
      console.log(`%c${args.join(" ")}`, this.logStyle);
    else
      args.forEach(arg => {
        if (typeof arg == "string" || typeof arg == "number")
          console.log(`%c${arg}`, this.logStyle);
        else
          console.log(arg);
      });
  }
  /**
   * @param {number} milliseconds - Specify delay in milliseconds
   * @return {Promise<number>} - milliseconds
   */
  Delay(milliseconds = this.randomNumber(1000, 4000)) {
    return new Promise(resolve => setTimeout(() => resolve(milliseconds),
      milliseconds));
  }
  TestDelay() {
    return this.Delay(this.randomNumber(100, 500))
  }
  /**
   * Generates a number between the maximum number including the minimum number
   * @param {number} min
   * @param {number} max
   */
  randomNumber(min = 0, max = 10) {
    if (min > max)[min, max] = [max, min];

    return Math.floor((Math.random() * max) + min);
  }
  pageLoaded(loadMessage) {
    this.Log(loadMessage);
    this.Log(
      // @ts-ignore
      `Brainly Tools loaded in ${Number((performance.now() - window.performanceStartTiming).toFixed(2))} milliseconds`
    );
  }
  checkRoute(index, str) {
    let curr_path = this.data.meta.location.pathname.split("/"),
      result = false;

    if (curr_path.length >= 2) {
      if (typeof str == "undefined") {
        console.log("str is undefined, check please");
        result = curr_path[index];
      } else if ((curr_path[index] || "") == str) {
        result = true;
      } else {
        let route = this.data.Brainly.Routing.routes[str] || this.data.Brainly
          .Routing.routes[this.data.Brainly.Routing.prefix + str];

        if (route) {
          let tokens = route.tokens;

          if (!tokens)
            console.error("Route tokens not found");
          else {
            for (let i = 0;
              (i < tokens.length && typeof tokens != "string"); i++)
              tokens = tokens[tokens.length - 1];
            if (!tokens)
              console.error("Route tokens not found");
            else {
              if (tokens == "/" + curr_path[index]) {
                result = true;
              }
            }
          }
        }
      }
    }
    return result;
  }
  toBackground(action, data) {
    let messageData = {
      action,
      marketName: this.data.meta.marketName,
      data
    };

    return new Promise((resolve, reject) => {
      let handler = (response) => {
        try {
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      try {
        window.chrome.runtime.sendMessage(this.data.meta.extension && this
          .data.meta.extension.id,
          messageData, handler);
      } catch (error) {
        reject(error);
      }
    });
  }
  ShareSystemDataToBackground() {
    return new Promise(async (resolve, reject) => {
      let res = await this.toBackground("setMarketData", this.data);

      if (!res) {
        reject({
          message: "I couldn't share the System data variable to background",
          res
        });
      } else {
        this.Log("Data shared with background OK!");
        resolve();
      }
    });
  }
  enableExtensionIcon() {
    this.toBackground("enableExtensionIcon")
  }
  changeBadgeColor(status) {
    this.toBackground("changeBadgeColor", status)
  }
  /**
   * @param {{avatar?: Avatar, avatars: Avatar} & Avatar} user
   * @param {*} param1
   */
  prepareAvatar(user, { returnIcon, noOrigin, replaceOrigin } = {}) {
    let avatar = "";

    if (user) {
      if (user.avatar) {
        avatar = user.avatar[64] || user.avatar[100] || user.avatar.src ||
          user.avatar.small || user.avatar.medium;
      }
      if (user.avatars) {
        avatar = user.avatars[64] || user.avatars[100] || user.avatars.src ||
          user.avatars.small || user.avatars.medium;
      }
      if (user[64] || user[100] || user.src || user.small || user.medium) {
        avatar = user[64] || user[100] || user.src || user.small || user
          .medium;
      }
    }

    if (avatar && returnIcon) {
      avatar =
        `<img class="sg-avatar__image sg-avatar__image--icon" src="${avatar}">`;
    } else if (!avatar) {
      if (returnIcon)
        avatar =
        `<div class="sg-icon sg-icon--gray-secondary sg-icon--x32">
					<svg class="sg-icon__svg">
						<use xlink:href="#icon-profile"></use>
					</svg>
				</div>`
      else {
        if (replaceOrigin)
          avatar = `https://${replaceOrigin}`;
        else if (!noOrigin)
          avatar = `https://${this.data.meta.marketName}`;

        avatar += this.data.Brainly.nullAvatar
      }
    }

    return avatar;
  }
  /**
   * @typedef {{src?: string, small?: string, medium?: string, 64?: string, 100?: string}} Avatar
   * @param {{avatar?: Avatar, avatars?: Avatar} & Avatar} entry
   */
  ExtractAvatarURL(entry) {
    let avatarURL = "";

    if (entry) {
      avatarURL = _ExtractAvatarURL(entry);

      if (!avatarURL && entry.avatar)
        avatarURL = _ExtractAvatarURL(entry.avatar);

      if (!avatarURL && entry.avatars)
        avatarURL = _ExtractAvatarURL(entry.avatars);
    }

    return avatarURL;
  }
  /**
   * @typedef {number|string} idType
   * @param {idType | {id?: idType, brainlyID?: idType, nick: string}} [id]
   * @param {string} [nick]
   * @param {boolean} [noOrigin]
   */
  createProfileLink(id, nick = "a", noOrigin) {
    let origin = "";

    if (id instanceof Object && id.nick) {
      nick = id.nick;
      id = id.id || id.brainlyID;
    }

    if (!nick && !id) {
      nick = this.data.Brainly.userData.user.nick
      id = this.data.Brainly.userData.user.id
    }

    if (isNaN(Number(id)))
      try {
        id = this.DecryptId(String(id));
      } catch (error) {}

    if (!this.profileLinkRoute)
      this.profileLinkRoute = ArrayLast(ArrayLast(this.data.Brainly.Routing
        .routes[this.data.Brainly.Routing.prefix + "user_profile"].tokens));

    if (!noOrigin) {
      origin = this.data.meta.location.origin;
    }

    if (this.profileLinkRoute) {
      return origin + this.profileLinkRoute + "/" + nick + "-" + id;
    } else
      return "";
  }
  createBrainlyLink(type, data) {
    let _return = "";

    if (type === "profile") {
      if (!this.routeMasks.profile)
        this.routeMasks.profile = ArrayLast(ArrayLast(this.data.Brainly
          .Routing.routes[this.data.Brainly.Routing.prefix + "user_profile"]
          .tokens));

      if (this.routeMasks.profile) {
        /* console.log(System.data.meta.location.origin);
        console.log(this.routeMasks.profile);
        console.log(data.nick);
        console.log((data.id || data.brainlyID)); */
        _return = this.data.meta.location.origin + this.routeMasks.profile +
          "/" + data.nick + "-" + (data.id || data.brainlyID);
      } else
        _return = "";
    }
    if (type === "question") {
      if (!this.routeMasks.task) {
        this.routeMasks.task = ArrayLast(ArrayLast(this.data.Brainly.Routing
          .routes[this.data.Brainly.Routing.prefix + "task_view"].tokens));
      }

      if (this.routeMasks.task)
        _return = this.data.meta.location.origin + this.routeMasks.task +
        "/" + (data.id || data.brainlyID);
      else
        _return = "";
    }

    return _return;
  }
  checkBrainlyP(p) {
    let r = !1;

    if (typeof p == "number") {
      this.data.Brainly.userData.privileges.includes(p) && (r = !0);
    } else if (p instanceof Array) {
      p.forEach(n => {
        this.data.Brainly.userData.privileges.includes(n) && (r = !0);
      });
    }

    return r;
  }
  checkUserP(p, exc0) {
    let r = !1;

    if (!exc0 && this.data.Brainly.userData._hash.includes(0))
      r = !0;
    else {
      if (typeof p == "number") {
        this.data.Brainly.userData._hash.includes(p) && (r = !0);
      } else {
        p.forEach(n => {
          this.data.Brainly.userData._hash.includes(n) && (r = !0);
        });
      }
    }

    return r;
    /*eval(function(p, a, c, k, e, d) {
    	e = function(c) { return c };
    	if (!''.replace(/^/, String)) {
    		while (c--) { d[c] = k[c] || c } k = [function(e) { return d[e] }];
    		e = function() { return '\\w+' };
    		c = 1
    	};
    	while (c--) { if (k[c]) { p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]) } }
    	return p
    }('4.3.2.5.6.7(8)>-1&&(0&&0());', 9, 9, 'c||Brainly|data|System|userData|_hash|indexOf|p'.split('|'), 0, {}))*/
  }
  async log(type, log) {
    if (
      log &&
      log.user &&
      (
        !(
          log.user.nick ||
          log.user._nick
        ) ||

        !log.user.id ||
        ~~log.user.id != 0
      )
    ) {
      let user = await new Action().GetUserProfile(log.user.id);
      log.user.nick = user.data.nick;
      log.user.id = user.data.id;
    }

    new ServerReq().Logger(type, log);
  }
  async updateExtension() {
    let status = await this.toBackground("updateExtension");

    if (status == "update_available") {
      console.warn("update pending...");
    } else if (status == "no_update") {
      console.warn("no update found");
    } else if (status == "throttled") {
      console.warn("Asking too frequently. It's throttled");
    }
  }
  prepareLangFile(language, _resolve, _reject) {
    return new Promise(async (resolve, reject) => {
      resolve = _resolve || resolve;
      reject = _reject || reject;

      if (language.match(/\ben[-_](?:us|au|ca|in|nz|gb|za)|en\b/i)) {
        language = "en_US";
      } //else if (language.indexOf("-")) { language = language.replace(/[-_].*/, ""); }

      try {
        let fileType = "json";
        /**
         * @type {HTMLScriptElement}
         */
        let localeData = await InjectToDOM(
          `/locales/${language}.${fileType}`);

        resolve(localeData);
      } catch (error) {
        if (language != "en_US") {
          console.warn(
            "Missing language file, switching to default language");
          this.prepareLangFile("en_US", resolve, reject);
        } else {
          reject("Cannot find the default language file of extension");
        }
      }

      /* if (fileType == "yml") {
      	localeData = yaml.load(localeData);
      } */
    });
  }
  canBeWarned(reasonID) {
    let isIt = false;
    let preference = this.data.Brainly.deleteReasons.__preferences.find(
      pref => pref.reasonID == reasonID);

    if (preference && preference.confirmation != null) {
      if (preference.confirmation) {
        isIt = confirm(
          `\n\n${this.data.locale.common.notificationMessages.mayRequireWarning}\n\n`
        );
      } else {
        isIt = true;
      }
    }

    return isIt;
  }
  /**
   * @param {string} value
   * @returns {number}
   */
  ExtractId(value) {
    if (!value) return 0;

    let extractId = value.replace(this.constants.config.idExtractRegex, "");
    // Number because returns 0 if is not contains number
    let id = Number(extractId);

    if (id)
      return id;
  }
  /**
   * @param {string | string[]} list
   * @param {boolean} [uniqueNumbers]
   */
  ExtractIds(list, uniqueNumbers) {
    /**
     * @type {number[]}
     */
    let idList = [];

    if (typeof list == "string") {
      list = list
        .replace(this.constants.config.idExtractRegex, "")
        .split(/\r\n|\n/g);
    }

    if (
      list instanceof Array &&
      list.length > 0
    ) {
      if (!uniqueNumbers)
        idList = list.map(Number);
      else
        list.forEach(strId => {
          if (strId !== "") {
            let id = Number(strId);

            if (!idList.includes(id))
              idList.push(id);
          }
        });
    }

    return idList;
  }
  DecryptId(id = "") {
    if (!id)
      return;

    let data = atob(id);

    return Number(data.replace(/.*\:/, ""));
  }
  SetUserData(data) {
    storage("setL", { authData: data });

    this.SetUserDataToSystem(data);
  }
  SetUserDataToSystem(data) {
    this.data.Brainly.userData.extension = data;
    this.data.Brainly.userData._hash = data.hash;
  }
  OpenExtensionOptions(params) {
    this.toBackground("OpenExtensionOptions", params)
  }
  /**
   * @param {number[]} users
   * @param {{each?: function, done?: function}} handlers
   */
  async StoreUsers(users, handlers) {
    if (typeof users == "string")
      users = this.ParseUsers(users);

    if (users && users instanceof Array && users.length > 0) {
      let resUsers = await new Action().GetUsers(users);
      this.allModerators = {
        list: resUsers.data,
        withNicks: {},
        withID: {},
        withRanks: {}
      };

      if (resUsers.data && resUsers.data.length > 0) {
        resUsers.data.forEach(user => {
          this.allModerators.withNicks[user.nick] = user;
          this.allModerators.withID[user.id] = user;

          if (handlers && handlers.each)
            handlers.each(user);

          if (user.ranks_ids && user.ranks_ids.length > 0) {
            user.ranks_ids.forEach(rank => {
              let currentRank = this.allModerators.withRanks[rank];

              if (!currentRank) {
                currentRank = this.allModerators.withRanks[rank] = []
              }

              currentRank.push(user);
            });
          }
        });
      }

      handlers.done && handlers.done(this.allModerators);
    }
  }
  /**
   * @param {string} html
   */
  ParseUsers(html) {
    let ids = [];
    let matchResult = html.match(/\=\d{1,}/gim);

    if (matchResult && matchResult.length > 0)
      ids = matchResult.map(id => ~~(id.replace(/\D/gim, "")));

    return ids;
  }
  /**
   * @param {{
   *  id?: number | string,
   *  name?: string,
   *  type: "question" | "answer" | "comment",
   *  noRandom?: boolean
   * }} param0
   */
  DeleteReason({
    id,
    name,
    type,
    noRandom,
  }) {
    if (!type)
      throw "Content type needed";

    if (!id && !name)
      throw "Please specify an id or name";

    if (id && name)
      throw "You can't specify both id and name fields";

    let deleteReasons = System.data.Brainly.deleteReasons;
    let reasonGroup;

    if (id)
      reasonGroup = deleteReasons.__withIds;

    if (name)
      reasonGroup = deleteReasons.__withTitles;

    let reasons = reasonGroup[type];

    if (!reasons)
      throw "Unknown content type";

    let reasonKey = id || name;
    let reason = reasons[reasonKey];

    if (!reason) {
      if (noRandom)
        throw `Can't find a reason entry with: ${reasonKey}`;
      else {
        let reasonKeys = Object.keys(reasons)
          .filter(key => !key.includes("__"));

        if (reasonKeys.length === 0)
          throw `Market doesn't have any delete reasons for ${type}`;

        let randomN = Math.floor(Math.random() * reasonKeys.length);
        reason = reasons[reasonKeys[randomN]];
      }
    }

    return reason;
  }
}

/**
 *
 * @param {Avatar} entry
 */
function _ExtractAvatarURL(entry) {
  return entry[64] || entry[100] || entry.src || entry.small || entry.medium;
}
export default _System;
