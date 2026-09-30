import {
    ModFile,
    keyword
} from "@yunixos/paradoxical";

import { PortraitGroup } from "../portrait-group";
import { resolve, ResolvedNode } from "./condition-resolver";

export function generate(
    group: PortraitGroup,
    outputPath: string
): ModFile[] {
    const resolvedNodes = resolve(group.defaultNode);

    const files: ModFile[] = [];

    for (const node of resolvedNodes) {
        files.push(
            ...generatePortraitNode(
                group,
                node,
                outputPath
            )
        );
    }

    return files;
}

function generatePortraitNode(
    group: PortraitGroup,
    resolvedNode: ResolvedNode,
    outputPath: string,
): ModFile[] {
    const isRootNode =
        resolvedNode.path.length === 1 &&
        resolvedNode.path[0] === group.name;

    const id = resolvedNode.path.join("_");

    const portraits = resolvedNode.node.portraits?.portraits ?? [];

    if (
        portraits.length === 0 &&
        !(isRootNode && group.defaultPortrait)
    ) {
        console.warn(
            `Portrait node "${id}" has no portraits: skipping generation`
        );

        return [];
    }

    const file = new ModFile(
        outputPath,
        `${id}.txt`
    );

    const portraitImports = file.addContainer("portraits");

    // Normal node portraits
    for (const [i, portrait] of portraits.entries()) {
        const portraitImport =
            portraitImports.addContainer(`${id}_${i}`);

        portraitImport.addClause(
            "texturefile",
            portrait
        );
    }

    // Group default portrait
    if (isRootNode && group.defaultPortrait) {
        const defaultId = `${id}_default`;

        const portraitImport =
            portraitImports.addContainer(defaultId);

        portraitImport.addClause(
            "texturefile",
            group.defaultPortrait
        );
    }

    const portraitGroups =
        file.addContainer("portrait_groups");

    const portraitGroup =
        portraitGroups.addContainer(group.name);
    
    if (isRootNode && group.defaultPortrait) {
        portraitGroup.addClause(
            "default",
            keyword(`${id}_default`)
        );
    }

    for (const resolvedScope of resolvedNode.scopes) {
        const scope =
            portraitGroup.addContainer(resolvedScope.scope);

        const add =
            scope.addContainer("add");

        if (
            resolvedScope.positiveConditions.length > 0 ||
            resolvedScope.negativeConditions.length > 0
        ) {
            const trigger =
                add.addContainer("trigger");

            for (const condition of resolvedScope.positiveConditions) {
                trigger.add(condition);
            }

            if (resolvedScope.negativeConditions.length > 0) {
                const nor =
                    trigger.addContainer("NOR");

                for (const condition of resolvedScope.negativeConditions) {
                    nor.add(condition);
                }
            }
        }

        const scopePortraits =
            add.addContainer("portraits");

        for (const [i] of portraits.entries()) {
            scopePortraits.addUnit(
                keyword(`${id}_${i}`)
            );
        }
    }

    return [file];
}
