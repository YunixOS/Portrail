import { PortraitCategory } from "./portrait-category";
import { PortraitGroup } from "./portrait-group";
import path from "node:path";
import { PortraitSet } from "./portrait-set";

/**
* Represents a portrait mod. The portrait mod can contain categories,
* sets, and groups of portraits.
*
* A portrait mod is assigned to a chosen directory within the filesystem that
* its contents will be written to.
*
* The portrait mod directory should already have a `gfx/models/portraits`
* directory populated with dds files. The files should be nested and structured
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

    portraitGroups: PortraitGroup[] = [];
    
    createPortraitGroup(relativePath: string, defaultPortrait?: string): PortraitGroup {
        const portraitGroup = new PortraitGroup(this.portraitDir, relativePath);
        
        if (defaultPortrait) {
            portraitGroup.setDefaultPortrait(defaultPortrait);
        } 
        
        portraitGroup.constructNodes(); 
        
        this.portraitGroups.push(portraitGroup); 
        
        return portraitGroup;
    }
    
    createPortraitGroups(relativePaths: string[]): PortraitGroup[] {
        return relativePaths.map(
            relativePath => this.createPortraitGroup(relativePath)
        );
    }
    
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
