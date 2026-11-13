const filters = document.querySelector('.filters')
const filterButtons = [...filters.querySelectorAll('button')]
const experiences = [...document.querySelectorAll('.experience')]
const status = document.querySelector('#filter-status')
const motion = matchMedia('(prefers-reduced-motion: no-preference)')
const hero = document.querySelector('.hero-media img')

if (motion.matches) {
  if (hero.complete && hero.naturalWidth) hero.classList.add('is-ready')
  else hero.addEventListener('load', () => hero.classList.add('is-ready'), { once: true })
}

filters.addEventListener('click', (event) => {
  const selected = event.target.closest('button[data-filter]')
  if (!selected || selected.getAttribute('aria-pressed') === 'true') return

  const category = selected.dataset.filter
  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button === selected))
  }

  let visibleCount = 0
  for (const experience of experiences) {
    const matches = category === 'todos' || experience.dataset.category === category
    experience.getAnimations?.().forEach(animation => animation.cancel())
    experience.hidden = !matches
    if (!matches) continue

    if (motion.matches) {
      experience.animate?.(
        [{ opacity: .45, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 245, delay: visibleCount * 22, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' },
      )
    }
    visibleCount += 1
  }

  status.textContent = visibleCount === 1
    ? status.dataset.singular
    : status.dataset.plural.replace('{count}', String(visibleCount))
})

filters.hidden = false

for (const link of document.querySelectorAll('.language-switch a')) {
  link.addEventListener('click', () => { link.hash = window.location.hash })
}
