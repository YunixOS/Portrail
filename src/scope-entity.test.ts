import { ScopeEntity } from "./scope-entity";
import { Clause } from "@yunixos/paradoxical";

describe("ScopeEntity", () => {
    it("Adds conditions", () => {
        const scope = new ScopeEntity("pop");
        const condition = new Clause("has_trait", "cool");
        scope.addCondition(condition);

        expect(scope.conditions[0]).toBe(condition);
    });

    it("Accepts conditions as argument", () => {
        const condition = new Clause("has_trait", "cool");
        const scope = new ScopeEntity("pop", [condition]);

        expect(scope.conditions[0]).toBe(condition);
    });
});
