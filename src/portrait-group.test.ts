import { jest } from "@jest/globals";
import { PortraitDirectory } from "./filesystem/portrait-directory";
import { PortraitGroup } from "./portrait-group";
import PortraitLoader from "./filesystem/portrait-loader";

jest.mock("./filesystem/portrait-loader", () => ({
    PortraitLoader: {
        loadPortraits: jest.fn()
    }
}));

describe("PortraitGroup", () => {
    it("Has name", () => {
        const portraitGroup = new PortraitGroup("mod/path", "yui_default");

        expect(portraitGroup.name).toBe("yui_default");
    });

    describe("addNode", () => {
        it("Adds child node", () => {
            const portraitGroup = new PortraitGroup("mod/path", "yui_default");
            const childNode = portraitGroup.addNode("Default");

            expect(portraitGroup.children[0]).toBe(childNode);
        });

        it("adds a node to the group", () => {
            const group = new PortraitGroup("mod/path", "Yui Portraits");

            const node = group.addNode("Default");

            expect(group.children).toContain(node);
        });
    });

    it("attaches portrait directories to nodes", () => {
        const directory = new PortraitDirectory(
            "yui_portraits",
            "full/portrait/path",
            [],
            [
                new PortraitDirectory(
                    "default",
                    "full/portrait/path",
                    ["gfx/models/portraits/default/1.dds"],
                    [
                        new PortraitDirectory(
                            "scientist",
                            "full/portrait/path",
                            ["gfx/models/portraits/default/scientist/1.dds"]
                        )
                    ]
                )
            ]
        );

        jest.spyOn(PortraitLoader, "loadPortraits")
            .mockReturnValue(directory);

        const group = new PortraitGroup("mod/path", "Yui Portraits");
        const node = group.addNode("Default");
        const subnode = node.addNode("Scientist");

        group.getPortraits();
        group.attachPortraits();

        expect(node.portraits).toBe(directory.children[0]);
        expect(subnode.portraits).toBe(directory.children[0].children[0]);
    });
});
