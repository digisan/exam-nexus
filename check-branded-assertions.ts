// check-branded-assertions.ts

import { walk } from "jsr:@std/fs";
import * as ts from "https://esm.sh/typescript@5.8.3";

async function checkFile(filePath: string, ...excl: string[]) {
    const code = await Deno.readTextFile(filePath);
    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);
    const importedTypes = new Set<string>();
    const lines = code.split('\n');

    // Step 1: 获取所有通过 import type 引入的品牌类型
    // ts.forEachChild(sourceFile, (node) => {
    //     if (
    //         ts.isImportDeclaration(node) &&
    //         node.importClause?.isTypeOnly &&
    //         node.importClause.namedBindings &&
    //         ts.isNamedImports(node.importClause.namedBindings)
    //     ) {
    //         for (const spec of node.importClause.namedBindings.elements) {
    //             importedTypes.add(spec.name.text);
    //         }
    //     }
    // });

    // Step 1: 获取所有通过 import type 或 import { type ... } 引入的类型
    ts.forEachChild(sourceFile, (node) => {
        if (
            ts.isImportDeclaration(node) &&
            (node.importClause?.isTypeOnly || (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)))
        ) {
            if (node.importClause?.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    // NamedImports
                    for (const spec of node.importClause.namedBindings.elements) {
                        if (spec.propertyName?.text === "type" || spec.name.text) {
                            importedTypes.add(spec.name.text);
                        }
                    }
                } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    // NamespaceImport (没有 elements 属性)
                    // 如果需要支持命名空间导入，你可以添加额外的逻辑来处理
                }
            }
        }
    });

    if (importedTypes.size === 0) return;

    // Step 2: 深度遍历所有子节点，查找 as 表达式
    const issues: { type: string; line: number; code: string }[] = [];

    const checkNode = (node: ts.Node) => {
        if (ts.isAsExpression(node)) {
            const type = node.type.getText(sourceFile);
            if (importedTypes.has(type)) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                if (!excl.includes(type)) {
                    issues.push({
                        type,
                        line: line + 1,
                        code: lines[line].trim(),
                    });
                }
            }
        }
        ts.forEachChild(node, checkNode);
    };

    checkNode(sourceFile);

    // Step 3: 报错
    if (issues.length > 0) {
        console.error(`\n❌ Violations in ${filePath}:`);
        for (const i of issues) {
            console.error(`  Line ${i.line}: "as ${i.type}" → ${i.code}`);
        }
        throw new Error(`Branded type assertion found in ${filePath}`);
    }
}

async function main() {
    for await (const entry of walk(".", {
        includeDirs: false,
        exts: [".ts", ".tsx", ".js", ".jsx"],
        skip: [/node_modules/, /\.git/],
    })) {
        await checkFile(entry.path, 'SafeT');
    }
    console.log("✅ No branded type assertion found.");
}

if (import.meta.main) {
    await main();
}

