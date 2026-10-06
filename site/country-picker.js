function countryContent(country) {
  const flag = document.createElement('img');
  flag.src = `./flags/${country.code.toLowerCase()}.svg`;
  flag.alt = '';
  flag.className = 'country-flag';
  flag.width = 24;
  flag.height = 18;
  const name = document.createElement('span');
  name.textContent = country.name;
  return [flag, name];
}

export class CountryPicker {
  constructor(container) {
    this.container = container;
    this.trigger = container.querySelector('#country');
    this.list = container.querySelector('#country-options');
    this.countries = [];
    this.activeIndex = 0;
    this.search = '';
    this.lastKeyAt = 0;
    this.trigger.addEventListener('click', () => this.list.hidden ? this.open() : this.close());
    this.trigger.addEventListener('keydown', event => this.onKeyDown(event));
    this.list.addEventListener('click', event => {
      const option = event.target.closest('[role="option"]');
      if (option) this.select(option.dataset.code);
    });
    document.addEventListener('click', event => {
      if (!this.container.contains(event.target)) this.close();
    });
  }

  setCountries(countries, selectedCode = 'DE') {
    this.close();
    this.countries = countries;
    this.list.replaceChildren(...countries.map(country => {
      const option = document.createElement('div');
      option.id = `country-${country.code}`;
      option.className = 'country-option';
      option.setAttribute('role', 'option');
      option.dataset.code = country.code;
      option.replaceChildren(...countryContent(country));
      return option;
    }));
    this.select(selectedCode, false);
  }

  select(code, notify = true) {
    const country = this.countries.find(country => country.code === code);
    if (!country) throw new Error('Unknown destination country.');
    this.trigger.value = code;
    this.trigger.replaceChildren(...countryContent(country));
    for (const option of this.list.children) {
      option.setAttribute('aria-selected', String(option.dataset.code === code));
    }
    this.close();
    if (notify) {
      this.trigger.focus();
      this.trigger.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  open() {
    if (!this.countries.length || this.trigger.matches(':disabled')) return;
    this.list.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.setActive(this.countries.findIndex(country => country.code === this.trigger.value));
  }

  close() {
    this.list.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.removeAttribute('aria-activedescendant');
    this.search = '';
  }

  setActive(index) {
    this.activeIndex = (index + this.countries.length) % this.countries.length;
    for (const [position, option] of [...this.list.children].entries()) {
      option.classList.toggle('active', position === this.activeIndex);
    }
    const active = this.list.children[this.activeIndex];
    this.trigger.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
  }

  onKeyDown(event) {
    if (!this.countries.length) return;
    const { key } = event;
    if (key === 'Tab' || key === 'Escape') {
      this.close();
      return;
    }
    if (['Enter', ' '].includes(key)) {
      event.preventDefault();
      if (this.list.hidden) this.open();
      else this.select(this.countries[this.activeIndex].code);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      const closed = this.list.hidden;
      if (closed) this.open();
      if (key === 'Home') this.setActive(0);
      else if (key === 'End') this.setActive(this.countries.length - 1);
      else if (!closed) this.setActive(this.activeIndex + (key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      if (this.list.hidden) this.open();
      const now = Date.now();
      this.search = now - this.lastKeyAt < 750 ? this.search + key : key;
      this.lastKeyAt = now;
      const normalize = text => text.toLocaleLowerCase('de').normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const index = this.countries.findIndex(country => normalize(country.name).startsWith(normalize(this.search)));
      if (index >= 0) this.setActive(index);
    }
  }
}
