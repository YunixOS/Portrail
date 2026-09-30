import { PortraitCategory } from "./portrait-category";
import { PortraitGroup } from "./portrait-group";
import path from "node:path";
import { PortraitSet } from "./portrait-set";

export class PortraitMod {
    portraitDir: string
    categoryDir: string
    setDir: string

    constructor(
        public readonly dir: string
    ) {
        this.portraitDir = path.join(
            this.dir,
            "gfx",
            "models",
            "portraits"
        )
        
        this.categoryDir = path.join(
            this.dir,
            "common",
            "portrait_categories"
        )
        
        this.setDir = path.join(
            this.dir,
            "common",
            "portrait_sets"
        )
    }

    portraitCategories: PortraitCategory[] = [];
    
    createPortraitCategory(id: string, name: string) {
        const portraitCategory = new PortraitCategory(id, name);
        
        this.portraitCategories.push(portraitCategory);

        return portraitCategory;
    }
    
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
