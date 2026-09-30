import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PortraitGroup } from "../src/portrait-group";

describe("PortraitGroup", () => {
    let root: string;

    beforeEach(() => {
        root = fs.mkdtempSync(
            path.join(os.tmpdir(), "portrail-")
        );

        fs.mkdirSync(
            path.join(
                root,
                "default",
                "cyborg",
                "leaders",
                "commander"
            ),
            { recursive: true }
        );

        fs.mkdirSync(
            path.join(
                root,
                "default",
                "cyborg",
                "leaders",
                "scientist"
            ),
            { recursive: true }
        );

        fs.mkdirSync(
            path.join(
                root,
                "default",
                "mechanical"
            ),
            { recursive: true }
        );

        fs.writeFileSync(
            path.join(root, "default", "cyborg", "1.dds"),
            ""
        );

        fs.writeFileSync(
            path.join(
                root,
                "default",
                "cyborg",
                "leaders",
                "commander",
                "1.dds"
            ),
            ""
        );

        fs.writeFileSync(
            path.join(
                root,
                "default",
                "cyborg",
                "leaders",
                "scientist",
                "1.dds"
            ),
            ""
        );

        fs.writeFileSync(
            path.join(
                root,
                "default",
                "mechanical",
                "1.dds"
            ),
            ""
        );
    });

    afterEach(() => {
        fs.rmSync(root, {
            recursive: true,
            force: true
        });
    });
    
    describe("init", () => {
        it("replaces spaces in name with underscores", () => {
            const group = new PortraitGroup(
                root,
                "default group"
            );
            
            expect(group.name).toBe("default_group");
        });
    });

    describe("construction", () => {
        it("builds the node tree from the portrait directory", () => {
            const group = new PortraitGroup(
                root,
                "default"
            );
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            expect(
                group.defaultNode.children.map(node => node.name).sort()
            ).toEqual([
                "cyborg",
                "mechanical"
            ]);
        });

        it("builds nested nodes recursively", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            const cyborg = group.node("cyborg");
            const leaders = group.node("cyborg/leaders");
            const commander = group.node(
                "cyborg/leaders/commander"
            );

            expect(cyborg.name).toBe("cyborg");
            expect(leaders.name).toBe("leaders");
            expect(commander.name).toBe("commander");
        });

        it("creates the expected node hierarchy", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            expect(group.defaultNode.children).toHaveLength(2);

            const cyborg = group.node("cyborg");

            expect(cyborg.children).toHaveLength(1);
            expect(cyborg.children[0].name).toBe("leaders");

            const leaders = group.node("cyborg/leaders");

            expect(
                leaders.children.map(node => node.name).sort()
            ).toEqual([
                "commander",
                "scientist"
            ]);
        });

        it("attaches portrait directories to nodes", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            const cyborg = group.node("cyborg");
            const mechanical = group.node("mechanical");
            const commander = group.node(
                "cyborg/leaders/commander"
            );

            expect(cyborg.portraits?.portraits).toHaveLength(1);
            expect(mechanical.portraits?.portraits).toHaveLength(1);
            expect(commander.portraits?.portraits).toHaveLength(1);
        });
    });
        
    describe("node()", () => {
        it("finds a top-level node", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            const node = group.node("cyborg");

            expect(node.name).toBe("cyborg");
        });
        
        it("finds nested nodes", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            const node = group.node(
                "cyborg/leaders/commander"
            );

            expect(node.name).toBe("commander");
        });
        
        it("ignores empty path components", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            expect(
                group.node("/cyborg/leaders/")
            ).toBe(
                group.node("cyborg/leaders")
            );
        });
        
        it("throws when a node does not exist", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");

            expect(() =>
                group.node("cyborg/unknown")
            ).toThrow();
        });
        
        it("throws when given an empty path", () => {
            const group = new PortraitGroup(root, "default");
            
            group.setDefaultPortrait("gfx/models/portraits/default.dds");
            
            group.constructNodes();

            expect(() =>
                group.node("")
            ).toThrow(
                "Portrait node path cannot be empty."
            );
        });
    });
});
