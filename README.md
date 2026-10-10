# Portrail
Portrail is a library built on [Paradoxical](https://github.com/YunixOS/Paradoxical) that lets you create 2D portrait mods for Stellaris much more easily using JavaScript or TypeScript.
The documentation is currently rather sparse, but I am working on it.

## Features
- Automatically handles importing of dds image files and assigns them based on user input.
- Directory based nodes that enable fine grained control of portrait triggers.
- Resolver that automatically determines inherited and negative triggers for portraits based on relationships between those that have been assigned to other nodes.

# Install Methods
## Build from source
```bash
git clone https://github.com/YunixOS/Portrail.git
cd Portrail
npm install
npm run build
npm pack
```
You should then be able to copy the generated package file into your project and install it via npm.

## Pre-built package
Download the pre-built package from the releases section and copy it into the root directory of your project. Use ```npm install <path/to/package>``` to install.

# Getting Started
## 1. Populate portraits directory
Before doing anything with Portrail, make sure you have a folder created for your mod. You will need to have your dds files (portrait images) populating the gfx/models/portraits directory within your mod folder. It is recommended that you organise portraits based on the portrait groups you intend on creating. If you are only going to have one portrait group, you could for example just create a folder inside gfx/models/portraits with the name of the group and populate it with your dds files. The resulting id of the group will be what you set the folder name to (though special characters will be replaced with underscores), so make sure it is unique enough to reduce the risk of potential compatability issues with other mods or the base game. If you want to have certain special portraits with their own triggers and such, you can create subfolders within the group folder (called "portrait nodes" in Portrail) which you can later add custom triggers to (e.g make them appear for only scientist leaders). Portraits placed in the root directory of the group are part of the "default" portrait node, and the first portrait in this node will be used as the default portrait of the group (the one used as the icon for the group in empire creation) if no specific default portrait is manually specified. If you have no portraits in the default node (e.g your folder structure involves all dds files being within other nodes) you must manually assign a default portrait by passing an extra argument to the createPortraitGroup method.

## 2. Import Portrail
Once Portrail is installed and your portraits directory is organised as intended, you can create a new JS/TS file and add the following import (make sure you are using ES6 modules):
```JS
import { PortraitMod } from "portrail";
```

PortraitMod is the primary way most people should be interfacing with Portrail.

## 3. Create a portrait category
Lets start by creating a new portrait category. A portrait category is the tab that your portraits will be stored within at the empire creation screen.

```JS
const category = mod.createPortraitCategory(
    "test_category",
    "My Mod Category"
);
```

This would create a category in game titled "My Mod Category" within the portrait selection menu during empire creation. 
It's internal id is "test_category". This id will not really be exposed to the player, but is still important for readability of the resulting files and it should be made something unique to avoid naming conflicts with the base game and other mods.

## 4. Create a portrait set
Now, lets create a portrait set. A portrait set is a set of portrait groups that you can assign to a particular category. Portrait sets require you include a species class (such as "HUM" which is the human species class from the base game). You can add a set to any or multiple categories. Here we will just add it to the category we created.
```JS
const set = mod.createPortraitSet(
    "test_portrait_set",
    "HUM"
);

category.addPortraitSet(set);
```

## 5. Create a portrait group
We can now move on to creating the portrait groups themselves. Similarly to the sets, once you have made a portrait group you can assign it to whatever categories you want. It should also be noted that the argument of the group should match a particular directory relative to gfx/models/portraits within your mod directory. You may also specify a default portrait to use as the icon/image for the group in the game (most notably seen during empire creation and such).

```JS
// Sets the groups root directory to be gfx/models/portraits/groups/pg_test_default
const group = mod.createPortraitGroup("groups/pg_test_default");

// Simple way of adding all portrait groups in the mod to a particular set
set.addPortraitGroups(mod.portraitGroups);
```

Congratulations, you now have a portrait group assigned to a directory in your mod!

## 5.1. (optional)
If you want to get a bit more advanced, you can create custom portrait nodes by creating subdirectories within your portrait groups directory and populating them with dds portraits of your choosing. When creating the portrait group, it will automatically find all the subdirectories and assign portrait nodes to them which you can manually add special conditions to, shaping how and when they appear in game with more control.

For example, lets say you created a subdirectory called "leaders" within your portrait group directory, and another directory within "leaders" called "scientist". You then could for example populate this with special portraits for scientists. You can then simply use the node() method of your portrait group to find this node and add the conditions you wish.

```JS
// Searches for the leader/scientist node in the group and specifies to only use leader & ruler scopes
group.node("leaders/scientist")
    .addScopes(["leader", "ruler"]);

// Specifies that every scope on the node should by default inherit the 
// condition leader_class = scientist
group.node("leaders/scientist")
    .addConditionClause("leader_class", "scientist");
```

## 6. Write your mod
The final part involves writing your mod files to the disk. This is the easiest part, and once this is done you should be able to run the file with `node path/to/file.js` in the terminal, and have the files generate correctly within the mod folder, leaving you with a (hopefully) functioning portrait mod.

```JS
mod.write();
```

