import { PortraitNode } from "../portrait-node";
import { Clause, Container, Keyword, Node } from "@yunixos/paradoxical";

interface ResolvedNode {
    node: PortraitNode;
    positiveConditions: Node[];
    negativeConditions: Node[];
}

export class ConditionResolver {
    static resolve(nodeTree: PortraitNode[]): ResolvedNode[] {
        const flattenedNodes = this.flattenNodeTree(nodeTree);
        const resolvedNodes = this.resolveNegativeConditions(flattenedNodes);
        return resolvedNodes;
    }

    private static flattenNodeTree(
        nodeTree: PortraitNode[], 
        inheritedConditions: Node[] = [],
    ): ResolvedNode[] { 
        const flattenedTree: ResolvedNode[] = [];
        for(const node of nodeTree) {
            const conditions = [...inheritedConditions, ...node.conditions];
            flattenedTree.push({
                node: node,
                positiveConditions: conditions,
                negativeConditions: []
            });
            
            flattenedTree.push(
                ...this.flattenNodeTree(
                    node.children, 
                    conditions
                )
            );
        }
        
        return flattenedTree;
    }
    
    private static resolveNegativeConditions(
        flattenedNodes: ResolvedNode[]
    ): ResolvedNode[] {
        for (const node of flattenedNodes) {
            for (const otherNode of flattenedNodes) {
                if (!this.isStrictSubset(
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
                                    this.conditionsEqual(condition, other)
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
                        this.conditionsEqual(condition, negativeCondition)
                )) {
                    otherNode.negativeConditions.push(negativeCondition);
                }
            }
        }

        return flattenedNodes;
    }
    
    private static conditionsEqual(a: Node, b: Node): boolean {
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
                        this.conditionsEqual(child, other)
                    )
                )
            );
        }

        return false;
    } 
    
    private static isStrictSubset(
        subset: Node[],
        superset: Node[]
    ): boolean {
        return (
            subset.length < superset.length &&
            subset.every(condition =>
                superset.some(otherCondition =>
                    this.conditionsEqual(condition, otherCondition)
                )
            )
        );
    }
}
