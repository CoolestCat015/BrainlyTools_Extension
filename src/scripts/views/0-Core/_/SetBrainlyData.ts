import Action from "../../../controllers/Req/Brainly/Action";
import WaitForObject from "../../../helpers/WaitForObject";

/**
 * @type {string}
 */
let RoutesFetchURL;

export default async function SetBrainlyData() {
  let routing = localStorage.getObject("Routing");
  let defaultConfig = localStorage.getObject("__default_config");

  if (!routing || !defaultConfig) {
    defaultConfig = await GetDefaultConfig();
    routing = await GetRoutingData();
  } else {
    (async () => {
      await GetDefaultConfig();
      GetRoutingData();
    })();
  }

  if (!routing.prefix) {
    routing.prefix = routing.b.prefix;
    routing.routes = routing.d.c;
  }

  System.data.Brainly.Routing = routing;
  System.data.Brainly.defaultConfig = defaultConfig;

  System.Log("SetBrainlyData OK!");

  return true;
}

async function GetDefaultConfig() {
  let defaultConfig;

  if (document.head.innerHTML.match(/__default_config/gmi)) {
    defaultConfig = await WaitForObject("__default_config");

    PrepareSecondaryObjects(defaultConfig);
  } else {
    defaultConfig = await FetchDefaultConfig();
  }

  localStorage.setObject("__default_config", defaultConfig);

  return defaultConfig;
}

function FetchDefaultConfig() {
  return new Promise(async (resolve, reject) => {
    let sourcePageHTML = await new Action().GetQuestionAddPage();

    //console.log("res:", res);
    if (sourcePageHTML && sourcePageHTML != "") {
      let matchConfig = (/__default_config = (.*[\S\s]*?};)/gmi).exec(
        sourcePageHTML);
      let matchSecondConfig = (/\.config \= (.*)\;/gmi).exec(
        sourcePageHTML);

      let matchAuthJSFile = sourcePageHTML.match(
        /(\/sf\/js\/bundle\/include_auth\_[a-z\_\-]{1,}\-[a-z0-9]{1,}\.min\.js)/gmi
      );

      if (!matchAuthJSFile)
        reject("Can't find auth js file link");

      RoutesFetchURL = matchAuthJSFile[matchAuthJSFile.length - 1];
      //RoutesFetchURL = ExtractRoutesFetchURL(res);

      if (!matchConfig || matchConfig.length < 2) {
        reject("Config object not found");
      } else if (!matchSecondConfig || matchSecondConfig.length < 2) {
        reject("Second config object not found");
      } else if (!RoutesFetchURL) {
        reject("Routes URL not found");
      } else {
        resolve(ProcessDefaultConfigData(matchConfig[matchConfig.length -
          1], matchSecondConfig[matchSecondConfig.length - 1]));
      }
    }
  });
}

function ProcessDefaultConfigData(first, second) {
  System.data.Brainly.defaultConfig = new Function(`return ${first}`)();
  System.data.Brainly.defaultConfig.config = JSON.parse(second);

  PrepareSecondaryObjects();

  return System.data.Brainly.defaultConfig;
}

function PrepareSecondaryObjects(defaultConfig) {
  if (!defaultConfig && System.data.Brainly.defaultConfig)
    defaultConfig = System.data.Brainly.defaultConfig;

  if (
    !System.data.Brainly.defaultConfig ||
    !System.data.Brainly.defaultConfig.user ||
    typeof System.data.Brainly.defaultConfig.user.ME == "string"
  ) {
    defaultConfig.user.ME = JSON.parse(defaultConfig.user.ME);
  }

  defaultConfig.config.data.ranksWithId = {};
  defaultConfig.config.data.ranksWithName = {};

  defaultConfig.config.data.ranks.forEach(rank => {
    defaultConfig.config.data.ranksWithId[rank.id] = {
      name: rank.name,
      color: rank.color,
      type: rank.type,
      description: rank.description
    };
    defaultConfig.config.data.ranksWithName[rank
      .name] = {
      name: rank.name,
      color: rank.color,
      type: rank.type,
      description: rank.description
    };
  });
}

async function GetRoutingData() {
  let routing;
  //let RoutingContainerMatch = Array.from(document.scripts).find(script => script.src.match(/__vendors|include_main_/gmi));
  //console.log("document.body.innerHTML.match(/__vendors|include_main_/gmi):", document.body.innerHTML.match(/__vendors|include_main_/gmi));
  if (!RoutesFetchURL) {
    routing = await WaitForObject("Routing");
  } else {
    routing = await FetchRouting();
  }

  localStorage.setObject("Routing", routing);

  return routing;
}

async function FetchRouting() {
  let action = new Action();

  if (!RoutesFetchURL.includes("http"))
    RoutesFetchURL = location.origin + RoutesFetchURL;

  action.url = new URL(RoutesFetchURL);
  let resJS = await action.GET();

  if (resJS) {
    let matchRoutes = resJS.match(/(routes:.*scheme\:\"http\")/gmi);

    if (!matchRoutes || matchRoutes.length < 1) {
      throw { msg: "Routes not found", resJS };
    } else {
      let routing = new Function(
        `return {${matchRoutes[matchRoutes.length - 1]}}`)();

      return routing;
    }
  }
}
