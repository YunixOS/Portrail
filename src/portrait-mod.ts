import { PortraitCategory } from "./portrait-category";
import { PortraitGroup } from "./portrait-group";
import path from "node:path";
import { PortraitSet } from "./portrait-set";

/**
 * Represents a portrait mod. The portrait mod can contain {@link PortraitCategory | categories},
 * {@link PortraitSet | sets}, and {@link PortraitGroup | groups} of portraits.
*
* A portrait mod is assigned to a chosen directory within the filesystem that
* its contents will be written to.
*
* The portrait mod directory should already have a `gfx/models/portraits`
* directory populated with `.dds` files. The files should be nested and structured
* according to the desired arrangement of {@link PortraitGroup | portrait groups}
* and {@link PortraitNode | portrait nodes}.
*
* @example
* ```ts
* const mod = new PortraitMod(
*     "/path/to/mod"
* );
*
* mod.createPortraitCategory(
*     "my_category",
*     "My Category"
* );
*
* mod.write();
* ```
*/
export class PortraitMod {
    /**
    * The portrait models directory of the mod.
    * Generated automatically from {@link dir}.
    */
    readonly portraitDir: string
    
    /**
    * The portrait_categories directory of the mod.
    * Generated automatically from {@link dir}.
    */
    readonly categoryDir: string
    
    /**
    * The portrait_sets directory of the mod.
    * Generated automatically from {@link dir}.
    */
    readonly setDir: string

    /**
    * Creates a portrait mod.
    *
    * @param dir - The mods root directory. Can be absolute or relative.
    */
    constructor(
        public readonly dir: string
    ) {
        this.portraitDir = path.join(
            this.dir,
            "gfx",
            "models",
            "portraits"
        );
        
        this.categoryDir = path.join(
            this.dir,
            "common",
            "portrait_categories"
        );
        
        this.setDir = path.join(
            this.dir,
            "common",
            "portrait_sets"
        );
    }

    /**
     * All of the mods {@link PortraitCategory | portrait categories}
     */
    portraitCategories: PortraitCategory[] = [];
    
    createPortraitCategory(id: string, name: string) {
        const portraitCategory = new PortraitCategory(id, name);
        
        this.portraitCategories.push(portraitCategory);

        return portraitCategory;
    }
    
    /**
     * All of the mods {@link PortraitSet | portrait sets}
     */
    portraitSets: PortraitSet[] = [];
    
    createPortraitSet(id: string, speciesClass: string) {
        const portraitSet = new PortraitSet(id, speciesClass);
        
        this.portraitSets.push(portraitSet);
        
        return portraitSet;
    }

    /**
     * All of the mods {@link PortraitGroup | portrait groups}
     */
    portraitGroups: PortraitGroup[] = [];
    
    /**
     * Creates a new {@link PortraitGroup} for the mod. This also runs
     * {@link PortraitGroup#constructNodes | constructNodes}, removing
     * the need to run said method after.
     *
     * @param relativePath - Path of the portrait group relative to
     * {@link portraitDir}.
     *
     * @param defaultPortrait - Path of the portrait to be set as the
     * {@link PortraitGroup#defaultPortrait | default portrait} (used
     * notably as an icon for the group in areas of the game such as
     * empire creation). Must be relative to the root directory of the
     * mod and the file must be stored within the
     * gfx/models/portraits directory, and the file path must feature the
     * `.dds` extension.
     *
     * @example
     * ```ts
     * mod.createPortraitGroup(
     *   "groups/portraitgroup",
     *   "gfx/models/portraits/default_portrait.dds"
     * );
     * ```
     */
    createPortraitGroup(relativePath: string, defaultPortrait?: string): PortraitGroup {
        const portraitGroup = new PortraitGroup(this.portraitDir, relativePath);
        
        if (defaultPortrait) {
            portraitGroup.setDefaultPortrait(defaultPortrait);
        } 
        
        portraitGroup.constructNodes(); 
        
        this.portraitGroups.push(portraitGroup); 
        
        return portraitGroup;
    }
    
    /**
    * Creates multiple {@link PortraitGroup | portrait groups}.
    *
    * @param relativePaths - Array of paths for portrait groups relative to
    * {@link portraitDir}.
    *
    * @example
    * ```ts
    * mod.createPortraitGroups(
    *   "groups/group1",
    *   "groups/group2",
    *   "groups/group3",
    *   "othergroup"
    * );
    * ```
    */
    createPortraitGroups(relativePaths: string[]): PortraitGroup[] {
        return relativePaths.map(
            relativePath => this.createPortraitGroup(relativePath)
        );
    }
    
    /**
    * Writes all files for the mod.
    */
    write(): void {
        this.portraitCategories.forEach((category) => {
            category.writeFile(this.categoryDir);
        });
        
        this.portraitSets.forEach((set) => {
            set.writeFile(this.setDir);
        });
        
        this.portraitGroups.forEach((group) => {
            group.writeFiles(this.dir);
        });
    }
}
