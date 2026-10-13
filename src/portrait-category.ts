import generate from "./generator/category-file-generator";
import { PortraitSet } from "./portrait-set";

/**
 * Represents a portrait category. A portrait category is a
 * category of {@link PortraitSet | portrait sets} used in the empire design view.
 */

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
    
    /**
    * Write the category file to a specified directory.
    *
    * @param path - Path of directory where the file is to be written.
    */
    writeFile(path: string) {
        const file = generate(this, path);
        
        file.write();
        console.log(
            "Category write completed: " +
            this.id
        )
    }
}
