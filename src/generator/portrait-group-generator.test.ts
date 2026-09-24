import { PortraitGroup } from "../portrait-group";
import { PortraitGroupGenerator } from "./portrait-group-generator";
import { PortraitDirectory } from "../filesystem/portrait-directory";
import { PortraitNode } from "../portrait-node";

describe("PortraitGroupGenerator", () => {
    it("generates a file for a portrait node", () => {
        const group = new PortraitGroup(
            "./mod/gfx/models/portraits",
            "default"
        );

        group.defaultNode.usePortraits(
            new PortraitDirectory(
                "default",
                "./mod/gfx/models/portraits/default",
                [
                    "gfx/models/portraits/default/1.dds",
                    "gfx/models/portraits/default/2.dds"
                ]
            )
        );

        group.defaultNode.addScope("game_setup");

        const files = PortraitGroupGenerator.generate(
            group,
            "./output"
        );

        expect(files).toHaveLength(1);
    });

    it("throws when a node has no portraits", () => {
        const group = new PortraitGroup(
            "./mod/gfx/models/portraits",
            "default"
        );

        const node = new PortraitNode("cyborg");

        group.defaultNode.children.push(node);

        expect(() => {
            PortraitGroupGenerator.generate(
                group,
                "./output"
            );
        }).toThrow();
    });
});
