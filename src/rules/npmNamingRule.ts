import critic = require("dts-critic");
import * as Lint from "tslint";
import * as ts from "typescript";

import { failure, isMainFile } from "../util";

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: "npm-naming",
        description: "Ensure that package name and DefinitelyTyped header match npm package info.",
        optionsDescription: "Not configurable.",
        options: null,
        type: "functionality",
        typescriptOnly: true,
    };

    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>): void {
    const { sourceFile } = ctx;
    const { text } = sourceFile;
    const lookFor = (search: string, explanation: string) => {
        const idx = text.indexOf(search);
        if (idx !== -1) {
            ctx.addFailureAt(idx, search.length, failure(Rule.metadata.ruleName, explanation));
        }
    };
    if (isMainFile(sourceFile.fileName, /*allowNested*/ false)) {
        try {
            critic(sourceFile.fileName);
        } catch (e) {
            // TODO: dts-critic should
            // 1. not really be using exceptions, but lists
            // 2. export an error code enum
            // 3. add an errorCode property to the exception (or return value)
            if (e.message.indexOf("d.ts file must have a matching npm package") > -1 ||
                e.message.indexOf("must match a version that exists on npm") > -1 ||
                e.message.indexOf("The non-npm package") > -1) {
                lookFor("// Type definitions for", e.message);
            } else if (e.message.indexOf("export default") > -1) {
                lookFor("export default", e.message);
            } else {
                // should be unused!
                ctx.addFailureAt(0, 1, e.message);
            }
        }
    }
    // Don't recur, we're done.
}
