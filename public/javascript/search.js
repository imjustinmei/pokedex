let sprite;
let shiny;

async function search(pokemon) {
  const cache = await caches.open('pokemon');
  const cached = (await cache.match('/' + pokemon)) || (await cache.match('https://pokeapi.co/api/v2/pokemon/' + pokemon + '/'));
  if (cached) return render(await cached.json());

  try {
    const data = await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemon + '/').then((res) => res.json());
    const formatted = {
      height: data.height,
      weight: data.weight,
      id: '#' + String(data.id).padStart(4, '0'),
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      icon: data.sprites['front_default'],
      stats: data.stats.map((item) => {
        return {
          ...item,
          stat: {
            ...item.stat,
            name: item.stat.name.charAt(0).toUpperCase() + item.stat.name.slice(1),
          },
        };
      }),
      sprite: data.sprites.other['official-artwork'].front_default,
      types: data.types.map((slot) => slot.type.name.charAt(0).toUpperCase() + slot.type.name.slice(1)),
    };

    (async () => {
      await cache.put(data.name, new Response(JSON.stringify(formatted)));
      await cache.put('https://pokeapi.co/api/v2/pokemon/' + data.id + '/', new Response(JSON.stringify(formatted)));
    })();
    render(formatted);
  } catch (error) {
    window.location.href = '/error';
  }
}

function render(pokemon) {
  let card = document.getElementById('card');

  let image = document.createElement('img');
  image.id = 'image';
  image.src = pokemon.sprite;
  image.alt = pokemon.name;

  let bottom = document.createElement('div');
  bottom.className = 'bottom';
  let name = document.createElement('p');
  name.className = 'name';
  name.innerHTML = pokemon.name + ' - ' + pokemon.id;
  bottom.append(name);

  let types = document.createElement('div');
  types.className = 'types';
  pokemon.types.forEach((type) => {
    let t = document.createElement('p');
    t.className = type;
    t.innerHTML = type;
    types.append(t);
  });
  bottom.append(types);

  let attributes = document.createElement('div');
  attributes.className = 'attributes';
  attributes.innerHTML = 'Height: ' + (pokemon.height / 10 + ' m Weight: ') + (pokemon.weight / 10 + ' kg');

  let stats = document.getElementById('stats');
  pokemon.stats.forEach((item) => {
    let stat = document.createElement('div');
    stat.className = 'stat';
    let statName = document.createElement('p');
    statName.classList.add('statName');
    statName.innerHTML = item.stat.name + ': ' + item['base_stat'];
    let bar = document.createElement('div');
    bar.classList.add('bar', item.stat.name);
    bar.id = item.stat.name;
    bar.style = '--width: ' + item['base_stat'];
    stat.append(statName);
    stat.append(bar);
    stats.append(stat);
  });

  card.append(image);
  bottom.append(types);
  card.append(bottom);
  card.append(attributes);
  document.getElementById('favicon').href = pokemon.icon;
  sprite = pokemon.sprite;
  shiny = sprite.replace('/official-artwork/', '/official-artwork/shiny/');
}

search(pokemon);

window.addEventListener('click', function (event) {
  let image = document.getElementById('image');
  if (image.contains(event.target)) image.src = image.src === sprite ? shiny : sprite;
});
