import { ModFile } from "@yunixos/paradoxical";
import { PortraitDirectory } from "./filesystem/portrait-directory";
import PortraitLoader from "./filesystem/portrait-loader";
import { PortraitGroupGenerator } from "./generator/portrait-group-generator";
import { PortraitNode } from "./portrait-node";
import path from "node:path"

/**
 * Represents a portrait group.
 */
export class PortraitGroup {
    name: string;
    dir: string; 
    private portraitDirectory?: PortraitDirectory;

    /**
     * @param path - The path for the portrait group relative to the root ("gfx/models/portraits") directory.
     * @example
     * ```ts
     * const portraitGroup = new PortraitGroup("pg/testgroup");
     */
    constructor(
        public readonly root: string,
        public readonly relativePath: string,
        private _defaultNode?: PortraitNode
    ) {
        this.name = this.relativePath.toLowerCase().replace(/ /g, "_");
        
        this.dir = path.join(
            this.root,
            this.relativePath
        )
    }
    
    get defaultNode(): PortraitNode {
        if (!this._defaultNode) {
            throw new Error(
                "Portrait nodes have not been constructed. " +
                "Call constructNodes() first."
            );
        }

        return this._defaultNode;
    }

    constructNodes(): void {
        this.portraitDirectory = PortraitLoader.loadPortraits(
            this.root,
            this.dir
        );
        
        this._defaultNode = this.createNodeTree(this.portraitDirectory);
    }
    
    private createNodeTree(
        directory: PortraitDirectory
    ): PortraitNode {
        const node = new PortraitNode(directory.name);

        node.usePortraits(directory);

        for (const childDirectory of directory.children) {
            node.children.push(
                this.createNodeTree(childDirectory)
            );
        }

        return node;
    }
    
    node(nodePath: string): PortraitNode {
        const parts = nodePath
            .split("/")
            .filter(part => part.length > 0);

        if (parts.length === 0) {
            throw new Error("Portrait node path cannot be empty.");
        }

        let children = this.defaultNode.children;
        let currentNode: PortraitNode | undefined;

        for (const part of parts) {
            currentNode = children.find(
                node => node.name === part
            );

            if (!currentNode) {
                throw new Error(
                    `No portrait node found at "${nodePath}".`
                );
            }

            children = currentNode.children;
        }

        return currentNode!;
    }
    
    getModFiles(modPath: string): ModFile[] {
        const files = PortraitGroupGenerator.generate(
            this, 
            path.join(
                modPath,
                "gfx",
                "portraits",
                "portraits"
            )
        );
        
        return files;
    }
    
    writeFiles(modPath: string): void {
        const modFiles = this.getModFiles(modPath);
        
        for (const file of modFiles) {
            file.write()
        }
    }
}
