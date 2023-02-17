const config = {
    // These are the base weights that are multiplied per level of armor class,
    // in addition to what's added by the material.
    // TODO(gaylatea): these defnitely need to be tuned.
    armorClassWeightKG: {
        thorax: 0.25,
        stomach: 0.2,
        arms: 0.1,
    },

    // TODO: actually balance this
    armorClassCostMultiplier: {
        1: 1,
        2: 1,
        3: 1,
        4: 1.25,
        5: 2,
        6: 3.5,
    },

    prefabs: {
        arms: "assets/item_equipment_armorplate_arm.bundle",
        stomach: "assets/item_equipment_armorplate_stomach.bundle",
        thorax: "assets/item_equipment_armorplate_chest.bundle",
    },

    zones: {
        arms: ["LeftArm", "RightArm"],
        stomach: ["Stomach"],
        thorax: ["Chest"],
    },

    sizes: {
        arms: [2, 2],
        stomach: [2, 3],
        thorax: [3, 3],
    },

    // Each material tries to differentiate itself from the others by
    // having different tradeoffs that you need to make.
    // Mostly these are the following:
    //   - Weight
    //   - Ergonomics/Movement Penalties
    //   - Price
    //
    // These are baseline properties and can of course be overridden
    // in any custom plates you create.
    materials: {
        "Aluminium": {
            noise: "container_metal",
            bluntThroughput: 0.2,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        },
        "Aramid": {
            noise: "gear_armor",
            bluntThroughput: 0.4,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        },
        "ArmoredSteel": {
            noise: "container_metal",
            bluntThroughput: 0.2,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        },
        "Ceramic": {
            noise: "gear_armor",
            bluntThroughput: 0.2,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        },
        "Combined": {
            noise: "gear_armor",
            bluntThroughput: 0.2,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        },
        "Titan": {
            noise: "container_metal",
            bluntThroughput: 0.2,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        },
        "UHMWPE": {
            noise: "gear_armor",
            bluntThroughput: 0.2,

            thorax: {
                baseWeightKG: 3.5,
                basePriceRUB: 22401,
                maxDurability: 50,
            },
            stomach: {
                baseWeightKG: 3.5,
                basePriceRUB: 12400,
                maxDurability: 50,
            },
            arms: {
                baseWeightKG: 0.5,
                basePriceRUB: 10548,
                maxDurability: 50,
            },

            multipliers: {
                weight: 1,
                speedPenalty: 1.05,
                mousePenalty: 1.05,
                ergonomicPenalty: 1.05,
                price: 1.0,
            },
        }
    },

    availableVixenIndustriesPlates: {
        // For now, what plates are even available come from the combinations seen in the
        // base game.
        "Aluminium": {
            thorax: [3, 4],
            stomach: [3, 4],
            arms: [4],
        },
        "Aramid": {
            thorax: [2, 3],
            stomach: [2, 3],
            arms: [2],
        },
        "ArmoredSteel": {
            thorax: [3, 4, 5, 6],
            stomach: [3, 4, 5, 6],
            arms: [],
        },
        "Ceramic": {
            thorax: [4, 5, 6],
            stomach: [4, 5, 6],
            arms: [4],
        },
        "Combined": {
            thorax: [3, 4, 5, 6],
            stomach: [3, 4, 5, 6],
            arms: [5, 6],
        },
        "Titan": {
            thorax: [2, 3, 4, 5, 6],
            stomach: [2, 3, 4, 5],
            arms: [5],
        },
        "UHMWPE": {
            thorax: [3, 4, 5, 6],
            stomach: [2, 3],
            arms: [3],
        },
    } as {[key: string]: AvailablePlates},
};
export default config;

interface AvailablePlates {
    thorax: number[],
    stomach: number[],
    arms: number[],
};