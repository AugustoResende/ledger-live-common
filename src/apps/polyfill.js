// @flow
// polyfill the unfinished support of apps logic

import uniq from "lodash/uniq";
import type { App, Application } from "../types/manager";
import {
  listCryptoCurrencies,
  findCryptoCurrencyById
} from "../data/cryptocurrencies";

const directDep = {};
const reverseDep = {};
export function declareDep(name: string, dep: string) {
  directDep[name] = (directDep[name] || []).concat(dep);
  reverseDep[dep] = (reverseDep[dep] || []).concat(name);
}
listCryptoCurrencies(true, true).forEach(a => {
  if (!a.managerAppName) return; // no app for this currency
  const dep = findCryptoCurrencyById(a.family);
  if (!dep || !dep.managerAppName) return; // no dep
  if (dep.managerAppName === a.managerAppName) return; // same app
  declareDep(a.managerAppName, dep.managerAppName);
});

// extra dependencies
[
  ["RSK", "Ethereum"],
  ["ZenCash", "Bitcoin"],
  ["kUSD", "Ethereum"],
  ["ThunderCore", "Ethereum"],
  ["ARTIS sigma1", "Ethereum"],
  ["Volta", "Ethereum"]
].forEach(([name, dep]) => declareDep(name, dep));

export const getDependencies = (appName: string): string[] =>
  directDep[appName] || [];

export const getDependents = (appName: string): string[] =>
  reverseDep[appName] || [];

export const polyfillApplication = (app: Application): Application => {
  const crypto = listCryptoCurrencies(true, true).find(
    crypto => app.name.toLowerCase() === crypto.managerAppName.toLowerCase()
  );
  let o = app;
  if (crypto && !app.currencyId) {
    o = { ...o, currencyId: crypto.id };
  }
  return o;
};

export const polyfillApp = (app: $Exact<App>): $Exact<App> => {
  return {
    ...app,
    dependencies: uniq(app.dependencies.concat(getDependencies(app.name)))
  };
};
