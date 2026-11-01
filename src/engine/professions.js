import { blizzardIcon } from './icons.js'

const PROFESSION_ICONS = {
  Alchemy: blizzardIcon('trade_alchemy'),
  Blacksmithing: blizzardIcon('trade_blacksmithing'),
  Enchanting: blizzardIcon('trade_engraving'),
  Engineering: blizzardIcon('trade_engineering'),
  Herbalism: blizzardIcon('trade_herbalism'),
  Leatherworking: blizzardIcon('inv_misc_armorkit_17'),
  Mining: blizzardIcon('trade_mining'),
  Skinning: blizzardIcon('inv_misc_pelt_wolf_01'),
  Tailoring: blizzardIcon('trade_tailoring'),
}

export function professionIcons(pair) {
  const names = pair?.professions?.filter(Boolean) ?? []
  if (names.length) {
    return names.map((name) => PROFESSION_ICONS[name] ?? pair.icon).filter(Boolean)
  }
  return pair?.icon ? [pair.icon] : []
}

export function identityIconSlots(run) {
  const slots = []
  for (const item of [run.faction, run.class, run.spec, run.race]) {
    if (item?.icon) slots.push({ key: item.id, icon: item.icon })
  }
  if (run.profession) {
    professionIcons(run.profession).forEach((icon, index) => {
      slots.push({ key: `${run.profession.id}-${index}`, icon })
    })
  }
  return slots
}
