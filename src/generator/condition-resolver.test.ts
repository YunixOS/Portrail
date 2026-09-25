import { PortraitNode } from "../portrait-node";
import { ConditionResolver } from "./condition-resolver";

function createNode(
    name: string,
    ...traits: string[]
): PortraitNode {
    const node = new PortraitNode(name);

    for (const trait of traits) {
        node.addConditionClause(
            "has_trait",
            `trait_${trait}`
        );
    }

    return node;
}

function addChild(
    parent: PortraitNode,
    child: PortraitNode
): PortraitNode {
    parent.children.push(child);
    return child;
}

describe("ConditionResolver", () => {
    test("adds more specific conditions as negative conditions", () => {
        const scientist = createNode(
            "scientist",
            "scientist"
        );

        addChild(
            scientist,
            createNode("genius", "genius")
        );

        const resolved = ConditionResolver.resolve(scientist);

        expect(resolved).toHaveLength(2);

        const resolvedScientist = resolved.find(
            node => node.node === scientist
        );

        expect(resolvedScientist).toBeDefined();

        expect(
            resolvedScientist!.negativeConditions
        ).toHaveLength(1);

        expect(
            resolvedScientist!.negativeConditions[0]
        ).toEqual(
            expect.objectContaining({
                name: "has_trait",
                value: "trait_genius"
            })
        );
    });

    test("does not exclude nodes with identical condition sets", () => {
        const scientist = createNode(
            "scientist",
            "scientist"
        );

        const careless = createNode(
            "carefree",
            "carefree"
        );

        const lazy = createNode(
            "lazy",
            "carefree"
        );

        scientist.children.push(
            careless,
            lazy
        );

        const resolved = ConditionResolver.resolve(scientist);

        const resolvedCareless = resolved.find(
            node => node.node === careless
        );

        const resolvedLazy = resolved.find(
            node => node.node === lazy
        );

        expect(
            resolvedCareless!.negativeConditions
        ).toHaveLength(0);

        expect(
            resolvedLazy!.negativeConditions
        ).toHaveLength(0);
    });

    test("does not exclude incomparable condition sets", () => {
        const scientist = createNode(
            "scientist",
            "scientist"
        );

        const a = createNode(
            "a",
            "genius",
            "awesome"
        );

        const b = createNode(
            "b",
            "genius",
            "aggressive",
            "carefree"
        );

        scientist.children.push(a, b);

        const resolved = ConditionResolver.resolve(scientist);

        const resolvedA = resolved.find(
            node => node.node === a
        );

        const resolvedB = resolved.find(
            node => node.node === b
        );

        expect(
            resolvedA!.negativeConditions
        ).toHaveLength(0);

        expect(
            resolvedB!.negativeConditions
        ).toHaveLength(0);
    });

    test("only excludes additional conditions of a more specific node", () => {
        const scientist = createNode(
            "scientist",
            "scientist"
        );

        const a = createNode(
            "a",
            "genius",
            "cool"
        );

        const b = createNode(
            "b",
            "genius",
            "aggressive",
            "carefree"
        );

        const c = createNode(
            "c",
            "genius",
            "aggressive"
        );

        scientist.children.push(a, b, c);

        const resolved = ConditionResolver.resolve(scientist);

        const resolvedScientist = resolved.find(
            node => node.node === scientist
        );

        const resolvedA = resolved.find(
            node => node.node === a
        );

        const resolvedB = resolved.find(
            node => node.node === b
        );

        const resolvedC = resolved.find(
            node => node.node === c
        );

        expect(
            resolvedScientist!.negativeConditions
        ).toHaveLength(3);

        expect(
            resolvedA!.negativeConditions
        ).toHaveLength(0);

        expect(
            resolvedB!.negativeConditions
        ).toHaveLength(0);

        expect(
            resolvedC!.negativeConditions
        ).toHaveLength(1);

        expect(
            resolvedC!.negativeConditions[0]
        ).toEqual(
            expect.objectContaining({
                name: "has_trait",
                value: "trait_carefree"
            })
        );
    });

    test("groups negative conditions for the same node", () => {
        const scientist = createNode(
            "scientist",
            "scientist"
        );

        scientist.children.push(
            createNode(
                "a",
                "genius",
                "cool"
            )
        );

        const resolved = ConditionResolver.resolve(scientist);

        const resolvedScientist = resolved.find(
            node => node.node === scientist
        );

        expect(
            resolvedScientist!.negativeConditions
        ).toHaveLength(1);

        expect(
            resolvedScientist!.negativeConditions[0]
        ).toEqual(
            expect.objectContaining({
                name: "AND"
            })
        );
    });
});
