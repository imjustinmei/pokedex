async function get(url) {
  const cache = await caches.open('pokemon');

  try {
    // fetch and update urls
    const response = await fetch(url).then((res) => res.json());
    const urls = response.results;
    next = response.next;

    const data = await Promise.all(
      urls.map(async (item) => {
        // check if cached
        const cached = await cache.match(item.url);
        if (cached) return cached.json();

        // otherwise fetch and cache
        const pokemon = await fetch(item.url).then((res) => res.json());
        const formatted = {
          height: pokemon.height,
          weight: pokemon.weight,
          id: '#' + String(pokemon.id).padStart(4, '0'),
          name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
          icon: pokemon.sprites['front_default'],
          stats: pokemon.stats.map((item) => {
            return {
              ...item,
              stat: {
                ...item.stat,
                name: item.stat.name.charAt(0).toUpperCase() + item.stat.name.slice(1),
              },
            };
          }),
          sprite: pokemon.sprites.other['official-artwork'].front_default,
          types: pokemon.types.map((slot) => slot.type.name.charAt(0).toUpperCase() + slot.type.name.slice(1)),
        };

        (async () => {
          await cache.put(pokemon.name, new Response(JSON.stringify(formatted)));
          await cache.put('https://pokeapi.co/api/v2/pokemon/' + pokemon.id + '/', new Response(JSON.stringify(formatted)));
        })();
        return formatted;
      })
    );

    render(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

function render(pokemon) {
  let fragment = new DocumentFragment();
  pokemon.forEach((pokemon) => {
    // card
    let card = document.createElement('div');
    card.className = 'card';
    fragment.append(card);

    //id
    let id = document.createElement('div');
    id.className = 'id';
    id.innerHTML = pokemon.id;

    //link
    let link = document.createElement('a');
    link.href = '/pokemon/' + pokemon.name;

    //image
    let image = document.createElement('img');
    image.className = 'image';
    image.src = pokemon.sprite;
    image.alt = pokemon.name;

    //bottom of card
    let bottom = document.createElement('div');
    bottom.className = 'bottom';
    let name = document.createElement('p');
    name.className = 'name';
    name.innerHTML = pokemon.name;

    //types
    let typeDiv = document.createElement('div');
    typeDiv.className = 'types';
    pokemon.types.forEach((type) => {
      let p = document.createElement('p');
      p.className = type;
      p.innerHTML = type;
      typeDiv.append(p);
    });

    link.append(image);
    bottom.append(name);
    bottom.append(typeDiv);
    card.append(id);
    card.append(link);
    card.append(bottom);
    fragment.append(card);
  });
  document.getElementById('container').append(fragment);
}

let calling = false;

window.onscroll = function (ev) {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
    if (!calling) {
      calling = true;
      get(next);
      setTimeout(() => {
        calling = false;
      }, 250);
    }
  }
};

get(next);
