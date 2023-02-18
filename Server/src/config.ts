export const config = {
    // This should only affect PMCs or bosses; I don't think any of the
    // default Scav loadouts even include any carriers.
    bots: {
        // Obviously always have a thorax plate since that's kinda
        // the raison d'etre for carriers at their core, to protect
        // the heart. However, just because a chosen carrier has
        // additional slots doesn't mean the person had the resources
        // to fill them all.
        thoraxPlateChance: 100,
        stomachPlateChance: 60,
        armPlateChance: 60,

        // These bots will have their plates forced to their vanilla
        // balance, if they are wearing a compatible carrier. Other
        // bots will use more random equipment.
        knownBosses: [
            "bossbully",
            "bossgluhar",
            "bosskilla",
            "bossknight",
            "bosskojaniy",
            "bosssanitar",
            "bosstagilla",
            "bosszryachiy",
            "exusec",
            "followerbigpipe",
            "followerbirdeye",
            "followerbully",
            "followergluharassault",
            "followergluharscout",
            "followergluharsecurity",
            "followergluharsnipe",
            "followerkojaniy",
            "followersanitar",
            "followertagilla",
            "followerzryachiy",
        ],
    },

    // Only these carriers will be modified at load time, by the mod, to
    // be compatible with the plates system.
    vanillaPlateCarriers: {
        "5c0e655586f774045612eeb2": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "UHMWPE",
        }, // HighCom Trooper TFO body armor (Multicam)
        "544a5caa4bdc2d1a388b4568": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "Combined",
        }, // Crye Precision AVS plate carrier
        "5b44cad286f77402a54ae7e5": {
            defaultArmorClass: 5,
            defaultArmorMaterial: "UHMWPE",
        }, // 5.11 Tactical TacTec plate carrier
        "5c0e746986f7741453628fe5": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "ArmoredSteel",
        }, // WARTECH TV-110 plate carrier rig
        "5d5d87f786f77427997cfaef": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "Combined",
        }, // Ars Arma A18 Skanda plate carrier
        "5e4abb5086f77406975c9342": {
            defaultArmorClass: 6,
            defaultArmorMaterial: "ArmoredSteel",
        }, // LBT-6094A Slick Plate Carrier
        "5e4ac41886f77406a511c9a8": {
            defaultArmorClass: 5,
            defaultArmorMaterial: "UHMWPE",
        }, // Ars Arma CPC MOD.2 plate carrier
        "5fd4c474dd870108a754b241": {
            defaultArmorClass: 6,
            defaultArmorMaterial: "UHMWPE",
        }, // 5.11 Tactical Hexgrid plate carrier
        "6038b4b292ec1c3103795a0b": {
            defaultArmorClass: 6,
            defaultArmorMaterial: "ArmoredSteel",
        }, // LBT-6094A Slick Plate Carrier (Tan)
        "6038b4ca92ec1c3103795a0d": {
            defaultArmorClass: 6,
            defaultArmorMaterial: "ArmoredSteel",
        }, // LBT-6094A Slick Plate Carrier (Olive)
        "609e860ebd219504d8507525": {
            defaultArmorClass: 6,
            defaultArmorMaterial: "Titan",
        }, // Crye Precision AVS MBAV (Tagilla Edition)
        "60a3c68c37ea821725773ef5": {
            defaultArmorClass: 5,
            defaultArmorMaterial: "Combined",
        }, // CQC Osprey MK4A plate carrier (Protection, MTP)
        "60a3c70cde5f453f634816a3": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "Aluminium",
        }, // CQC Osprey MK4A plate carrier (Assault, MTP)
        "61bc85697113f767765c7fe7": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "UHMWPE",
        }, // Eagle Industries MMAC plate carrier (Ranger Green)
        "61bcc89aef0f505f0c6cd0fc": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "Aluminium",
        }, // FirstSpear Strandhogg plate carrier rig (Ranger Green)
        "628b9784bcf6e2659e09b8a2": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "UHMWPE",
        }, // S&S Precision PlateFrame plate carrier (Goons Edition)
        "628b9c7d45122232a872358f": {
            defaultArmorClass: 5,
            defaultArmorMaterial: "Combined",
        }, // Crye Precision CPC plate carrier (Goons Edition)
        "628cd624459354321c4b7fa2": {
            defaultArmorClass: 6,
            defaultArmorMaterial: "Ceramic",
        }, // Tasmanian Tiger SK plate carrier (Multicam Black)
        "628dc750b910320f4c27a732": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "Titan",
        }, // ECLiPSE RBAV-AF plate carrier (Ranger Green)
        "5c0e722886f7740458316a57": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "ArmoredSteel",
        }, // ANA Tactical M1 armored rig
        "5ab8dced86f774646209ec87": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "Titan",
        }, // ANA Tactical M2 armored rig
        "63737f448b28897f2802b874": {
            defaultArmorClass: 5,
            defaultArmorMaterial: "UHMWPE",
        }, // Hexatac HPC Plate Carrier (Multicam Black)
        "639343fce101f4caa40a4ef3": {
            defaultArmorClass: 4,
            defaultArmorMaterial: "UHMWPE",
        }, // Shellback Tactical Banshee plate carrier (A-Tacs AU)
    } as Record<string, CarrierDefault>,
};

export interface CarrierDefault {
    defaultArmorClass: number,
    defaultArmorMaterial: string,
}