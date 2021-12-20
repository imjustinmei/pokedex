var calling = false;
window.onscroll = function (ev) {
  if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
    if (calling === false) {
      calling = true;
      axios.post('/next').then((newPokemon) => {
        newPokemon.data.pokemon.forEach((pokemon) => {
          // card
          let card = document.createElement('div');
          card.className = 'card';

          //id
          let id = document.createElement('div');
          id.className = 'id';
          id.innerHTML = '# ' + pokemon.id;

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
          document.getElementById('container').append(card);
        });
      });
      setTimeout(() => {
        calling = false;
      }, 250);
    }
  }
};
