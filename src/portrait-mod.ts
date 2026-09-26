import { PortraitGroup } from "./portrait-group";
import path from "node:path";

export class PortraitMod {
    portraitDir: string

    constructor(
        public readonly dir: string
    ) {
        this.portraitDir = path.join(
            this.dir,
            "gfx",
            "models",
            "portraits"
        )
    }

    portraitGroups: PortraitGroup[] = [];

    addPortraitGroup(path: string): PortraitGroup {
        const portraitGroup = new PortraitGroup(this.portraitDir, path);
        
        portraitGroup.constructNodes(); 
        
        this.portraitGroups.push(portraitGroup); 
        
        return portraitGroup;
    }
    
    write(): void {
        this.portraitGroups.forEach((group) => {
            group.writeFiles(this.dir);
        });
    }
}
