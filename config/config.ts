const config = {
    onlyTweakPlateCarriers: true,
    knownPlateCarriers: [
        "5c0e655586f774045612eeb2",
        "544a5caa4bdc2d1a388b4568",
        "5b44cad286f77402a54ae7e5",
        "5c0e746986f7741453628fe5",
        "5d5d87f786f77427997cfaef",
        "5e4abb5086f77406975c9342",
        "5e4ac41886f77406a511c9a8",
        "5fd4c474dd870108a754b241",
        "6038b4b292ec1c3103795a0b",
        "6038b4ca92ec1c3103795a0d",
        "609e860ebd219504d8507525",
        "60a3c68c37ea821725773ef5",
        "60a3c70cde5f453f634816a3",
        "61bc85697113f767765c7fe7",
        "61bcc89aef0f505f0c6cd0fc",
        "628b9784bcf6e2659e09b8a2",
        "628b9c7d45122232a872358f",
        "628cd624459354321c4b7fa2",
        "628dc750b910320f4c27a732",
        "5c0e722886f7740458316a57",
        "5ab8dced86f774646209ec87",
    ],
    onlyAllowSpecifiedPlates: true,
    plates: {
        "2": {
            "Arms": ["Aramid"],
        },
        "4": {
            "Thorax": ["Ceramic", "Combined"],
            "Stomach": ["Ceramic", "Combined"],
        },
        "5": {
            "Thorax": ["UHMWPE"],
            "Stomach": ["UHMWPE"],
        },
        "6": {
            "Thorax": ["ArmoredSteel"],
        }
    },
    basePlateWeight: 3.5,
    baseArmPlateWeight: 0.5,
    materials: {
        "Aluminium": {
            weightMultiplier: 1,
            speedPenaltyMultiplier: 1.05,
            mousePenaltyMultipler: 1.05,
            noise: "gear_armor",
            ergonomicPenaltyMultiplier: 1.05,
            bluntThroughput: 0.4
        },
        "Aramid": {
            weightMultiplier: 1,
            speedPenaltyMultiplier: 1.05,
            mousePenaltyMultipler: 1.05,
            noise: "gear_armor",
            ergonomicPenaltyMultiplier: 1.05,
            bluntThroughput: 0.4
        },
        "ArmoredSteel": {
            weightMultiplier: 1.3,
            speedPenaltyMultiplier: 1.05,
            mousePenaltyMultipler: 1.05,
            noise: "container_metal",
            ergonomicPenaltyMultiplier: 1.2,
            bluntThroughput: 0.2
        },
        "Ceramic": {
            weightMultiplier: 1.15,
            speedPenaltyMultiplier: 1.05,
            mousePenaltyMultipler: 1.05,
            noise: "container_metal",
            ergonomicPenaltyMultiplier: 1.1,
            bluntThroughput: 0.2
        },
        "Combined": {
            weightMultiplier: 1.2,
            speedPenaltyMultiplier: 1.1,
            mousePenaltyMultipler: 1.1,
            noise: "gear_helmet",
            ergonomicPenaltyMultiplier: 1.08,
            bluntThroughput: 0.2
        },
        "Glass": {
            weightMultiplier: 1,
            speedPenaltyMultiplier: 1.05,
            mousePenaltyMultipler: 1.05,
            noise: "gear_armor",
            ergonomicPenaltyMultiplier: 1.05,
            bluntThroughput: 0.4
        },
        "Titan": {
            weightMultiplier: 1,
            speedPenaltyMultiplier: 1.05,
            mousePenaltyMultipler: 1.05,
            noise: "container_metal",
            ergonomicPenaltyMultiplier: 1.05,
            bluntThroughput: 0.4
        },
        "UHMWPE": {
            weightMultiplier: 1,
            speedPenaltyMultiplier: 1.1,
            mousePenaltyMultipler: 1.05,
            noise: "gear_helmet",
            ergonomicPenaltyMultiplier: 1.05,
            bluntThroughput: 0.2
        }
    },
    bots: {
        pmcOrBoss: {
            thoraxPlateChance: 100,
            stomachPlateChance: 60,
            armPlateChance: 100
        },
        scav: {
            thoraxPlateChance: 5,
            stomachPlateChance: 2,
            armPlateChance: 0
        }
    }
};
export default config;