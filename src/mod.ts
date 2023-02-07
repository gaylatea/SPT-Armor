import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ITemplateItem, Slot } from "@spt-aki/models/eft/common/tables/ITemplateItem";

import config from "../config/config";

import _ from "lodash";

const HANDBOOK_GEAR_COMPONENTS = "5b5f704686f77447ec5d76d7";
const HANDBOOK_GEAR_CASES = "5b5f6fa186f77409407a7eb7";
const HANDBOOK_BODY_ARMOR = "5448e5284bdc2dcb718b4568";
const HANDBOOK_ARMOR_VEST = "5448e54d4bdc2dcc718b4568";
const PACA = "5648a7494bdc2d9d488b4583";
const ITEM_CASE = "59fb042886f7746c5005a7b2";
const RAGMAN = "5ac3b934156ae10c4430e83c";
const SCAV_BODY_PART = "5cc0868e14c02e000c6bea68";
const RUBLES = "5449016a4bdc2d6f028b456f";


class RealisticPlates implements IPostDBLoadMod {
    private Logger: ILogger;
    private database: IDatabaseTables;
    private jsonUtil: JsonUtil;

    public postDBLoad(container: DependencyContainer) {
        this.Logger = container.resolve<ILogger>("WinstonLogger");
        this.database = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        this.jsonUtil = container.resolve<JsonUtil>("JsonUtil");

        this.Logger.info("[RealisticPlates] Generating plates and carriers.");
        try {
            const plates = this.mkPlates();
            this.mkPlateContainer(plates);
            this.tweakCarriers(plates);

        } catch (e) {
            this.Logger.error(`[RealisticPlates] Unable to generate, exception thrown => ${e}`);
        }
        finally {
            this.Logger.info("[RealisticPlates] Complete");
        }
    }

    // TODO(gaylatea): Add an API for folks to integrate plate support into their own mods?

    public mkPlateContainer(plates: ITemplateItem[]) {
        let plateContainer = this.jsonUtil.clone(this.database.templates.items[ITEM_CASE]);

        _.merge(plateContainer, {
            _id: "platecontainer",
            _props: {
                Height: 3,
                Weight: 2.25,
                Prefab: {
                    path: "assets/content/items/spec/item_spec_armorrepair/item_spec_armorrepair.bundle",
                },
                ItemSound: "spec_armorrep",
                Grids: [
                    {
                        _props: {
                            filters: [
                                {
                                    Filter: plates.map((x) => {
                                        return x._id;
                                    }),
                                }]
                        }
                    },
                ]
            }
        });

        this.database.templates.items["plateContainer"] = plateContainer

        this.database.locales.global["en"]["plateContainer Name"] = "Ballistic Plate Storage Bag";
        this.database.locales.global["en"]["plateContainer ShortName"] = "Plate Bag";
        this.database.locales.global["en"]["plateContainer Description"] = "A large, durable carry bag meant for easy storing and moving of multiple armor plates. Used commonly by military forces for rapid deployment and access of replacement ballistic plates for soldiers in combat zones.";

        this.database.templates.handbook.Items.push({
            "Id": "plateContainer",
            "ParentId": HANDBOOK_GEAR_CASES,
            "Price": 350000,
        });
    }

    private mkPlateBaseItem(armorClass: number, material: string): ITemplateItem {
        let plate = this.jsonUtil.clone(this.database.templates.items[PACA]);
        const materialConfig = config.materials[material];

        return _.merge(plate, {
            _props: {
                ItemSound: materialConfig.noise,
                armorClass: armorClass,
                ArmorMaterial: material,
                speedPenaltyPercent: (armorClass * -0.5) * materialConfig.speedPenaltyMultiplier,
                mousePenalty: (armorClass * -0.25) * materialConfig.mousePenaltyMultipler,
                weaponErgonomicPenalty: (armorClass * -0.5) * materialConfig.ergonomicPenaltyMultiplier,
            },
        });
    }

