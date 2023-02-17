using BepInEx;
using System;
using System.Collections.Generic;

using EFT.InventoryLogic;

namespace PlateTaxonomyPatch
{
    public class ArmorPlateClass : ArmorClass
    {
        public ArmorPlateClass(string id, GClass2188 template) : base(id, template) { }
        public static Item Make(string id, object template)
        {
            return new ArmorPlateClass(id, (GClass2188)template);
        }
    }

    public class ArmorPlateThoraxClass : ArmorPlateClass
    {
        public ArmorPlateThoraxClass(string id, GClass2188 template) : base(id, template) { }
        public static new Item Make(string id, object template)
        {
            return new ArmorPlateThoraxClass(id, (GClass2188)template);
        }
    }

    public class ArmorPlateStomachClass : ArmorPlateClass
    {
        public ArmorPlateStomachClass(string id, GClass2188 template) : base(id, template) { }
        public static new Item Make(string id, object template)
        {
            return new ArmorPlateStomachClass(id, (GClass2188)template);
        }
    }

    public class ArmorPlateArmsClass : ArmorPlateClass
    {
        public ArmorPlateArmsClass(string id, GClass2188 template) : base(id, template) { }
        public static new Item Make(string id, object template)
        {
            return new ArmorPlateArmsClass(id, (GClass2188)template);
        }
    }

    [BepInPlugin("com.gaylatea.armor", "SPT-Armor", "1.0.0")]
    public class Plugin : BaseUnityPlugin
    {
        private Dictionary<string, Func<string, object, Item>> itemConstructors = new Dictionary<string, Func<string, object, Item>>{
            {
                "armor_plate",
                new Func<string, object, Item>(ArmorPlateClass.Make)
            },
            {
                "armor_plate_arms",
                new Func<string, object, Item>(ArmorPlateArmsClass.Make)
            },
            {
                "armor_plate_thorax",
                new Func<string, object, Item>(ArmorPlateThoraxClass.Make)
            },
            {
                "armor_plate_stomach",
                new Func<string, object, Item>(ArmorPlateStomachClass.Make)
            },
        };

        public readonly Dictionary<string, Type> TemplateTypeTable = new Dictionary<string, Type>
        {
            {
                "armor_plate",
                typeof(GClass2188)
            },
            {
                "armor_plate_thorax",
                typeof(GClass2188)
            },
            {
                "armor_plate_stomach",
                typeof(GClass2188)
            },
            {
                "armor_plate_arms",
                typeof(GClass2188)
            },
        };

        public readonly Dictionary<string, Type> TypeTable = new Dictionary<string, Type>
    {
        {
            "armor_plate",
            typeof(ArmorPlateClass)
        },
        {
            "armor_plate_thorax",
            typeof(ArmorPlateThoraxClass)
        },
        {
            "armor_plate_stomach",
            typeof(ArmorPlateStomachClass)
        },
        {
            "armor_plate_arms",
            typeof(ArmorPlateArmsClass)
        },
    };

        void Awake()
        {
            TemplateIdToObjectMappingsClass.TypeTable.AddRange(TypeTable);
            TemplateIdToObjectMappingsClass.ItemConstructors.AddRange(itemConstructors);
            TemplateIdToObjectMappingsClass.TemplateTypeTable.AddRange(TemplateTypeTable);
        }
    }
}