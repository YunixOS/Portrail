# Portrail
Portrail is a library built on [Paradoxical](https://github.com/YunixOS/Paradoxical) that lets you create 2D portrait mods for Stellaris much more easily using JavaScript or TypeScript.
The documentation is currently rather sparse, but I am working on it.

## Features
- Automatically handles importing of .dds files and assigns them based on user input.
- Directory based nodes that enabled fine grained control of portrait triggers.
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

# Usage
Once Portrail is installed, you can create a new JS/TS file and add the following import (make sure you are using ES6 modules):
```JS
import { PortraitMod } from "portrail";
```

PortraitMod is the main way you should be interfacing with portrail.

Lets start by creating a new portrait category. A portrait category is the tab that your portraits will be stored within at the empire creation screen.

```JS
const category = mod.createPortraitCategory(
    "test_category",
    "My Mod Category"
);
```

This would create a category in game titled "My Mod Category" within the portrait selection menu during empire creation. 
It's internal id is "test_category". This id will not really be exposed to the player, but is still important for readability of the resulting files and avoiding naming conflicts with the base game and other mods.
