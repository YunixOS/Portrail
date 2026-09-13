import { PortraitNode } from "../portrait-node";
import { ConditionResolver } from "./condition-resolver";

describe("ConditionResolver", () => {
    test("adds more specific conditions as negative conditions", () => {
        const scientist = new PortraitNode("scientist");
        scientist.addConditionClause("has_trait", "trait_scientist");

        const genius = scientist.addNode("genius");
        genius.addConditionClause("has_trait", "trait_genius");

        const resolved = ConditionResolver.resolve(
            [scientist]
        );

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
        const scientist = new PortraitNode("scientist");
        scientist.addConditionClause("has_trait", "trait_scientist");

        const careless = scientist.addNode("carefree");
        careless.addConditionClause("has_trait", "trait_carefree");

        const lazy = scientist.addNode("lazy");
        lazy.addConditionClause("has_trait", "trait_carefree");

        const resolved = ConditionResolver.resolve([scientist]);

        const resolvedCareless = resolved.find(
            node => node.node === careless
        );

        const resolvedLazy = resolved.find(
            node => node.node === lazy
        );

        expect(resolvedCareless!.negativeConditions).toHaveLength(0);
        expect(resolvedLazy!.negativeConditions).toHaveLength(0);
    });
    
    test("does not exclude incomparable condition sets", () => {
        const scientist = new PortraitNode("scientist");
        scientist.addConditionClause("has_trait", "trait_scientist");

        const a = scientist.addNode("a");
        a.addConditionClause("has_trait", "trait_genius");
        a.addConditionClause("has_trait", "trait_awesome");

        const b = scientist.addNode("b");
        b.addConditionClause("has_trait", "trait_genius");
        b.addConditionClause("has_trait", "trait_aggressive");
        b.addConditionClause("has_trait", "trait_carefree");

        const resolved = ConditionResolver.resolve([scientist]);

        const resolvedA = resolved.find(node => node.node === a);
        const resolvedB = resolved.find(node => node.node === b);

        expect(resolvedA!.negativeConditions).toHaveLength(0);
        expect(resolvedB!.negativeConditions).toHaveLength(0);
    });
    
    test("only excludes additional conditions of a more specific node", () => {
        const scientist = new PortraitNode("scientist");
        scientist.addConditionClause("has_trait", "trait_scientist");

        const a = scientist.addNode("a");
        a.addConditionClause("has_trait", "trait_genius");
        a.addConditionClause("has_trait", "trait_cool");

        const b = scientist.addNode("b");
        b.addConditionClause("has_trait", "trait_genius");
        b.addConditionClause("has_trait", "trait_aggressive");
        b.addConditionClause("has_trait", "trait_carefree");

        const c = scientist.addNode("c");
        c.addConditionClause("has_trait", "trait_genius");
        c.addConditionClause("has_trait", "trait_aggressive");

        const resolved = ConditionResolver.resolve([scientist]);

        const resolvedScientist = resolved.find(node => node.node === scientist);
        const resolvedA = resolved.find(node => node.node === a);
        const resolvedB = resolved.find(node => node.node === b);
        const resolvedC = resolved.find(node => node.node === c);

        expect(resolvedScientist!.negativeConditions).toHaveLength(3);
        expect(resolvedA!.negativeConditions).toHaveLength(0);
        expect(resolvedB!.negativeConditions).toHaveLength(0);

        expect(resolvedC!.negativeConditions).toHaveLength(1);
        expect(resolvedC!.negativeConditions[0]).toEqual(
            expect.objectContaining({
                name: "has_trait",
                value: "trait_carefree"
            })
        );
    });
    
    test("groups negative conditions for the same node", () => {
        const scientist = new PortraitNode("scientist");
        scientist.addConditionClause("has_trait", "trait_scientist");

        const a = scientist.addNode("a");
        a.addConditionClause("has_trait", "trait_genius");
        a.addConditionClause("has_trait", "trait_cool");
        
        const resolved = ConditionResolver.resolve([scientist]);
        const resolvedScientist = resolved.find(node => node.node === scientist);
        
        expect(resolvedScientist!.negativeConditions).toHaveLength(1);
        expect(resolvedScientist!.negativeConditions[0]).toEqual(
            expect.objectContaining({
                name: "AND"
            })
        );
    });
});
