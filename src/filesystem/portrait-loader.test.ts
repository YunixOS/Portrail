import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import PortraitLoader from "./portrait-loader";

describe("PortraitLoader", () => {
    let modPath: string;

    beforeEach(() => {
        modPath = fs.mkdtempSync(
            path.join(os.tmpdir(), "portrait-loader-test")
        );

        fs.mkdirSync(
            path.join(
                modPath,
                "gfx",
                "models",
                "portraits",
                "default",
                "scientist"
            ),
            { recursive: true }
        );

        fs.mkdirSync(
            path.join(
                modPath,
                "gfx",
                "models",
                "portraits",
                "cyborg"
            ),
            { recursive: true }
        );

        fs.writeFileSync(
            path.join(
                modPath,
                "gfx",
                "models",
                "portraits",
                "default",
                "1.dds"
            ),
            ""
        );

        fs.writeFileSync(
            path.join(
                modPath,
                "gfx",
                "models",
                "portraits",
                "default",
                "scientist",
                "1.dds"
            ),
            ""
        );

        fs.writeFileSync(
            path.join(
                modPath,
                "gfx",
                "models",
                "portraits",
                "default",
                "scientist",
                "2.dds"
            ),
            ""
        );

        fs.writeFileSync(
            path.join(
                modPath,
                "gfx",
                "models",
                "portraits",
                "cyborg",
                "1.dds"
            ),
            ""
        );
    });

    afterEach(() => {
        fs.rmSync(modPath, { recursive: true, force: true });
    });

    it("loads the portrait directory tree", () => {
        const root = path.join(
            modPath,
            "gfx",
            "models",
            "portraits"
        );
        
        const directory = PortraitLoader.loadPortraits(
            root,
            root
        );

        expect(directory.children).toHaveLength(2);

        const defaultDirectory = directory.children.find(
            child => child.name === "default"
        );

        expect(defaultDirectory).toBeDefined();
        
        const defaultScientistDirectory = defaultDirectory!.children.find(
            child => child.name === "scientist"
        );
        
        expect(defaultScientistDirectory).toBeDefined();

        const cyborgDirectory = directory.children.find(
            child => child.name === "cyborg"
        );

        expect(cyborgDirectory).toBeDefined();
    });
});
