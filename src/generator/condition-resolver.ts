import { PortraitNode } from "../portrait-node";
import {
    Clause,
    Container,
    Keyword,
    Node
} from "@yunixos/paradoxical";
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

const DEFAULT_SCOPES: Scope[] = [
    "game_setup",
    "leader",
    "pop",
    "ruler",
    "species"
];

export function resolve(node: PortraitNode): ResolvedNode[] {
    const flattenedNodes = flattenNodeTree(
        [node],
        new Map(),
        []
    );

    return resolveNegativeConditions(flattenedNodes);
}

function flattenNodeTree(
    nodeTree: PortraitNode[],
    inheritedConditions: Map<Scope, Node[]>,
    nodePath: string[]
): ResolvedNode[] {
    const flattenedTree: ResolvedNode[] = [];

    for (const node of nodeTree) {
        const currentPath = [
            ...nodePath,
            node.name
        ];

        const scopes = resolveScopes(
            node,
            inheritedConditions,
            nodePath.length === 0
        );

        const resolvedNode: ResolvedNode = {
            node,
            path: currentPath,
            scopes
        };

        flattenedTree.push(resolvedNode);

        const childInheritedConditions =
            getChildInheritedConditions(
                node,
                scopes,
                inheritedConditions
            );

        flattenedTree.push(
            ...flattenNodeTree(
                node.children,
                childInheritedConditions,
                currentPath
            )
        );
    }

    return flattenedTree;
}

function resolveScopes(
    node: PortraitNode,
    inheritedConditions: Map<Scope, Node[]>,
    isRoot: boolean
): ResolvedScope[] {
    const scopeEntities =
        node.scopes.length === 0 && isRoot
            ? DEFAULT_SCOPES.map(
                scope => ({
                    scope,
                    conditions: []
                })
            )
            : node.scopes;

    return scopeEntities.map(scopeEntity => {
        const positiveConditions =
            inheritedConditions.get(scopeEntity.scope) ?? [];

        return {
            scope: scopeEntity.scope,
            positiveConditions: [
                ...positiveConditions,
                ...scopeEntity.conditions
            ],
            negativeConditions: []
        };
    });
}

function getChildInheritedConditions(
    node: PortraitNode,
    scopes: ResolvedScope[],
    inheritedConditions: Map<Scope, Node[]>
): Map<Scope, Node[]> {
    if (node.scopes.length === 0) {
        return inheritedConditions;
    }

    const childInheritedConditions =
        new Map<Scope, Node[]>();

    for (const scope of scopes) {
        childInheritedConditions.set(
            scope.scope,
            [...scope.positiveConditions]
        );
    }

    return childInheritedConditions;
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
