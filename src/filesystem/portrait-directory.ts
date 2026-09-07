export class PortraitDirectory {
    constructor(
        public readonly name: string,
        public readonly path: string,
        public portraits: string[] = [],
        public children: PortraitDirectory[] = []
    ) {}
}
