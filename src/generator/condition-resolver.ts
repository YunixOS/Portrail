import { PortraitNode } from "../portrait-node";
import { Clause, Container, Keyword, Node } from "@yunixos/paradoxical";

export interface ResolvedNode {
    node: PortraitNode;
    path: string[];
    positiveConditions: Node[];
    negativeConditions: Node[];
}

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
    inheritedConditions: Node[] = [],
    nodePath: string[] = []
): ResolvedNode[] {
    const flattenedTree: ResolvedNode[] = []; 
    for(const node of nodeTree) {
        const currentPath = [...nodePath, node.name];

        const conditions = [...inheritedConditions, ...node.conditions];
        flattenedTree.push({
            node: node,
            path: currentPath,
            positiveConditions: conditions,
            negativeConditions: [],
        });

        flattenedTree.push(
            ...flattenNodeTree(
                node.children, 
                conditions,
                currentPath
            )
        );
    }

    return flattenedTree;
}
    
function resolveNegativeConditions(
    flattenedNodes: ResolvedNode[]
): ResolvedNode[] {
    for (const node of flattenedNodes) {
        for (const otherNode of flattenedNodes) {
            if (!isStrictSubset(
                otherNode.positiveConditions,
                node.positiveConditions
            )) {
                continue;
            }

            const additionalConditions =
                node.positiveConditions.filter(
                    condition =>
                        !otherNode.positiveConditions.some(
                            other =>
                                conditionsEqual(condition, other)
                        )
                );

            if (additionalConditions.length === 0) {
                continue;
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

            if (!otherNode.negativeConditions.some(
                condition =>
                    conditionsEqual(condition, negativeCondition)
            )) {
                otherNode.negativeConditions.push(negativeCondition);
            }
        }
    }

        return flattenedNodes;
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
