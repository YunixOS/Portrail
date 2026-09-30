import generate from "./generator/set-file-generator";
import { PortraitGroup } from "./portrait-group";

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
 
    writeFile(path: string) {
        const file = generate(this, path);
        
        file.write();
        console.log(
            "Portrait set write completed: " +
            this.id
        )
    }
}
