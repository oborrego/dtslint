"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const child_process_1 = require("child_process");
const fsp = require("fs-promise");
const path = require("path");
const definitelytyped_header_parser_1 = require("./rules/definitelytyped-header-parser");
const installsDir = path.join(__dirname, "..", "typescript-installs");
function installAll() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const v of definitelytyped_header_parser_1.TypeScriptVersion.all) {
            yield install(v);
        }
        yield install("next");
    });
}
exports.installAll = installAll;
function install(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = installDir(version);
        if (!(yield fsp.existsSync(dir))) {
            console.log(`Installing to ${dir}...`);
            yield fsp.mkdirp(dir);
            yield fsp.writeJson(path.join(dir, "package.json"), packageJson(version));
            yield execAndThrowErrors("npm install", dir);
            console.log("Installed!");
        }
    });
}
exports.install = install;
function getTypeScript(version) {
    const tsPath = path.join(installDir(version), "node_modules", "typescript");
    const ts = require(tsPath);
    assert(version === "next" || ts.version.startsWith(version));
    return ts;
}
exports.getTypeScript = getTypeScript;
function cleanInstalls() {
    return fsp.remove(installsDir);
}
exports.cleanInstalls = cleanInstalls;
function tscPath(version) {
    return path.join(installDir(version), "node_modules", "typescript", "lib", "tsc.js");
}
exports.tscPath = tscPath;
function installDir(version) {
    return path.join(installsDir, version);
}
/** Run a command and return the stdout, or if there was an error, throw. */
function execAndThrowErrors(cmd, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            child_process_1.exec(cmd, { encoding: "utf8", cwd }, (err, _stdout, stderr) => {
                console.error(stderr);
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
function packageJson(version) {
    return {
        description: `Installs typescript@${version}`,
        repository: "N/A",
        license: "MIT",
        dependencies: {
            typescript: version,
        },
    };
}
//# sourceMappingURL=installer.js.map