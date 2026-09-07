import { readdirSync } from "fs";
import path from "node:path";
import { PortraitDirectory } from "./portrait-directory";

export default class PortraitLoader {
    static loadPortraits(
        root: string,
        dir: string
    ): PortraitDirectory {
        const name = path.basename(dir);
        const relativePath = path.relative(root, dir);
        const dirEntries = readdirSync(dir, {
            withFileTypes: true
        });
        
        const portraits: string[] = [];
        const children: PortraitDirectory[] = [];

        for (const entry of dirEntries) {
            if (entry.isFile()) {
                if (path.extname(entry.name).toLowerCase() === ".dds") {
                    portraits.push(
                        path.posix.join(
                            "gfx/models/portraits",
                            relativePath,
                            entry.name
                        )
                    );
                }

                continue;
            }

            if (entry.isDirectory()) {
                const childPath = path.join(
                    dir,
                    entry.name
                );

                children.push(this.loadPortraits(
                    root,
                    childPath
                ));
            }
        }

        return new PortraitDirectory(
            name,
            dir,
            portraits,
            children
        );
    }
}
