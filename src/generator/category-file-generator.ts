import {
    ModFile,
    keyword
} from "@yunixos/paradoxical";

import { PortraitCategory } from "../portrait-category";

export default function generate(category: PortraitCategory, path: string): ModFile {
    const categoryFile = new ModFile(path, `${category.id}.txt`);
    
    const categoryContainer = categoryFile.addContainer(category.id);
    categoryContainer.addClause("name", category.name);
    
    const sets = categoryContainer.addContainer("sets");
    
    category.portraitSets.forEach((set) => {
        sets.addUnit(keyword(set.id));
    });
    
    return categoryFile;
}
