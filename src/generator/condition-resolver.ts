import { PortraitNode } from "../portrait-node";
import { Clause, Container, Keyword, Node } from "@yunixos/paradoxical";
import { Scope } from "../types";

export interface ResolvedScope {
    scope: Scope;
    positiveConditions: Node[];
    negativeConditions: Node[];
}

export interface ResolvedNode {
    node: PortraitNode;
    path: string[];
    scopes: ResolvedScope[];
}

const DEFAULT_SCOPES = [
    "game_setup",
    "leader",
    "pop",
    "ruler",
    "species"
] as const;

export function resolve(node: PortraitNode): ResolvedNode[] {
    const flattenedNodes = flattenNodeTree(
        [node],
        [],
        []
    );

    return resolveNegativeConditions(flattenedNodes);
}

function flattenNodeTree(
    nodeTree: PortraitNode[],
    inheritedScopes: ResolvedScope[] = [],
    nodePath: string[] = []
): ResolvedNode[] {
    const flattenedTree: ResolvedNode[] = [];

    for (const node of nodeTree) {
        const currentPath = [...nodePath, node.name];

        const scopes = resolveScopes(
            node,
            inheritedScopes
        );

        const resolvedNode: ResolvedNode = {
            node,
            path: currentPath,
            scopes
        };

        flattenedTree.push(resolvedNode);

        flattenedTree.push(
            ...flattenNodeTree(
                node.children,
                scopes,
                currentPath
            )
        );
    }

    return flattenedTree;
}

function resolveScopes(
    node: PortraitNode,
    inheritedScopes: ResolvedScope[]
): ResolvedScope[] {
    if (
        node.scopes.length === 0 &&
        inheritedScopes.length === 0
    ) {
        return DEFAULT_SCOPES.map(scope => ({
            scope,
            positiveConditions: [],
            negativeConditions: []
        }));
    }

    const scopes = inheritedScopes.map(scope => ({
        scope: scope.scope,
        positiveConditions: [...scope.positiveConditions],
        negativeConditions: []
    }));

    for (const scopeEntity of node.scopes) {
        const existing = scopes.find(
            scope => scope.scope === scopeEntity.scope
        );

        if (existing) {
            existing.positiveConditions.push(
                ...scopeEntity.conditions
            );
        } else {
            scopes.push({
                scope: scopeEntity.scope,
                positiveConditions: [...scopeEntity.conditions],
                negativeConditions: []
            });
        }
    }

    return scopes;
}   

function resolveNegativeConditions(
    flattenedNodes: ResolvedNode[]
): ResolvedNode[] {
    for (const node of flattenedNodes) {
        for (const otherNode of flattenedNodes) {
            for (const nodeScope of node.scopes) {
                const otherScope = otherNode.scopes.find(
                    scope => scope.scope === nodeScope.scope
                );

                if (!otherScope) {
                    continue;
                }

                resolveScopeNegativeConditions(
                    nodeScope,
                    otherScope
                );
            }
        }
    }

    return flattenedNodes;
}

function resolveScopeNegativeConditions(
    nodeScope: ResolvedScope,
    otherScope: ResolvedScope
): void {
    if (!isStrictSubset(
        otherScope.positiveConditions,
        nodeScope.positiveConditions
    )) {
        return;
    }

    const additionalConditions =
        nodeScope.positiveConditions.filter(
            condition =>
                !otherScope.positiveConditions.some(
                    other =>
                        conditionsEqual(condition, other)
                )
        );

    if (additionalConditions.length === 0) {
        return;
    }

    let negativeCondition: Node;

    if (additionalConditions.length === 1) {
        negativeCondition = additionalConditions[0];
    } else {
        const container = new Container("AND");

        for (const condition of additionalConditions) {
            container.add(condition);
        }

        negativeCondition = container;
    }

    if (!otherScope.negativeConditions.some(
        condition =>
            conditionsEqual(condition, negativeCondition)
    )) {
        otherScope.negativeConditions.push(
            negativeCondition
        );
    }
}

function conditionsEqual(a: Node, b: Node): boolean {
    if (a instanceof Clause && b instanceof Clause) {
        if (a.name !== b.name || a.operator !== b.operator) {
            return false;
        }

        if (a.value instanceof Keyword && b.value instanceof Keyword) {
            return a.value.value === b.value.value;
        }

        return a.value === b.value;
    }

    if (a instanceof Container && b instanceof Container) {
        return (
            a.name === b.name &&
            a.children.length === b.children.length &&
            a.children.every(child =>
                b.children.some(other =>
                    conditionsEqual(child, other)
                )
            )
        );
    }

    return false;
} 
    
function isStrictSubset(
    subset: Node[],
    superset: Node[]
): boolean {
    return (
        subset.length < superset.length &&
        subset.every(condition =>
            superset.some(otherCondition =>
                conditionsEqual(condition, otherCondition)
            )
        )
    );
}
