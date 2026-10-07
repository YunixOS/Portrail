import { PortraitGroup } from "../portrait-group";
import { generate } from "./node-file-generator";
import { PortraitDirectory } from "../filesystem/portrait-directory";
import { PortraitNode } from "../portrait-node";

describe("generate()", () => {
    it("generates a file for a portrait node", () => { 
        const node = new PortraitNode("human");
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
});
