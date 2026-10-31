export function AffixHeading({
  affix,
  as: Tag = 'h3',
  className = 'text-xl sm:text-2xl',
  nameClassName = 'text-gold-bright',
  align = 'center',
}) {
  if (!affix) return null

  return (
    <div className={`flex flex-col gap-1 ${align === 'left' ? 'items-start' : 'items-center'}`}>
      <Tag className={`font-display font-black tracking-[0.1em] uppercase ${nameClassName} ${className}`}>
        {affix.name}
      </Tag>
      {affix.subRoll ? (
        <p className="font-ui text-sm tracking-[0.28em] text-gold uppercase">{affix.subRoll}</p>
      ) : null}
    </div>
  )
}
