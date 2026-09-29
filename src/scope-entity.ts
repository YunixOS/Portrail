import { Scope } from "./types";
import { Clause, Container, Node, Unit, Value } from "@yunixos/paradoxical";

export class ScopeEntity {
    conditions: Node[] = [];

    constructor(
        readonly scope: Scope,
        public readonly inherit: boolean,
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
    
    addConditionContainer(name: string): Container {
        const container = new Container(name);
        
        this.conditions.push(container);
        
        return container;
    }
    
    addConditionClause(key: string, value: Value): Clause {
        const clause = new Clause(key, value);
        
        this.conditions.push(clause);
        
        return clause;
    }
    
    addConditionUnit(value: Value): Unit {
        const unit = new Unit(value);

        this.conditions.push(unit);
        
        return unit;
    }
}
