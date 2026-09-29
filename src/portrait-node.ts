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
    globalConditions: Node[] = [];

    addNode(name: string): PortraitNode {
        const node = new PortraitNode(name.toLowerCase().replace(/ /g,"_"));
        this.children.push(node);
        return node;
    }

    addCondition(condition: Node): PortraitNode {
        this.globalConditions.push(condition);

        for (const scope of this.scopes) {
            if(scope.inherit) {
                scope.addCondition(condition);
            }
        }

        return this;
    }
    
    addConditionContainer(name: string): Container {
        const existing = this.globalConditions.find(
            condition =>
                condition instanceof Container &&
                condition.name === name
        );

        if (existing instanceof Container) {
            return existing;
        }

        const container = new Container(name);
        
        for (const scope of this.scopes) {
            if(scope.inherit) {
                scope.addCondition(container);
            }
        }
        
        this.globalConditions.push(container);

        return container;
    }
    
    addConditionClause(key: string, value: Value): PortraitNode {
        const existing = this.globalConditions.find(
            condition =>
                condition instanceof Clause &&
                condition.name === key &&
                condition.value === value
        );

        if (existing) {
            return this;
        }
        
        const clause = new Clause(key, value);
        
        for (const scope of this.scopes) {
            if(scope.inherit) {
                scope.addCondition(clause);
            }
        }
        
        this.globalConditions.push(clause);

        return this;
    }
    
    addConditionUnit(value: Value): PortraitNode {
        const existing = this.globalConditions.find(
            condition =>
                condition instanceof Unit &&
                condition.value === value
        );

        if (existing) {
            return this;
        }
        
        const unit = new Unit(value);
        
        for (const scope of this.scopes) {
            if(scope.inherit) {
                scope.addCondition(unit);
            } 
        }

        this.globalConditions.push(unit);
        
        return this;
    }

    addScope(scope: Scope, inherit: boolean = true): ScopeEntity {
        const scopeEntity = new ScopeEntity(scope, inherit);
        if (inherit) {
            scopeEntity.addConditions(this.globalConditions);
        }
        this.scopes.push(scopeEntity);
        return scopeEntity;
    }
    
    addScopes(
        scopes: Scope[],
        inherit: boolean = true
    ): ScopeEntity[] {
        return scopes.map(
            scope => this.addScope(scope, inherit)
        );
    }
    
    scope(scope: Scope) {
        const foundScope = this.scopes.find((nodeScope) => nodeScope.scope === scope);
        
        if (!foundScope) {
            return this.addScope(scope);
        }
        
        return foundScope;
    }

    usePortraits(directory: PortraitDirectory): void {
        this.portraits = directory;
    }
}
