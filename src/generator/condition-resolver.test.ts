import { Clause } from "@yunixos/paradoxical";
import { PortraitNode } from "../portrait-node";
import { ScopeEntity } from "../scope-entity";
import { resolve } from "./condition-resolver";

function createNode(
    name: string,
    ...traits: string[]
): PortraitNode {
    const node = new PortraitNode(name);

    if (traits.length > 0) {
        const scope = node.addScope("leader");

        for (const trait of traits) {
            scope.addCondition(
                new Clause(
                    "has_trait",
                    `trait_${trait}`
                )
            );
        }
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

function getScope(
    node: ReturnType<typeof resolve>[number],
    scope: string
) {
    const resolvedScope = node.scopes.find(
        entity => entity.scope === scope
    );

    expect(resolvedScope).toBeDefined();

    return resolvedScope!;
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

        const resolved = resolve(scientist);

        expect(resolved).toHaveLength(2);

        const resolvedScientist = resolved.find(
            node => node.node === scientist
        );

        expect(resolvedScientist).toBeDefined();

        const leaderScope = getScope(
            resolvedScientist!,
            "leader"
        );

        expect(
            leaderScope.negativeConditions
        ).toHaveLength(1);

        expect(
            leaderScope.negativeConditions[0]
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

        const carefree = createNode(
            "carefree",
            "carefree"
        );

        const lazy = createNode(
            "lazy",
            "carefree"
        );

        scientist.children.push(
            carefree,
            lazy
        );

        const resolved = resolve(scientist);

        const resolvedCareless = resolved.find(
            node => node.node === carefree
        );

        const resolvedLazy = resolved.find(
            node => node.node === lazy
        );

        expect(
            getScope(resolvedCareless!, "leader")
                .negativeConditions
        ).toHaveLength(0);

        expect(
            getScope(resolvedLazy!, "leader")
                .negativeConditions
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

        const resolved = resolve(scientist);

        const resolvedA = resolved.find(
            node => node.node === a
        );

        const resolvedB = resolved.find(
            node => node.node === b
        );

        expect(
            getScope(resolvedA!, "leader")
                .negativeConditions
        ).toHaveLength(0);

        expect(
            getScope(resolvedB!, "leader")
                .negativeConditions
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

        const resolved = resolve(scientist);

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
            getScope(resolvedScientist!, "leader")
                .negativeConditions
        ).toHaveLength(3);

        expect(
            getScope(resolvedA!, "leader")
                .negativeConditions
        ).toHaveLength(0);

        expect(
            getScope(resolvedB!, "leader")
                .negativeConditions
        ).toHaveLength(0);

        expect(
            getScope(resolvedC!, "leader")
                .negativeConditions
        ).toHaveLength(1);

        expect(
            getScope(resolvedC!, "leader")
                .negativeConditions[0]
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

        const resolved = resolve(scientist);

        const resolvedScientist = resolved.find(
            node => node.node === scientist
        );

        const leaderScope = getScope(
            resolvedScientist!,
            "leader"
        );

        expect(
            leaderScope.negativeConditions
        ).toHaveLength(1);

        expect(
            leaderScope.negativeConditions[0]
        ).toEqual(
            expect.objectContaining({
                name: "AND"
            })
        );
    });
});
