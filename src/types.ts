import { Keyword } from "@yunixos/paradoxical";

export interface Portrait {
    id: Keyword;
    file: string;
}

export type Scope = "game_setup" | "pop" | "species" | "leader" | "ruler";
