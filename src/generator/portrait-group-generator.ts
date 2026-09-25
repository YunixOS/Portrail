import {
    ModFile,
    keyword
} from "@yunixos/paradoxical";

import { PortraitGroup } from "../portrait-group";
import { ConditionResolver, ResolvedNode } from "./condition-resolver";

export class PortraitGroupGenerator {
    static generate(group: PortraitGroup, outputPath: string): ModFile[] {
        const resolvedNodes = ConditionResolver.resolve(group.defaultNode);
        
        const files: ModFile[] = [];
        for (const node of resolvedNodes) {
            files.push(
                ...this.generatePortraitNode(
                    group.name,
                    node,
                    outputPath
                )
            );
        }
        
        return files;
    }

    private static generatePortraitNode(
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
                `Cannot generate portrait node "${id}" because it has no portraits or subnodes with portraits. This node currently serves no purpose`
            );
        }
        
        const files: ModFile[] = [];
                
        if(resolvedNode.node.portraits.portraits.length < 1) {
            console.warn(`Portrait node "${id}" has no portraits: skipping generation`);
            return files;
        }
        
        const file = new ModFile(
            outputPath,
            `${id}.txt`
        );

        const portraitImports = file.addContainer("portraits");          
        for (const [i, portrait] of resolvedNode.node.portraits.portraits.entries()) {
            const portraitImport = portraitImports.addContainer(`${id}_${i}`);
            portraitImport.addClause("texturefile", portrait);
        }

        const portraitGroups = file.addContainer("portrait_groups");

        const group = portraitGroups.addContainer(groupName);
        
        if (isRootNode) {
            group.addClause("default", keyword(`${id}_0`));
        }

        for (const scopeEntity of resolvedNode.node.scopes) {
            const scope = group.addContainer(scopeEntity.scope);
            const add = scope.addContainer("add");
            
            if(
                resolvedNode.positiveConditions.length > 0
                || resolvedNode.negativeConditions.length > 0
            ) {
                const trigger = add.addContainer("trigger");
                for (const condition of resolvedNode.positiveConditions) {
                    trigger.add(condition);
                }
                
                if (resolvedNode.negativeConditions.length > 0) {
                    const nor = trigger.addContainer("NOR");
                    for (const condition of resolvedNode.negativeConditions) {
                        nor.add(condition);
                    }
                } 
            }
            
            const portraits = add.addContainer("portraits");

            for (const [i] of resolvedNode.node.portraits.portraits.entries()) {
                portraits.addUnit(`${id}_${i}`);
            }
        }
        
        files.push(file);

        return files;
    }
}
