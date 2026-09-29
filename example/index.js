import { PortraitMod } from "portrail";

// Create your mod
const mod = new PortraitMod("./mod");

// Create a portrait category. A portrait category is the tab your
// portraits will be located within during empire creation.
const category = mod.createPortraitCategory(
    "test_category",
    "My Mod Category"
);

// A portrait set is a group of portrait groups displayed within
// a category during empire creation.
// It assigns the type of its portrait groups (e.g HUM (human))
const set = mod.createPortraitSet("test_set", "HUM");

// Portrait set must be added to at least one category
// for it to be selectable during empire creation.
category.addPortraitSet(set);

// A portrait group is a group of portraits contained within a
// set.
const group = mod.createPortraitGroup("groups/pg_test_default");

// You probably want to add your group to at least one portrait set.
set.addPortraitGroup(group);

// Selects cool node and says they should encompass all scopes
group.node("cool")
     .addScopes([
         "game_setup",
         "pop",
         "leader",
         "ruler"
     ]);

// By default, cool scopes should scope into species and
// check for trait_cool.
group.node("cool")
    .addConditionContainer("species")
    .addClause("has_trait", "trait_cool");

// Species scope doesn't need to scope into species, and should
// instead just check for trait_cool.
group.node("cool")
    .addScope("species", false)
    .addConditionClause("has_trait", "trait_cool");

// Add check for scientist subnode in leader scope.
group.node("cool/leaders/scientist")
    .addConditionClause("leader_class", "scientist")
    .addScope("leader");

// Add check for scientist subnode in leader & ruler scope.
group.node("cool/leaders/commander")
    .addConditionClause("leader_class", "commander")
    .addScopes([
        "leader",
        "ruler"
    ]);

// Add check for officials in default node
group.node("leaders/official")
    .addConditionClause("leader_class", "official")
    .addScopes([
        "leader",
        "ruler"
    ]);

// Write all the mod files as defined
mod.write();
