import {
    ModFile,
    keyword
} from "@yunixos/paradoxical";

import { PortraitGroup } from "../portrait-group";
import { PortraitNode } from "../portrait-node";
import { ConditionResolver } from "./condition-resolver";

export class PortraitGroupGenerator {
    static generate(group: PortraitGroup, outputPath: string): ModFile[] {
        const resolvedNodes = ConditionResolver.resolve(group.children);
        
        const files: ModFile[] = [];
        for (const node of group.children) {
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
        node: PortraitNode,
        outputPath: string,
        nodePath: string[] = []
    ): ModFile[] {
        if(nodePath[0] !== groupName) {
            nodePath.unshift(groupName);
        } 
        
        const currentPath = [...nodePath, node.name];
        const id = currentPath.join("_");
        if (!node.portraits) {
            throw new Error(
                `Cannot generate portrait node "${id}" because it has no portraits or subnodes with portraits. This node currently serves no purpose`
            );
        }
        
        const files: ModFile[] = [];    
        
        for (const child of node.children) {
            files.push( 
                ...this.generatePortraitNode(
                    groupName,
                    child, 
                    outputPath,
                    currentPath
                )
            )
        }
                
        if(node.portraits.portraits.length < 1) {
            console.warn(`Portrait node "${id}" has no portraits: skipping generation`);
            return files;
        }
        
        const file = new ModFile(
            outputPath,
            `${currentPath.join("_")}.txt`
        );

        const portraitImports = file.addContainer("portraits");          
        for (const [i, portrait] of node.portraits.portraits.entries()) {
            const portraitImport = portraitImports.addContainer(`${id}_${i}`);
            portraitImport.addClause("texturefile", portrait);
        }

        const portraitGroups = file.addContainer("portrait_groups");

        const group = portraitGroups.addContainer(groupName);

        group.addClause("default", keyword(`${id}_0`));

        for (const scopeEntity of node.scopes) {
            const scope = group.addContainer(scopeEntity.scope);
            const add = scope.addContainer("add");
            
            if(node.conditions.length > 0) {
                const trigger = add.addContainer("trigger");
                for (const condition of node.conditions) {
                    trigger.add(condition);
                }
            }
            
            const portraits = add.addContainer("portraits");

            for (const portrait in node.portraits.portraits) {
                portraits.addUnit(`${id}_${portrait}`);
            }
        }
        
        files.push(file);

        return files;
    }
}
