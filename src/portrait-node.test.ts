import { PortraitDirectory } from "./filesystem/portrait-directory";
import { PortraitNode } from "./portrait-node";
import { Clause, Unit } from "@yunixos/paradoxical";

describe("PortraitNode", () => {
    it("adds child node", () => {
        const node = new PortraitNode("test");
        const childNode = node.addNode("test2");

        expect(node.children[0]).toBe(childNode);
    });
    
    describe("Conditions", () => {
        it("adds conditions", () => {
            const node = new PortraitNode("test");
            const condition = new Clause("condition", true);
            node.addCondition(condition);

            expect(node.globalConditions[0]).toBe(condition);
        });
        
        it("adds container conditions", () => {
            const node = new PortraitNode("test");
            const container = node.addConditionContainer("OR");
            
            expect(node.globalConditions[0]).toBe(container);
        });
        
        it("adds clause conditions", () => {
            const node = new PortraitNode("test");
            node.addConditionClause("condition", true);
            
            expect(node.globalConditions[0]).toBeInstanceOf(Clause);
        });
        
        it("adds unit conditions", () => {
            const node = new PortraitNode("test");
            node.addConditionUnit("unit");
            
            expect(node.globalConditions[0]).toBeInstanceOf(Unit);
        });
        
        it("applies conditions to all scopes", () => {
            const node = new PortraitNode("test");
            
            node.addScope("leader");
            
            node.addConditionUnit("test1");

            node.addScope("pop");
            
            node.addConditionUnit("test2");
            
            node.addScope("ruler");

            for (const scope of node.scopes) {
                expect(scope.conditions).toHaveLength(2);

                expect(scope.conditions).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ value: "test1" }),
                        expect.objectContaining({ value: "test2" })
                    ])
                );
            }
        });
    }); 

    it("adds a scope", () => {
        const node = new PortraitNode("yui");
        const scope = node.addScope("ruler");
        
        expect(node.scopes).toContain(scope);
    });
    
    it("adds portraits", () => {
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

        expect(node.globalConditions).toEqual(
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
