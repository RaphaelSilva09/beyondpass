const filters = document.querySelector('.filters')
const filterButtons = [...filters.querySelectorAll('button')]
const experiences = [...document.querySelectorAll('.experience')]
const status = document.querySelector('#filter-status')

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
    experience.hidden = !matches
    if (matches) visibleCount += 1
  }

  status.textContent = visibleCount === 1
    ? '1 experiência exibida.'
    : `${visibleCount} experiências exibidas.`
})

filters.hidden = false
