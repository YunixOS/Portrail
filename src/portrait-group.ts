import { ModFile } from "@yunixos/paradoxical";
import { PortraitDirectory } from "./filesystem/portrait-directory";
import PortraitLoader from "./filesystem/portrait-loader";
import { generate } from "./generator/portrait-file-generator";
import { PortraitNode } from "./portrait-node";
import path from "node:path"

/**
 * Represents a group of portraits and their hierarchical configuration.
 *
 * A portrait group corresponds to a directory within the mod's
 * `gfx/models/portraits` directory. Portraits and their child nodes can be
 * loaded automatically from the filesystem using {@link constructNodes}.
 *
 * The root node of the group is available through {@link defaultNode}.
 * Individual child nodes can be accessed using {@link node}.
 *
 * @example
 * ```ts
 * const group = new PortraitGroup(
 *     "/path/to/mod/gfx/models/portraits",
 *     "humanoid"
 * );
 *
 * group.constructNodes();
 *
 * group.node("cool")
 *     .addConditionClause("has_trait", "trait_cool");
 * ```
 */
export class PortraitGroup {
    /**
     * The name used to identify the portrait group in generated files.
     *
     * The name is derived from {@link relativePath} by taking the basename,
     * converting it to lowercase and replacing spaces with underscores.
     */
    name: string;

    /**
     * The absolute filesystem path to the directory containing this
     * portrait group.
     */
    dir: string; 

    private portraitDirectory?: PortraitDirectory;

    /**
     * Creates a portrait group.
     *
     * @param absolutePortraitsDir - The absolute path to the mod's
     * `gfx/models/portraits` directory.
     *
     * @param relativePath - The path to this portrait group relative to
     * {@link absolutePortraitsDir}.
     *
     * @param _defaultNode - An optional pre-constructed root node for the
     * portrait group. This can be useful when constructing a portrait tree
     * programmatically rather than from the filesystem.
     *
     * @example
     * ```ts
     * const group = new PortraitGroup(
     *     "/path/to/mod/gfx/models/portraits",
     *     "humanoid"
     * );
     * ```
     */
    constructor(
        public readonly absolutePortraitsDir: string,
        public readonly relativePath: string,
        private _defaultNode?: PortraitNode
    ) {
        this.name = path.basename(this.relativePath)
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "_");
        
        this.dir = path.join(
            this.absolutePortraitsDir,
            this.relativePath
        )
    }
    
    /**
     * Gets the root node of the portrait group (if it has been constructed).
     * @see {@link constructNodes}
     */
    get defaultNode(): PortraitNode {
        if (!this._defaultNode) {
            throw new Error(
                "Portrait nodes have not been constructed. " +
                "Call constructNodes() first."
            );
        }

        return this._defaultNode;
    }

    /**
     * Loads the portrait directory and constructs the corresponding
     * {@link PortraitNode} tree.
     *
     * The resulting tree mirrors the directory structure beneath the
     * portrait group's directory. `.dds` files are associated with the
     * corresponding nodes as portraits.
     *
     * This method must be called before accessing {@link defaultNode} or
     * using {@link node}.
     */
    constructNodes(): void {
        this.portraitDirectory = PortraitLoader.loadPortraits(
            this.absolutePortraitsDir,
            this.dir
        );
        
        this._defaultNode = this.mirrorNodeTree(this.portraitDirectory);
    }
    
    /**
     * Recursively converts a {@link PortraitDirectory} tree into a
     * {@link PortraitNode} tree.
     *
     * @param directory - The directory to convert.
     * @returns The root node corresponding to the supplied directory.
     */
    private mirrorNodeTree(
        directory: PortraitDirectory
    ): PortraitNode {
        const node = new PortraitNode(directory.name);

        node.usePortraits(directory);

        for (const childDirectory of directory.children) {
            node.children.push(
                this.mirrorNodeTree(childDirectory)
            );
        }

        return node;
    }
    
    /**
     * Retrieves a portrait node using its path within the portrait group.
     *
     * Paths use `/` as the separator and are relative to the group's root
     * node.
     *
     * @param nodePath - The path of the node relative to the group root.
     * @returns The portrait node at the specified path.
     *
     * @example
     * ```ts
     * group.constructNodes();
     *
     * const commander = group.node(
     *     "leaders/commander"
     * );
     * ```
     */
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
    
    /**
     * Creates a Paradoxical ModFile object for each {@link PortraitNode} in the group.
     *
     * @param modPath - The root path of the mod to generate files for.
     * @returns The generated mod files.
     *
     * @throws {Error} If the portrait node tree has not been constructed.
     */
    getModFiles(modPath: string): ModFile[] {
        const files = generate(
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
    
    /**
     * Generates and writes the mod files for this portrait group.
     *
     * @param modPath - The root path of the mod to write files to.
     *
     * @example
     * ```ts
     * group.constructNodes();
     * group.writeFiles("/path/to/mod");
     * ```
     */
    writeFiles(modPath: string): void {
        const modFiles = this.getModFiles(modPath);
        
        for (const file of modFiles) {
            file.write()
        }
    }
}
