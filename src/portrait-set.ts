import generate from "./generator/set-file-generator";
import { PortraitGroup } from "./portrait-group";

/**
 * Represents a portrait set. A portrait set is a
 * set of portraits associated with a species class.
 *
 * They can be grouped into
 * {@link PortraitCategory | portrait categories}.
 */

export class PortraitSet {
    constructor(
        public readonly id: string,
        public readonly speciesClass: string
    ) {}
    
    portraitGroups: PortraitGroup[] = [];

    addPortraitGroup(portraitGroup: PortraitGroup) {
        this.portraitGroups.push(portraitGroup);

        return portraitGroup;
    }
    
    addPortraitGroups(portraitGroups: PortraitGroup[]) {
        this.portraitGroups.push(...portraitGroups);

        return portraitGroups;
    }
 
    /**
    * Write the set file to a specified directory.
    *
    * @param path - Path of directory where the file is to be written.
    */
    writeFile(path: string) {
        const file = generate(this, path);
        
        file.write();
        console.log(
            "Portrait set write completed: " +
            this.id
        )
    }
}