    private isPlateAllowed(armorClass: number, slot: string, material: string): boolean {
        // Though the generator creates the entire combinatorial explosion of {material, slot, class}, this will
        // restrict what ones are actually usable / buyable in the game.
        // Even as a meme, a class 1 glass plate is useless.
        if (!config.onlyAllowSpecifiedPlates) { return true; }

        return config.plates[armorClass]?.[slot]?.includes(material);
    }

    // TODO(gaylatea): Improve this? I feel like there's better we can do to make Ragman not just have *everything*
    private ragmanLoyaltyLevel(armorClass: number): number {
        return (armorClass < 4 ? 0 :
            (armorClass == 4 ? 2 :
                (armorClass == 5 ? 3 : 4)
            )
        );
    }

    private mkArmPlate(armorClass: number, material: string): ITemplateItem {
        let plate = this.mkPlateBaseItem(armorClass, material);
        const materialConfig = config.materials[material];

        return _.merge(plate, {
            _id: `plateArms${armorClass}_${material}`,
            _props: {
                Prefab: {
                    path: "assets/item_equipment_armorplate_arm.bundle",
                },
                Width: 2,
                Height: 2,
                Weight: (config.baseArmPlateWeight + (armorClass * 0.2)) * materialConfig.weightMultiplier,
                armorZone: ["LeftArm", "RightArm"],
                Durability: 35,
                MaxDurability: 35,
            },
        });
    }

    private mkStomachPlate(armorClass: number, material: string): ITemplateItem {
        let plate = this.mkPlateBaseItem(armorClass, material);
        const materialConfig = config.materials[material];

        return _.merge(plate, {
            _id: `plateStomach${armorClass}_${material}`,
            _props: {
                Prefab: {
                    path: "assets/item_equipment_armorplate_stomach.bundle",
                },
                Width: 2,
                Height: 3,
                Weight: (config.basePlateWeight + (armorClass * 0.2)) * materialConfig.weightMultiplier,
                armorZone: ["Stomach"],
                Durability: 35,
                MaxDurability: 35,
                BluntThroughput: materialConfig.bluntThroughput,
            },
        });
    }

    private mkThoraxPlate(armorClass: number, material: string): ITemplateItem {
        let plate = this.mkPlateBaseItem(armorClass, material);
        const materialConfig = config.materials[material];

        return _.merge(plate, {
            _id: `plateChest${armorClass}_${material}`,
            _props: {
                Prefab: {
                    path: "assets/item_equipment_armorplate_chest.bundle",
                },
                Width: 3,
                Height: 3,
                Weight: (config.basePlateWeight + (armorClass * 0.65)) * materialConfig.weightMultiplier,
                armorZone: ["Chest"],
                Durability: 65,
                MaxDurability: 65,
                BluntThroughput: materialConfig.bluntThroughput,
            },
        });
    }

    private addPlateToRagman(plate: ITemplateItem, price: number, ragmanLevel: number) {
        this.database.templates.items[plate._id] = plate;
        this.database.templates.handbook.Items.push({
            "Id": plate._id,
            "ParentId": HANDBOOK_GEAR_COMPONENTS,
            "Price": price
        });

        this.database.traders[RAGMAN].assort.items.push({
            "_id": plate._id,
            "_tpl": plate._id,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "StackObjectsCount": 99999999,
                "UnlimitedCount": true
            }
        });

        this.database.traders[RAGMAN].assort.barter_scheme[plate._id] = [
            [{
                _tpl: RUBLES,
                count: price,
            }]
        ];

