import { Clause, Container, Node, Unit, Value } from "@yunixos/paradoxical";
import { ScopeEntity } from "./scope-entity";
import { PortraitDirectory } from "./filesystem/portrait-directory";
import type { Scope } from "./types";

export class PortraitNode {
    constructor(
        public readonly name: string,
        public scopes: ScopeEntity[] = [],
        public portraits?: PortraitDirectory
    ){}

    children: PortraitNode[] = [];
    conditions: Node[] = [];

    addNode(name: string): PortraitNode {
        const node = new PortraitNode(name.toLowerCase().replace(/ /g,"_"));
        this.children.push(node);
        return node;
    }

    addCondition(condition: Node): PortraitNode {
        this.conditions.push(condition);
        return this;
    }
    
    addConditionContainer(name: string): Container {
        const existing = this.conditions.find(
            condition =>
                condition instanceof Container &&
                condition.name === name
        );

        if (existing instanceof Container) {
            return existing;
        }

        const container = new Container(name);
        this.conditions.push(container);

        return container;
    }
    
    addConditionClause(key: string, value: Value): PortraitNode {
        const existing = this.conditions.find(
            condition =>
                condition instanceof Clause &&
                condition.name === key &&
                condition.value === value
        );

        if (existing) {
            return this;
        }
        
        const clause = new Clause(key, value);
        this.conditions.push(clause);

        return this;
    }
    
    addConditionUnit(value: Value): PortraitNode {
        const existing = this.conditions.find(
            condition =>
                condition instanceof Unit &&
                condition.value === value
        );

        if (existing) {
            return this;
        }
        
        const unit = new Unit(value);
        this.conditions.push(unit);
        
        return this;
    }

    addScope(scope: Scope, inherit: boolean = true): ScopeEntity {
        const scopeEntity = new ScopeEntity(scope);
        if (inherit) {
            scopeEntity.addConditions(this.conditions);
        }
        this.scopes.push(scopeEntity);
        return scopeEntity;
    }
    
    addScopes(scopes: Scope[], inherit: boolean = true): ScopeEntity[] {
        const addedScopes: ScopeEntity[] = [];
        scopes.forEach((scope) => {
            const scopeEntity = new ScopeEntity(scope);
            if (inherit) {
                scopeEntity.addConditions(this.conditions);
            }
            
            addedScopes.push(scopeEntity);
        });
        
        this.scopes.push(...addedScopes);
        
        return addedScopes;
    }

    usePortraits(directory: PortraitDirectory): void {
        this.portraits = directory;
    }
}
