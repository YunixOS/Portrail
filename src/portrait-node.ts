import { Clause, Container, Node, Unit, Value } from "@yunixos/paradoxical";
import { ScopeEntity } from "./scope-entity";
import { PortraitDirectory } from "./filesystem/portrait-directory";
import type { Scope } from "./types";

export class PortraitNode {
    constructor(
        public readonly name: string,
        public scopes: ScopeEntity[] = [],
        public portraits?: PortraitDirectory
    ){
        if (this.scopes.length < 1) {
            this.addScope("game_setup");
            this.addScope("species");
            this.addScope("pop");
            this.addScope("leader"); 
            this.addScope("ruler");
        }
    }

    children: PortraitNode[] = [];
    conditions: Node[] = [];

    addNode(name: string): PortraitNode {
        const node = new PortraitNode(name.toLowerCase().replace(/ /g,"_"));
        this.children.push(node);
        return node;
    }

    addCondition(condition: Node): void {
        if (this.conditions.includes(condition)) {
            return;
        }

        this.conditions.push(condition);
    }
    
    addConditionContainer(name: string): Container | void {
        const container = new Container(name);
        if (this.conditions.includes(container)) {
            return;
        }

        this.conditions.push(container);
        return container;
    }
    
    addConditionClause(key: string, value: Value): Clause | void {
        const clause = new Clause(key, value);
        if (this.conditions.includes(clause)) {
            return;
        }

        this.conditions.push(clause);
        return clause;
    }
    
    addConditionUnit(value: Value): Unit | void {
        const unit = new Unit(value);
        if (!this.conditions.includes(unit)) {
            return;
        }

        this.conditions.push(unit);
        
        return unit;
    }

    addScope(scope: Scope, inherit: boolean = true) {
        const scopeEntity = new ScopeEntity(scope);
        if (inherit) {
            scopeEntity.addConditions(this.conditions);
        }
        this.scopes.push(scopeEntity);
        return scopeEntity;
    }

    usePortraits(directory: PortraitDirectory): void {
        this.portraits = directory;
    }
}