        this.database.traders[RAGMAN].assort.loyal_level_items[plate._id] = ragmanLevel;
    }

    private mkPlates(): ITemplateItem[] {
        const plates: ITemplateItem[] = [];
        for (const material in this.database.globals.config.ArmorMaterials) {
            for (let armorClass = 1; armorClass < 7; armorClass++) {
                const ragmanLevel = this.ragmanLoyaltyLevel(armorClass);

                if (this.isPlateAllowed(armorClass, "Arms", material)) {
                    const armPlate = this.mkArmPlate(armorClass, material);

                    // Create the handbook descriptions so the items actually exist to the game.
                    this.database.locales.global["en"][`${armPlate._id} Name`] = `Class ${armorClass} ${material == "ArmoredSteel" ? "Steel" : material} Arm Inserts`;
                    this.database.locales.global["en"][`${armPlate._id} ShortName`] = `L${armorClass} Inserts`;
                    this.database.locales.global["en"][`${armPlate._id} Description`] = `Multi-hit ${material == "ArmoredSteel" ? "Steel" : material} inserts of level ${armorClass} protection designed to protect the upper arms / shoulders of the wearer.`;

                    // TODO(gaylatea): Add a material modifier to the cost?
                    this.addPlateToRagman(armPlate, (10548 * armorClass), ragmanLevel);

                    plates.push(armPlate);

                    this.Logger.debug(`[RealisticPlates] Created arm plate ${armPlate._id}`);
                }

                if (this.isPlateAllowed(armorClass, "Stomach", material)) {
                    const stomachPlate = this.mkStomachPlate(armorClass, material);

                    // Create the handbook descriptions so the items actually exist to the game.
                    this.database.locales.global["en"][`${stomachPlate._id} Name`] = `Class ${armorClass} ${material == "ArmoredSteel" ? "Steel" : material} Stomach Plate`;
                    this.database.locales.global["en"][`${stomachPlate._id} ShortName`] = `L${armorClass} S. Plate`;
                    this.database.locales.global["en"][`${stomachPlate._id} Description`] = `${material == "ArmoredSteel" ? "Steel" : material} multi-hit ballistic plate of level ${armorClass} protection designed as an additive for plate carriers to also protect the stomach, that is, if the carrier is large enough to fit it.`;

                    // TODO(gaylatea): Add a material modifier to the cost?
                    this.addPlateToRagman(stomachPlate, (12400 * armorClass), ragmanLevel);

                    plates.push(stomachPlate);

                    this.Logger.debug(`[RealisticPlates] Created arm plate ${stomachPlate._id}`);
                }

                if (this.isPlateAllowed(armorClass, "Thorax", material)) {
                    const thoraxPlate = this.mkThoraxPlate(armorClass, material);

                    // Create the handbook descriptions so the items actually exist to the game.
                    this.database.locales.global["en"][`${thoraxPlate._id} Name`] = `Class ${armorClass} ${material == "ArmoredSteel" ? "Steel" : material} Ballistic Plate`;
                    this.database.locales.global["en"][`${thoraxPlate._id} ShortName`] = `L${armorClass} Plate`;
                    this.database.locales.global["en"][`${thoraxPlate._id} Description`] = `${material == "ArmoredSteel" ? "Steel" : material} multi-hit ballistic plate of level ${armorClass} protection designed for use in a plate carrier to protect the vitals.`;

                    // TODO(gaylatea): Add a material modifier to the cost?
                    this.addPlateToRagman(thoraxPlate, (22401 * armorClass), ragmanLevel);

                    plates.push(thoraxPlate);

                    this.Logger.debug(`[RealisticPlates] Created arm plate ${thoraxPlate._id}`);
                }
            }
        }

        return plates;
    }

    private mkCarrierSlot(id: string, mod: string, name: string, allowedItems: string[]): Slot {
        return {
            _name: `mod_equipment${mod}`,
            _id: `${id}_${name}PlateSlot`,
            _parent: id,
            _props: {
                filters: [{
                    Filter: allowedItems,
                }],
            },
            _required: false,
            _mergeSlotWithChildren: true,
            // XXX(gaylatea): It's unknown what this actually does, and even some of BSG's items don't include it.
            //                I've set it to this value as a default but this might need to change.
            _proto: id,
        };
    }

    private tweakCarriers(plates: ITemplateItem[]) {
        Object.entries(this.database.templates.items).filter(([id, carrier]) => {
            // This replicates the original filter that the mod used to have, which changes every body armor
            // and vest no matter what. This can be useful if you have mods that add armors that you'd like to
            // use with plates.
            if (!config.onlyTweakPlateCarriers) {
                return (
                    (carrier._parent == HANDBOOK_ARMOR_VEST && !id.includes("plate") && carrier._props.armorClass != 0) ||
                    (carrier._parent == HANDBOOK_BODY_ARMOR && !id.includes("plate") && carrier._props.armorClass != 0)
                );
            }

            // Only return items that would reasonably actually use ballistic plates like the ones created by this mod.
            return config.knownPlateCarriers.includes(id);
        }).map(([id, carrier]) => {
            // Determine what plate slots the carrier has available to it.
            // A thorax plate will always be available, but we try to use arm and stomach plates too if BSG includes them in the
            // armor for the base equipment.
            const hasStomachSlot = carrier._props.armorZone.includes("Stomach");
            const hasArms = carrier._props.armorZone.includes("LeftArm");

            const thoraxPlates = plates.filter((plate) => { return plate._props.armorZone.includes("Thorax"); }).map((plate) => { return plate._id; });
            const stomachPlates = plates.filter((plate) => { return plate._props.armorZone.includes("Stomach"); }).map((plate) => { return plate._id; });
            const armPlates = plates.filter((plate) => { return plate._props.armorZone.includes("LeftArm"); }).map((plate) => { return plate._id; });

            const slots: Slot[] = [
                this.mkCarrierSlot(id, "", "main", thoraxPlates),
                ...(hasStomachSlot ? [this.mkCarrierSlot(id, "_000", "stomach", stomachPlates)] : []),
                ...(hasArms ? [this.mkCarrierSlot(id, "_001", "arms", armPlates)] : []),
            ];

            // The carrier item is now really just bling.
            // TODO(gaylatea): Make some item tweaks to differentiate items a little more? 
            _.merge(carrier, {
                _props: {
                    armorZone: [],
                    Weight: (carrier._props.Weight * 0.25),
                    Durability: 1,
                    MaxDurability: 1,
                    armorClass: 0,
                    speedPenaltyPercents: 0,
                    mousePenaltys: 0,
                    weaponErgonomicPenaltys: 0,
                    BluntThroughputs: 0,
                    MergesWithChildrens: false,
                    Slots: slots,
                },
            });

            // Drop the price since the cost of plates is no longer included.
            for (const trader in this.database.traders) {
                // TODO(gaylatea): Figure out how to adjust flea market prices?
                if (trader == "ragfair") { continue; }

                if (this.database.traders[trader].assort.barter_scheme[id] !== undefined) {
                    this.database.traders[trader].assort.barter_scheme[id][0][0].count *= 0.2;
                }
            }

            this.Logger.debug(`[RealisticPlates] Carrier ${id} can now use plates.`);

            _.merge(this.database.templates.items, { id: carrier });

            // Modify the bots to allow them to equip the new carrier properly.
            // If you're using this in the default mode this will only really have any effect on PMCs and bosses,
            // since I don't think the default Scav loadouts have any compatible items.
            Object.entries(this.database.bots.types).map(([botType, bot]) => {
                const isScav = (bot.appearance.body[SCAV_BODY_PART] != null);

                bot.chances.mods.mod_equipment = isScav ? config.bots.scav.thoraxPlateChance : config.bots.pmcOrBoss.thoraxPlateChance;
                bot.chances.mods.mod_equipment_000 = isScav ? config.bots.scav.stomachPlateChance : config.bots.pmcOrBoss.stomachPlateChance;
                bot.chances.mods.mod_equipment_001 = isScav ? config.bots.scav.armPlateChance : config.bots.pmcOrBoss.armPlateChance;

                bot.inventory.mods[id] = {
                    mod_equipment: thoraxPlates,
                    ...(hasStomachSlot && { mod_equipment_000: stomachPlates }),
                    ...(hasArms && { mod_equipment_001: armPlates }),
                };

                _.merge(this.database.bots.types, { botType: bot });
            });
        });
    };
}

module.exports = { mod: new RealisticPlates() };