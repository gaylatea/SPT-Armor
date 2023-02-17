import { container, DependencyContainer, inject, injectable } from "tsyringe";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { ITemplateItem, Props, Slot } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { IAirdropConfig } from "@spt-aki/models/spt/config/IAirdropConfig";

import merge from "lodash.merge";
import { basename, dirname } from "path";

import {config, CarrierDefault} from "./config";

const PLATE_THORAX_BASE_ITEM = "armor_plate_thorax";
const PLATE_STOMACH_BASE_ITEM = "armor_plate_stomach";
const PLATE_ARMS_BASE_ITEM = "armor_plate_arms";

@injectable()
class Armor implements IPostDBLoadMod {
    constructor(
        @inject("DatabaseServer") protected dbServer: DatabaseServer,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("ImporterUtil") protected importer: ImporterUtil,
        @inject("PreAkiModLoader") protected modLoader: PreAkiModLoader,
        @inject("ConfigServer") protected configServer: ConfigServer,
    ) { }

    public postDBLoad(container: DependencyContainer) {
        const serverDB = this.dbServer.getTables();

        const modName = basename(dirname(__dirname.split('/').pop()));
        const modDB: any = this.importer.loadRecursive(`user/mods/${modName}/database/`);

        merge(serverDB, modDB.db);
        this.logger.success("[Armor] Plates are now available for use in carriers.");

        merge(serverDB.traders, modDB.traders);
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

    private mkDefaultCarrierPlateID(slot: string, kind: CarrierDefault): string {
        return `armor_plate_vi_${slot}_${kind.defaultArmorClass}_${kind.defaultArmorMaterial}`;
    }

    /**
     * Allow an item to equip plates, both for players and for bots.
     * 
     * @param carrier An item to enable plate support on.
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