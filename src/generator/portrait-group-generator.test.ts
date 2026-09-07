import { PortraitGroup } from "../portrait-group";
import { PortraitGroupGenerator } from "./portrait-group-generator";
import { PortraitDirectory } from "../filesystem/portrait-directory";

describe("PortraitGroupGenerator", () => {
    it("generates a file for a portrait node", () => {
        const group = new PortraitGroup(
            "./mod/gfx/models/portraits",
            "default"
        );

        const node = group.addNode("cyborg");

        node.usePortraits(
            new PortraitDirectory(
                "cyborg",
                "./mod/gfx/models/portraits/default/cyborg",
                [
                    "gfx/models/portraits/default/cyborg/1.dds",
                    "gfx/models/portraits/default/cyborg/2.dds"
                ]
            )
        );

        node.addScope("game_setup");

        const files = PortraitGroupGenerator.generate(
            group,
            "./output"
        );

        expect(files).toHaveLength(1);
    });
});
