import { container, DependencyContainer, inject, injectable } from "tsyringe";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { ITemplateItem, Props, Slot } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { IAirdropConfig } from "@spt-aki/models/spt/config/IAirdropConfig";

import merge from "lodash.merge";
import { basename, dirname } from "path";

// Needed for monkeypatching base class support for pre-3.5.1 servers.
import { ItemBaseClassService } from "@spt-aki/services/ItemBaseClassService";
import { BotEquipmentModGenerator } from "@spt-aki/generators/BotEquipmentModGenerator";

import { config, CarrierDefault } from "./config";

const PLATE_THORAX_BASE_ITEM = "armor_plate_thorax";
const PLATE_STOMACH_BASE_ITEM = "armor_plate_stomach";
const PLATE_ARMS_BASE_ITEM = "armor_plate_arms";


/**
 * The Armor Mod hooks into the generation of plate carrier items and makes them
 * compatible with removable plates, allowing for both a wider variation on
 * armor values seen in the game, as well as potential resupply in the field.
 */
@injectable()
class Armor implements IPreAkiLoadMod, IPostDBLoadMod {
    constructor(
        @inject("DatabaseServer") protected dbServer: DatabaseServer,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("ImporterUtil") protected importer: ImporterUtil,
        @inject("PreAkiModLoader") protected modLoader: PreAkiModLoader,
        @inject("ConfigServer") protected configServer: ConfigServer,
    ) { }

    /**
     * This hook is needed because until 3.5.1 lands, the mod generation code
     * will refuse to consider base classes for equipment filters.
     *
     * See https://dev.sp-tarkov.com/SPT-AKI/Server/pulls/3186 for more details.
     * Once that is released, I can remove this code.
     */
    public preAkiLoad(container: DependencyContainer) {
        container.afterResolution("BotEquipmentModGenerator", (_t, result: BotEquipmentModGenerator) => 
        {
            const originalFn = result["isModValidForSlot"].bind(result);
            result["isModValidForSlot"] = (modToAdd: [boolean, ITemplateItem],
                itemSlot: Slot,
                modSlot: string,
                parentTemplate: ITemplateItem): boolean => {
                    const baseClassService = container.resolve<ItemBaseClassService>("ItemBaseClassService");

                    const originalValidCheck = originalFn(modToAdd, itemSlot, modSlot, parentTemplate);
                    if(!originalValidCheck) {
                        return baseClassService.itemHasBaseClass(modToAdd[1]._id, itemSlot._props.filters[0].Filter);
                    }

                    return originalValidCheck;
                };
        }, {frequency: "Always"});
    }

    public postDBLoad(_container: DependencyContainer) {
        const serverDB = this.dbServer.getTables();

        const modName = basename(dirname(__dirname.split('/').pop()));
        const modDB: any = this.importer.loadRecursive(`user/mods/${modName}/database/`);

        Object.assign(serverDB.templates.items, modDB.db.templates.items);
        Object.assign(serverDB.templates.handbook.Items, modDB.db.templates.handbook.Items);
        Object.assign(serverDB.templates.prices, modDB.db.templates.prices);
        Object.assign(serverDB.locales.global["en"], modDB.db.locales.global["en"]);
        this.logger.success("[Armor] Plates are now available for use in carriers.");


        for(const trader in modDB.traders) {
            Object.assign(serverDB.traders[trader].assort.barter_scheme, modDB.traders[trader].assort.barter_scheme);
            Object.assign(serverDB.traders[trader].assort.loyal_level_items, modDB.traders[trader].assort.loyal_level_items);
            serverDB.traders[trader].assort.items.push(...modDB.traders[trader].assort.items);
        }
        this.logger.success("[Armor] Trader deals for plates have been added.")

        this.tweakVanillaCarriers();
        this.logger.success("[Armor] Vanilla carrier items are now able to use plates.");

        this.enableAirdrops();
        this.logger.success("[Armor] Airdrops are modified to spawn plates.");
    }

    private enableAirdrops() {
        const airConf = this.configServer.getConfig<IAirdropConfig>(ConfigTypes.AIRDROP);
        airConf.loot.itemTypeWhitelist.push("armor_plate");
    }

    /**
     * Constructs the right plate ID for bosses to keep their default plates
     * when they are equipped with armor.
     * 
     * @param slot What slot the armor is for.
     * @param kind What material and class the armor should generate with.
     * 
     * @returns An item ID usable for bot generation.
     */
    private mkDefaultCarrierPlateID(slot: string, kind: CarrierDefault): string {
        return `armor_plate_vi_${slot}_${kind.defaultArmorClass}_${kind.defaultArmorMaterial}`;
    }

