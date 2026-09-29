import {
    ModFile,
    keyword
} from "@yunixos/paradoxical";

import { PortraitSet } from "../portrait-set";

export default function generate(set: PortraitSet, path: string): ModFile { 
    const setFile = new ModFile(path, set.id);
    
    const setContainer = setFile.addContainer(set.id);
    setContainer.addClause("species_class", keyword(set.speciesClass));
    
    const portraits = setContainer.addContainer("portraits");
    
    set.portraitGroups.forEach((group) => {
        portraits.addUnit(group.name);
    });
    
    return setFile;
}
