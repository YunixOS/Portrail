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
                group.name,
                node,
                outputPath
            )
        );
    }

    return files;
}

function generatePortraitNode(
    groupName: string,
    resolvedNode: ResolvedNode,
    outputPath: string,
): ModFile[] {
    const isRootNode =
        resolvedNode.path.length === 1 &&
        resolvedNode.path[0] === groupName;

    const id = resolvedNode.path.join("_");

    if (!resolvedNode.node.portraits) {
        throw new Error(
            `Cannot generate portrait node "${id}" because it has no` + 
            "portraits or subnodes with portraits. This node currently" +
            "serves no purpose"
        );
    }

    if (resolvedNode.node.portraits.portraits.length < 1) {
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

    for (
        const [i, portrait] of
        resolvedNode.node.portraits.portraits.entries()
    ) {
        const portraitImport =
            portraitImports.addContainer(`${id}_${i}`);

        portraitImport.addClause(
            "texturefile",
            portrait
        );
    }

    const portraitGroups =
        file.addContainer("portrait_groups");

    const group =
        portraitGroups.addContainer(groupName);

    if (isRootNode) {
        group.addClause(
            "default",
            keyword(`${id}_0`)
        );
    }

    for (const resolvedScope of resolvedNode.scopes) {
        const scope = group.addContainer(
            resolvedScope.scope
        );

        const add = scope.addContainer("add");

        if (
            resolvedScope.positiveConditions.length > 0 ||
            resolvedScope.negativeConditions.length > 0
        ) {
            const trigger = add.addContainer("trigger");

            for (const condition of resolvedScope.positiveConditions) {
                trigger.add(condition);
            }

            if (resolvedScope.negativeConditions.length > 0) {
                const nor = trigger.addContainer("NOR");

                for (
                    const condition of
                    resolvedScope.negativeConditions
                ) {
                    nor.add(condition);
                }
            }
        }

        const portraits = add.addContainer("portraits");

        for (
            const [i] of
            resolvedNode.node.portraits.portraits.entries()
        ) {
            portraits.addUnit(keyword(`${id}_${i}`));
        }
    }

    return [file];
}