    /**
     * Allow an item to equip plates, both for players and for bots.
     * 
     * @param carrier           An item loaded from the DB that will be modified.
     * @param hasStomachSlot    Should stomach armor be enabled?
     * @param hasArmsSlot       Should arm armor be enabled?
     * @param defaults          What should a boss wearing this armor be equipped with?
     * 
     * @returns The modified armor item, which is added to the DB for you.
     */
    public enablePlates(carrier: ITemplateItem, hasStomachSlot: boolean, hasArmsSlot: boolean, defaults: CarrierDefault): ITemplateItem {
        const db = this.dbServer.getTables();

        const defaultThoraxPlate = this.mkDefaultCarrierPlateID("thorax", defaults)
        const defaultStomachPlate = this.mkDefaultCarrierPlateID("stomach", defaults)
        const defaultArmPlate = this.mkDefaultCarrierPlateID("arm", defaults)

        const slots: Slot[] = [
            this.mkCarrierSlot(carrier._id, "", "main", [PLATE_THORAX_BASE_ITEM]),
            ...(hasStomachSlot ? [this.mkCarrierSlot(carrier._id, "_000", "stomach", [PLATE_STOMACH_BASE_ITEM])] : []),
            ...(hasArmsSlot ? [this.mkCarrierSlot(carrier._id, "_001", "arms", [PLATE_ARMS_BASE_ITEM])] : []),
        ];

        // Remove any extant armor properties/slots.
        merge(carrier._props, {
            armorZone: [],
            armorClass: 0,
            Durability: 1,
            MaxDurability: 1,
            Slots: slots,
            speedPenaltyPercent: 0,
            mousePenalty: 0,
            weaponErgonomicPenalty: 0,
            BluntThroughput: 0,
        } as Props);

        // Modify the bots to allow them to equip the carrier properly.
        Object.entries(db.bots.types).map(([botType, bot]) => {
            // Bosses will always have their normal armor setup.
            const isBoss = config.bots.knownBosses.includes(botType);

            const thoraxChance = isBoss ? 100 : config.bots.thoraxPlateChance;
            const stomachChance = isBoss ? 100 : config.bots.stomachPlateChance;
            const armChance = isBoss ? 100 : config.bots.armPlateChance;

            bot.chances.mods.mod_equipment = thoraxChance;
            bot.chances.mods.mod_equipment_000 = stomachChance;
            bot.chances.mods.mod_equipment_001 = armChance;

            const thoraxPlateItem = isBoss ? defaultThoraxPlate : PLATE_THORAX_BASE_ITEM;
            const stomachPlateItem = isBoss ? defaultStomachPlate : PLATE_STOMACH_BASE_ITEM;
            const armPlateItem = isBoss ? defaultArmPlate : PLATE_ARMS_BASE_ITEM;

            bot.inventory.mods[carrier._id] = {
                mod_equipment: [thoraxPlateItem],
                ...(hasStomachSlot && { mod_equipment_000: [stomachPlateItem] }),
                ...(hasArmsSlot && { mod_equipment_001: [armPlateItem] }),
            };
        });

        return carrier;
    }

    /**
     * Changes each carrier item to reflect that it no longer has plates
     * installed by default.
     */
    private tweakVanillaCarriers() {
        const database = this.dbServer.getTables();

        Object.entries(config.vanillaPlateCarriers).map(([id, defaults]) => {
            let carrier = database.templates.items[id];
            // Determine what plate slots the carrier has available to it.
            // A thorax plate will always be available, but we try to use arm and stomach plates too
            // if armor zones are included.
            const hasStomachSlot = carrier._props.armorZone.includes("Stomach");
            const hasArms = carrier._props.armorZone.includes("LeftArm");

            carrier = this.enablePlates(carrier, hasStomachSlot, hasArms, defaults);

            // The carrier item is now really just bling.
            // TODO(gaylatea): Make some item tweaks to differentiate items a little more? 
            carrier._props.Weight = (carrier._props.Weight * 0.05);

            // Drop the price since the cost of plates is no longer included.
            for (const trader in database.traders) {
                if (trader === "ragfair") { continue; }

                if (database.traders[trader].assort?.barter_scheme[id] !== undefined) {
                    database.traders[trader].assort.barter_scheme[id][0][0].count *= 0.05;
                }
            }
        });
    }

    /**
     * Constructs a slot item suitable for a plate carrier.
     * 
     * @param id           What carrier to enable the slot on.
     * @param mod          Internal ID of the slot.
     * @param name         The name of the slot.
     * @param allowedItems What item parent IDs are allowed to be equipped.
     * 
     * @returns A correctly formatted slot that can be added to the carrier item.
     */
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
            _proto: id,
        };
    }
}

container.registerSingleton(Armor);
export const mod = container.resolve(Armor);