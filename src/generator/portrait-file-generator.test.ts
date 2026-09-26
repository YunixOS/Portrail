import { PortraitGroup } from "../portrait-group";
import { generate } from "./portrait-file-generator";
import { PortraitDirectory } from "../filesystem/portrait-directory";
import { PortraitNode } from "../portrait-node";

describe("generate()", () => {
    it("generates a file for a portrait node", () => { 
        const node = new PortraitNode("cyborg");
        node.usePortraits(
            new PortraitDirectory(
                "default",
                "./mod/gfx/models/portraits/default",
                [
                    "gfx/models/portraits/default/1.dds",
                    "gfx/models/portraits/default/2.dds"
                ]
            )
        );
        
        const group = new PortraitGroup(
            "./mod/gfx/models/portraits",
            "default",
            node
        );

        group.defaultNode.addScope("game_setup");

        const files = generate(
            group,
            "./output"
        );

        expect(files).toHaveLength(1);
    });

    it("throws when a node has no portraits", () => {
        

        const node = new PortraitNode("cyborg");
        
        const group = new PortraitGroup(
            "./mod/gfx/models/portraits",
            "default",
            node
        );

        expect(() => {
            generate(
                group,
                "./output"
            );
        }).toThrow();
    });
});
