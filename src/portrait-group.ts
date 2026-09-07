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
    children: PortraitNode[] = [];
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
        public readonly relativePath: string
    ) {
        this.name = this.relativePath.toLowerCase().replace(/ /g, "_");
        this.dir = path.join(
            this.root,
            this.relativePath
        )
    }

    /**
     * Adds a new {@link PortraitNode} to the {@link PortraitGroup}
     * @param name - The name of the node.
     * @example
     * ```ts
     * const default = portraitGroup.addNode("default");
     */
    addNode(name: string): PortraitNode {
        const node = new PortraitNode(name.toLowerCase().replace(/ /g,"_"));
        this.children.push(node);
        return node;
    }

    /**
     * Sets the portrait directory of the group to the one containing its portraits.
     * @example - Get all portraits for the group in /gfx/models/portraits/path
     * ```ts
     * const portraitGroup = new portraitGroup("path");
     * portraitGroup.getPortraits();
     */
    getPortraits(): void {
        this.portraitDirectory = PortraitLoader.loadPortraits(
            this.root,
            this.dir
        );
    }

    /**
     * Automatically handles attachment of group portraits to a {@link PortraitNode}
     * by pairing each node with a ${@link PortraitDirectory} with a matching path.
     */
    attachPortraits(): void {
        if (!this.portraitDirectory) {
            throw new Error(
                "Portraits must be loaded before attaching them."
            );
        }

        for (const node of this.children) {
            const directory = this.portraitDirectory.children.find(
                dir => dir.name === node.name
            );

            if (!directory) {
                throw new Error(
                    `No portrait directory found for node "${node.name}".`
                );
            }

            this.attachNode(node, directory);
        }
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

    private attachNode(
        node: PortraitNode,
        directory: PortraitDirectory
    ): void {
        node.usePortraits(directory);

        for (const child of node.children) {
            const childDirectory = directory.children.find(
                directory => directory.name === child.name
            );

            if (!childDirectory) {
                throw new Error(
                    `No portrait directory found for node "${child.name}".`
                );
            }

            this.attachNode(child, childDirectory);
        }
    }
}
