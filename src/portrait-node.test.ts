import { PortraitDirectory } from "./filesystem/portrait-directory";
import { PortraitNode } from "./portrait-node";
import { Clause, Container, Unit } from "@yunixos/paradoxical";

describe("PortraitNode", () => {
    it("Adds child node", () => {
        const node = new PortraitNode("yryr");
        const childNode = node.addNode("yui");

        expect(node.children[0]).toBe(childNode);
    });
    
    describe("Conditions", () => {
        it("Adds conditions", () => {
            const node = new PortraitNode("yui");
            const condition = new Clause("has_trait", "cool");
            node.addCondition(condition);

            expect(node.conditions[0]).toBe(condition);
        });
        
        it("Adds container conditions", () => {
            const node = new PortraitNode("yui");
            const container = node.addConditionContainer("OR");
            
            expect(node.conditions[0]).toBe(container);
        });
        
        it("Adds clause conditions", () => {
            const node = new PortraitNode("yui");
            node.addConditionClause("age", 14);
            
            expect(node.conditions[0]).toBeInstanceOf(Clause);
        });
        
        it("Adds unit conditions", () => {
            const node = new PortraitNode("yui");
            node.addConditionUnit("unit");
            
            expect(node.conditions[0]).toBeInstanceOf(Unit);
        });
    }); 

    it("Adds nested conditions", () => {
        const node = new PortraitNode("yui");
        const condition = new Container("OR");
        condition.addClause("has_trait", "cool");
        condition.addClause("has_trait", "super_cool");
        node.addCondition(condition);

        expect(node.conditions[0]).toBe(condition);
    });

    it("Adds scopes", () => {
        const node = new PortraitNode("yui");
        const scope = node.addScope("ruler");
        
        expect(node.scopes).toContain(scope);
    });
    
    it("Adds portraits", () => {
        const node = new PortraitNode("yui");
        const portraits = new PortraitDirectory(
            "default", 
            "path",
            ["gfx/models/portraits/default/1.dds"]
        )
        
        node.usePortraits(portraits);
        
        expect(node.portraits).toBe(portraits);
    });
    
    it("supports method chaining", () => {
        const node = new PortraitNode("yui")
            .addConditionClause("hair", "black")
            .addConditionClause("age", 14);

        expect(node.conditions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "hair",
                    value: "black"
                }),
                expect.objectContaining({
                    name: "age",
                    value: 14
                })
            ])
        );
    });
});
