import generate from "./generator/category-file-generator";
import { PortraitSet } from "./portrait-set";

export class PortraitCategory {
    constructor(
        public readonly id: string,
        public readonly name: string
    ) {}

    portraitSets: PortraitSet[] = [];

    addPortraitSet(portraitSet: PortraitSet) {
        this.portraitSets.push(portraitSet);
        
        return portraitSet;
    }
    
    writeFile(path: string) {
        const file = generate(this, path);
        
        file.write();
        console.log(
            "Category write completed: " +
            this.id
        )
    }
}
