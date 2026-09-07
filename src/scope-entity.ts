import { Scope } from "./types";
import { Node } from "@yunixos/paradoxical";

export class ScopeEntity {
    conditions: Node[] = [];

    constructor(
        readonly scope: Scope,
        conditions?: Node[]
    ) {
        if (conditions) {
            this.conditions = conditions;
        }
    }

    addCondition(condition: Node): Node {
        this.conditions.push(condition);
        return condition;
    }

    addConditions(conditions: Node[]): void {
        this.conditions.push(...conditions);
    }
}
